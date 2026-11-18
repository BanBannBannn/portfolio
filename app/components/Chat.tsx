'use client';
import { useEffect, useRef, useState } from 'react';

type Turn = { role: 'user' | 'assistant'; content: string };

// Must match app/api/chat/route.ts.
const MAX_QUESTION = 300;
const MAX_QUESTIONS = 6;
/** The server ends each answer with this mark and a signature of the conversation. */
const SIG_MARK = '\u001e';

const EMAIL = 'tranvangiaban@gmail.com';
const PHONE = '+84 967 174 978';
const LINKEDIN = 'https://www.linkedin.com/in/bantrandev/';

const SUGGESTIONS = [
  'What backend stack does Bân work with?',
  'Is Bân open to remote roles?',
  'Bân đã làm gì ở HANEXT?',
];

/** Why the chat stopped taking questions, if it has. */
type Stop = null | { kind: 'done' } | { kind: 'limit'; retryAfter: number };

function waitText(seconds: number) {
  if (seconds < 90) return 'in a minute';
  if (seconds < 90 * 60) return `in about ${Math.round(seconds / 60)} minutes`;
  return `in about ${Math.round(seconds / 3600)} hours`;
}

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [limited, setLimited] = useState<{ retryAfter: number } | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Signature of the conversation so far; the server rejects follow-ups without it.
  const sigRef = useRef('');

  const asked = turns.filter(t => t.role === 'user').length;
  const left = MAX_QUESTIONS - asked;
  const stop: Stop = limited
    ? { kind: 'limit', retryAfter: limited.retryAfter }
    : left <= 0 && !busy
      ? { kind: 'done' }
      : null;

  // Focus the input on open; on close, hand focus back to the toggle once it
  // is visible again (it is hidden while the panel is open).
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) toggleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Follow the answer as it streams in.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [turns, error, stop?.kind]);

  // Stop any in-flight answer if the component goes away.
  useEffect(() => () => abortRef.current?.abort(), []);

  function close() {
    setOpen(false);
  }

  // The input is not rendered while the contact card is shown, so focus it
  // after the reset has rendered rather than straight away.
  const focusInputRef = useRef(false);
  useEffect(() => {
    if (focusInputRef.current && inputRef.current) {
      inputRef.current.focus();
      focusInputRef.current = false;
    }
  }, [turns]);

  function newChat() {
    sigRef.current = '';
    focusInputRef.current = true;
    setTurns([]);
    setError('');
    setDraft('');
  }

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy || stop || left <= 0) return;
    if (q.length > MAX_QUESTION) {
      setError(`Please keep questions under ${MAX_QUESTION} characters.`);
      return;
    }

    const before = turns;
    const history: Turn[] = [...turns, { role: 'user', content: q }];
    setTurns([...history, { role: 'assistant', content: '' }]);
    setDraft('');
    setError('');
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    // Put things back so the visitor can retry the same question.
    const undo = (message: string, reset = false) => {
      if (reset) sigRef.current = '';
      setTurns(reset ? [] : before);
      setDraft(q);
      setError(message);
    };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, sig: sigRef.current }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data: { error?: string; scope?: string; retryAfter?: number } = await res.json().catch(() => ({}));

        if (res.status === 429 && data.scope === 'burst') {
          return undo('Please wait a moment before the next question.');
        }
        if (res.status === 429) {
          setTurns(before);
          setDraft(q);
          setLimited({ retryAfter: Number(data.retryAfter) || 3600 });
          return;
        }
        if (res.status === 400 && data.error === 'too_long') {
          return undo(`Please keep questions under ${MAX_QUESTION} characters.`);
        }
        if (res.status === 400) {
          // e.g. a missing signature after an interrupted answer: start over.
          return undo('This conversation was reset. Send your question again.', true);
        }
        if (res.status === 503) {
          return undo(`The assistant is not set up yet. Please email ${EMAIL}.`);
        }
        return undo('Something went wrong. Please try again.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let raw = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        setTurns([...history, { role: 'assistant', content: raw.split(SIG_MARK)[0] }]);
      }
      const [answer, sig = ''] = raw.split(SIG_MARK);
      setTurns([...history, { role: 'assistant', content: answer }]);
      sigRef.current = sig;
    } catch {
      if (controller.signal.aborted) return;
      undo('Connection lost. Please try again.');
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="chat-toggle"
        aria-expanded={open}
        aria-controls="chat-panel"
        onClick={() => (open ? close() : setOpen(true))}
        hidden={open}
      >
        Ask AI about me
      </button>

      {open && (
        <section
          id="chat-panel"
          className="chat"
          role="dialog"
          aria-labelledby="chat-title"
          onKeyDown={e => e.key === 'Escape' && close()}
        >
          <header className="chat-head">
            <div>
              <h2 className="chat-title" id="chat-title">Ask about Bân</h2>
              <p className="chat-note">
                An AI answers from Bân&apos;s own notes and can still be wrong. For anything
                important, email <a className="a" href={`mailto:${EMAIL}`}>{EMAIL}</a>.
              </p>
            </div>
            <button type="button" className="chat-close" onClick={close} aria-label="Close chat">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className="chat-log" ref={logRef} aria-live="polite">
            {turns.length === 0 && !stop && (
              <div className="chat-suggest">
                {SUGGESTIONS.map(s => (
                  <button key={s} type="button" onClick={() => ask(s)}>{s}</button>
                ))}
              </div>
            )}

            {turns.map((t, i) => (
              <p key={i} className={`msg msg--${t.role}`}>
                <span className="sr-only">{t.role === 'user' ? 'You: ' : 'Assistant: '}</span>
                {t.content || <span className="msg-wait">Thinking…</span>}
              </p>
            ))}

            {error && <p className="chat-error" role="alert">{error}</p>}
          </div>

          {stop ? (
            <div className="chat-contact" role="status">
              <p className="chat-contact-text">
                {stop.kind === 'done'
                  ? `That's ${MAX_QUESTIONS} questions, the most for one chat. To keep talking, reach Bân directly:`
                  : `You've reached the chat limit for now (it resets ${waitText(stop.retryAfter)}). To keep talking, reach Bân directly:`}
              </p>
              <div className="chat-contact-links">
                <a className="btn" href={`mailto:${EMAIL}`}>Email Bân</a>
                <a className="a" href={`tel:${PHONE.replaceAll(' ', '')}`}>Call {PHONE}</a>
                <a className="a" href={LINKEDIN} target="_blank" rel="noreferrer">
                  LinkedIn<span className="arrow" aria-hidden="true">↗</span>
                </a>
              </div>
              {stop.kind === 'done' && (
                <button type="button" className="chat-new" onClick={newChat}>Start a new chat</button>
              )}
            </div>
          ) : (
            <form
              className="chat-form"
              onSubmit={e => {
                e.preventDefault();
                ask(draft);
              }}
            >
              <div className="chat-row">
                <label htmlFor="chat-input" className="sr-only">Your question</label>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  rows={1}
                  value={draft}
                  maxLength={MAX_QUESTION}
                  placeholder="Ask about experience, projects, skills…"
                  aria-describedby="chat-meta"
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      ask(draft);
                    }
                  }}
                />
                <button type="submit" className="btn" disabled={busy || !draft.trim()}>
                  Send
                </button>
              </div>
              <p className="chat-meta" id="chat-meta">
                <span data-full={draft.length >= MAX_QUESTION}>
                  {draft.length}/{MAX_QUESTION}
                </span>
                {asked > 0 && left <= 3 && (
                  <span>{left === 1 ? '1 question left' : `${left} questions left`}</span>
                )}
              </p>
            </form>
          )}
        </section>
      )}
    </>
  );
}
