'use client';
import { useEffect, useRef, useState } from 'react';

type Turn = { role: 'user' | 'assistant'; content: string };

const MAX_QUESTION = 500;
const MAX_TURNS = 12;
/** The server ends each answer with this mark and a signature of the conversation. */
const SIG_MARK = '\u001e';

const SUGGESTIONS = [
  'What backend stack does Bân work with?',
  'Is Bân open to remote roles?',
  'Bân đã làm gì ở HANEXT?',
];

const ERRORS: Record<number, string> = {
  429: "You've asked a lot of questions in a short time. Try again later, or email tranvangiaban@gmail.com.",
  503: 'The assistant is not set up yet. Please email tranvangiaban@gmail.com.',
};

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Signature of the conversation so far; the server rejects follow-ups without it.
  const sigRef = useRef('');

  const full = turns.length >= MAX_TURNS - 1;

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
  }, [turns, error]);

  // Stop any in-flight answer if the component goes away.
  useEffect(() => () => abortRef.current?.abort(), []);

  function close() {
    setOpen(false);
  }

  async function ask(question: string) {
    const q = question.trim().slice(0, MAX_QUESTION);
    if (!q || busy || full) return;

    const history: Turn[] = [...turns, { role: 'user', content: q }];
    setTurns([...history, { role: 'assistant', content: '' }]);
    setDraft('');
    setError('');
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let restart = false;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, sig: sigRef.current }),
        signal: controller.signal,
      });

      if (res.status === 400) {
        // The server would not continue this conversation (e.g. a missing
        // signature after an interrupted answer). Start over, keep the question.
        restart = true;
        throw new Error('This conversation was reset. Send your question again.');
      }
      if (!res.ok || !res.body) {
        throw new Error(ERRORS[res.status] ?? 'Something went wrong. Please try again.');
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
    } catch (err) {
      if (controller.signal.aborted) return;
      // Drop the unanswered question so the visitor can retry it as-is.
      if (restart) sigRef.current = '';
      setTurns(restart ? [] : turns);
      setDraft(q);
      setError(err instanceof Error ? err.message : 'Something went wrong.');
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
                important, email <a className="a" href="mailto:tranvangiaban@gmail.com">tranvangiaban@gmail.com</a>.
              </p>
            </div>
            <button type="button" className="chat-close" onClick={close} aria-label="Close chat">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className="chat-log" ref={logRef} aria-live="polite">
            {turns.length === 0 && (
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
            {full && !busy && (
              <p className="chat-error">
                That&apos;s the end of this conversation. Email Bân at tranvangiaban@gmail.com to keep talking.
              </p>
            )}
          </div>

          <form
            className="chat-form"
            onSubmit={e => {
              e.preventDefault();
              ask(draft);
            }}
          >
            <label htmlFor="chat-input" className="sr-only">Your question</label>
            <textarea
              id="chat-input"
              ref={inputRef}
              rows={1}
              value={draft}
              maxLength={MAX_QUESTION}
              placeholder="Ask about experience, projects, skills…"
              disabled={full}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  ask(draft);
                }
              }}
            />
            <button type="submit" className="btn" disabled={busy || full || !draft.trim()}>
              Send
            </button>
          </form>
        </section>
      )}
    </>
  );
}
