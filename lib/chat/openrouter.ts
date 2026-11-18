/**
 * A small streaming client for OpenRouter's chat completions API (OpenAI
 * compatible). No SDK: one fetch, one SSE parser, and only what the chat needs.
 * https://openrouter.ai/docs/api-reference/chat-completion
 *
 * `stopReason` uses the names the rest of the chat (telemetry, admin) already
 * knows: end_turn, max_tokens, tool_use, refusal.
 */
import type { Tokens } from './telemetry';

export type ToolCall = { id: string; type: 'function'; function: { name: string; arguments: string } };

export type ChatMessage =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: ToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string };

export type ToolDef = {
  type: 'function';
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

export type Completion = {
  text: string;
  toolCalls: ToolCall[];
  stopReason: string | null;
  tokens: Tokens;
  /** What OpenRouter says the call cost, when it says so. */
  costUsd?: number;
  id?: string;
};

export type CompletionRequest = {
  model: string;
  messages: ChatMessage[];
  maxTokens: number;
  effort: 'low' | 'medium' | 'high';
  tools?: ToolDef[];
  toolChoice?: 'auto' | 'none';
  signal?: AbortSignal;
};

/** The call failed. `status` is the HTTP status, or undefined for a network error or timeout. */
export class UpstreamError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'UpstreamError';
  }
}

/** Free models can stall; stop before the route's own time limit (maxDuration 30s). */
const TIMEOUT_MS = 27_000;

const FINISH: Record<string, string> = { stop: 'end_turn', length: 'max_tokens', tool_calls: 'tool_use', content_filter: 'refusal' };

export const apiKey = () => process.env.OPENROUTER_API_KEY || '';

function endpoint() {
  const base = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/+$/, '');
  return `${base}/chat/completions`;
}

type Chunk = {
  id?: string;
  error?: { code?: number | string; message?: string };
  choices?: {
    finish_reason?: string | null;
    delta?: {
      content?: string | null;
      tool_calls?: { index?: number; id?: string; function?: { name?: string; arguments?: string } }[];
    };
  }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    cost?: number;
    prompt_tokens_details?: { cached_tokens?: number; cache_write_tokens?: number };
  };
};

/** Streams one completion. `onText` gets each piece of answer text as it arrives. */
export async function streamCompletion(req: CompletionRequest, onText: (s: string) => void): Promise<Completion> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey()}`,
    'Content-Type': 'application/json',
    'X-Title': 'Portfolio chat',
  };
  if (process.env.NEXT_PUBLIC_SITE_URL) headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_SITE_URL;

  const signal = req.signal ? AbortSignal.any([req.signal, AbortSignal.timeout(TIMEOUT_MS)]) : AbortSignal.timeout(TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(endpoint(), {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({
        model: req.model,
        messages: req.messages,
        stream: true,
        max_tokens: req.maxTokens,
        // Thinking tokens count towards max_tokens, so keep them short.
        reasoning: { effort: req.effort },
        ...(req.tools ? { tools: req.tools, tool_choice: req.toolChoice ?? 'auto' } : {}),
      }),
    });
  } catch (err) {
    if (req.signal?.aborted) throw err; // the visitor left; the route handles that
    throw new UpstreamError('connection failed or timed out');
  }
  if (!res.ok || !res.body) {
    await res.body?.cancel().catch(() => {});
    throw new UpstreamError(`HTTP ${res.status}`, res.status);
  }

  const out: Completion = { text: '', toolCalls: [], stopReason: null, tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } };
  const calls: { id: string; name: string; args: string }[] = [];

  const handle = (data: string) => {
    let chunk: Chunk;
    try {
      chunk = JSON.parse(data);
    } catch {
      return; // not ours to understand
    }
    // OpenRouter reports a failure after the stream started as a chunk with `error`.
    if (chunk.error) {
      const code = Number(chunk.error.code);
      throw new UpstreamError('error during stream', Number.isFinite(code) ? code : 502);
    }
    out.id ??= chunk.id;
    const choice = chunk.choices?.[0];
    const delta = choice?.delta;
    // `delta.reasoning` (the model's thinking) is deliberately ignored: visitors only see the answer.
    if (delta?.content) {
      out.text += delta.content;
      onText(delta.content);
    }
    for (const tc of delta?.tool_calls ?? []) {
      const i = tc.index ?? 0;
      calls[i] ??= { id: '', name: '', args: '' };
      if (tc.id) calls[i].id = tc.id;
      if (tc.function?.name) calls[i].name += tc.function.name;
      if (tc.function?.arguments) calls[i].args += tc.function.arguments;
    }
    if (choice?.finish_reason) out.stopReason = FINISH[choice.finish_reason] ?? choice.finish_reason;
    const u = chunk.usage;
    if (u) {
      const cached = u.prompt_tokens_details?.cached_tokens ?? 0;
      const written = u.prompt_tokens_details?.cache_write_tokens ?? 0;
      out.tokens = {
        input: Math.max(0, (u.prompt_tokens ?? 0) - cached - written),
        output: u.completion_tokens ?? 0,
        cacheRead: cached,
        cacheWrite: written,
      };
      if (typeof u.cost === 'number') out.costUsd = u.cost;
    }
  };

  // Server-sent events: blocks separated by a blank line, payload on `data:` lines, `:` lines are keep-alives.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done }).replace(/\r\n?/g, '\n');
      let end: number;
      while ((end = buffer.indexOf('\n\n')) !== -1) {
        const block = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        const data = block
          .split('\n')
          .filter(l => l.startsWith('data:'))
          .map(l => l.slice(5).trimStart())
          .join('\n');
        if (data && data !== '[DONE]') handle(data);
      }
      if (done) break;
    }
    const rest = buffer
      .split('\n')
      .filter(l => l.startsWith('data:'))
      .map(l => l.slice(5).trimStart())
      .join('\n');
    if (rest && rest !== '[DONE]') handle(rest);
  } catch (err) {
    if (err instanceof UpstreamError || req.signal?.aborted) throw err;
    throw new UpstreamError('stream interrupted');
  } finally {
    reader.cancel().catch(() => {});
  }

  out.toolCalls = calls
    .filter(Boolean)
    .map((c, i) => ({ id: c.id || `call_${i}`, type: 'function' as const, function: { name: c.name, arguments: c.args } }));
  // Some providers end a tool-calling turn with "stop"; a cut-off or refused turn keeps its own reason.
  if (out.toolCalls.length && out.stopReason === 'end_turn') out.stopReason = 'tool_use';
  return out;
}
