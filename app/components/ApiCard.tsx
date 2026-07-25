'use client';
import { useEffect, useRef, useState } from 'react';

const bootLines = [
  { delay: 0, html: '<span class="c-brace">{</span>' },
  { delay: 120, html: '&nbsp;&nbsp;<span class="c-key">"name"</span>: <span class="c-str">"Trần Văn Gia Bân"</span>,' },
  { delay: 240, html: '&nbsp;&nbsp;<span class="c-key">"role"</span>: <span class="c-str">"Software Engineer"</span>,' },
  { delay: 360, html: '&nbsp;&nbsp;<span class="c-key">"location"</span>: <span class="c-str">"Ho Chi Minh City, VN"</span>,' },
  { delay: 480, html: '&nbsp;&nbsp;<span class="c-key">"experience"</span>: <span class="c-str">"~2 years"</span>,' },
  { delay: 600, html: '&nbsp;&nbsp;<span class="c-key">"stack"</span>: [' },
  { delay: 700, html: '&nbsp;&nbsp;&nbsp;&nbsp;<span class="c-arr">"ASP.NET Core"</span>, <span class="c-arr">"Spring Boot"</span>,' },
  { delay: 800, html: '&nbsp;&nbsp;&nbsp;&nbsp;<span class="c-arr">"FastAPI"</span>, <span class="c-arr">"NextJS"</span>' },
  { delay: 900, html: '&nbsp;&nbsp;],' },
  { delay: 1000, html: '&nbsp;&nbsp;<span class="c-key">"ai_skills"</span>: [<span class="c-arr">"RAG"</span>, <span class="c-arr">"LLM"</span>, <span class="c-arr">"Vector DB"</span>],' },
  { delay: 1200, html: '&nbsp;&nbsp;<span class="c-key">"open_to_work"</span>: <span class="c-bool">true</span>,' },
  { delay: 1350, html: '&nbsp;&nbsp;<span class="c-key">"status"</span>: <span class="c-str">"actively_interviewing"</span>' },
  { delay: 1500, html: '<span class="c-brace">}</span>' },
];

const HELP = [
  'Available commands:',
  '  help          show this help',
  '  about         short bio',
  '  skills        tech stack',
  '  experience    where I’ve worked',
  '  projects      things I’ve shipped',
  '  contact       get in touch',
  '  whoami        guess who',
  '  sudo hire-me  😉',
  '  clear         clear the terminal',
];

function runCommand(raw: string): { lines: string[]; scrollTo?: string } {
  const cmd = raw.trim().toLowerCase();
  switch (cmd) {
    case '':
      return { lines: [] };
    case 'help':
      return { lines: HELP };
    case 'about':
      return {
        lines: [
          'Trần Văn Gia Bân — Software Engineer, Ho Chi Minh City.',
          '~2 years building REST/GraphQL APIs, AI pipelines & distributed systems.',
        ],
      };
    case 'skills':
      return {
        lines: [
          'C#, Java, Python, TypeScript',
          'ASP.NET Core, Spring Boot, FastAPI, NestJS',
          'PostgreSQL, SQL Server, MongoDB, QdrantDB · Azure, AWS · RAG, LLM',
        ],
      };
    case 'experience':
      return {
        lines: [
          'HANEXT Technology — Software Engineer (Sep 2025 – Apr 2026)',
          'FPT Software — Software Engineer Intern (Jan 2024 – Apr 2024)',
        ],
      };
    case 'projects':
      return {
        lines: [
          '→ WareEase, Smart Menu AI, GameHub, SmartMenuVibe, DevToolBox AI',
          'opening #projects ...',
        ],
        scrollTo: 'projects',
      };
    case 'contact':
      return {
        lines: ['tranvangiaban@gmail.com', '+84 967 174 978', 'opening #contact ...'],
        scrollTo: 'contact',
      };
    case 'whoami':
      return { lines: ['visitor (probably a recruiter, or a curious dev 👀)'] };
    case 'sudo hire-me':
      return {
        lines: ['[sudo] password for visitor: ********', '✔ permission granted.', 'redirecting to #contact ...'],
        scrollTo: 'contact',
      };
    case 'clear':
      return { lines: [] };
    default:
      return { lines: [`command not found: ${raw}`, `type 'help' for a list of commands.`] };
  }
}

type Entry =
  | { kind: 'boot'; html: string }
  | { kind: 'cmd'; text: string }
  | { kind: 'out'; text: string };

export default function ApiCard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [booted, setBooted] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    bootLines.forEach(({ delay, html }, i) => {
      const t = setTimeout(() => {
        setEntries(prev => [...prev, { kind: 'boot', html }]);
        if (i === bootLines.length - 1) setBooted(true);
      }, delay + 600);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [entries]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setTimeout(() => { submittingRef.current = false; }, 0);

    const raw = input;
    if (!raw.trim()) { setInput(''); return; }
    const { lines, scrollTo } = runCommand(raw);
    setHistory(h => [...h, raw]);
    setHistoryIdx(null);
    setInput('');

    if (raw.trim().toLowerCase() === 'clear') {
      setEntries([]);
      return;
    }

    setEntries(prev => [
      ...prev,
      { kind: 'cmd', text: raw },
      ...lines.map((text): Entry => ({ kind: 'out', text })),
    ]);

    if (scrollTo) {
      setTimeout(() => {
        document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      }, 350);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      if (!history.length) return;
      e.preventDefault();
      const idx = historyIdx === null ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(idx);
      setInput(history[idx]);
    } else if (e.key === 'ArrowDown') {
      if (historyIdx === null) return;
      e.preventDefault();
      const idx = historyIdx + 1;
      if (idx >= history.length) { setHistoryIdx(null); setInput(''); }
      else { setHistoryIdx(idx); setInput(history[idx]); }
    }
  };

  return (
    <div
      className="terminal-window"
      style={{
        borderRadius: 16,
        overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.5), 0 0 60px rgba(110,168,255,.08)',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '.78rem',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: 'rgba(255,255,255,.03)',
        borderBottom: '1px solid rgba(255,255,255,.07)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#FF5F57', '#FFBD2E', '#28CA41'].map(c => (
            <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />
          ))}
        </div>
        <div>
          <span style={{ color: '#34d399', fontWeight: 500, fontSize: '.7rem' }}>GET</span>
          <span style={{ color: '#94a3b8', fontSize: '.7rem' }}>&nbsp;/api/developers/giaban</span>
        </div>
        <span style={{ color: '#34d399', fontSize: '.65rem' }}>200 OK</span>
      </div>

      {/* Body */}
      <div ref={bodyRef} className="terminal-body" style={{ padding: 20, lineHeight: 1.9, maxHeight: 340, overflowY: 'auto' }}>
        {entries.map((entry, i) => {
          if (entry.kind === 'boot') {
            return <div key={i} className="api-line" dangerouslySetInnerHTML={{ __html: entry.html }} />;
          }
          if (entry.kind === 'cmd') {
            return (
              <div key={i} style={{ color: '#e2e8f0', marginTop: 6 }}>
                <span style={{ color: '#7dd3fc' }}>visitor@giaban</span>
                <span style={{ color: '#64748b' }}>:~$ </span>
                {entry.text}
              </div>
            );
          }
          return <div key={i} style={{ color: '#94a3b8', whiteSpace: 'pre-wrap' }}>{entry.text}</div>;
        })}

        {booted && (
          <form
            onSubmit={onSubmit}
            style={{ display: 'flex', alignItems: 'center', color: '#e2e8f0', marginTop: 6 }}
          >
            <span style={{ color: '#7dd3fc' }}>visitor@giaban</span>
            <span style={{ color: '#64748b' }}>:~$&nbsp;</span>
            <input
              ref={inputRef}
              className="terminal-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              spellCheck={false}
              placeholder="type 'help'"
              aria-label="Terminal command input"
            />
            <span className="cursor" />
          </form>
        )}
      </div>

      <style>{`
        .c-brace { color: #e2e8f0; }
        .c-key   { color: #7dd3fc; }
        .c-str   { color: #86efac; }
        .c-bool  { color: #f472b6; }
        .c-arr   { color: #c084fc; }
      `}</style>
    </div>
  );
}
