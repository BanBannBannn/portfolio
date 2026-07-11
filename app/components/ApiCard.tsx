'use client';
import { useEffect, useRef } from 'react';

const lines = [
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

export default function ApiCard() {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    lines.forEach(({ delay, html }, i) => {
      const t = setTimeout(() => {
        if (!bodyRef.current) return;
        const div = document.createElement('div');
        div.className = 'api-line';
        div.innerHTML = html;
        if (i === lines.length - 1) {
          const cursor = document.createElement('span');
          cursor.className = 'cursor';
          div.appendChild(cursor);
        }
        bodyRef.current.appendChild(div);
      }, delay + 600);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      background: '#0D1B3E', borderRadius: 14,
      overflow: 'hidden', boxShadow: '0 24px 64px rgba(13,27,62,.25)',
      fontFamily: "'JetBrains Mono', monospace", fontSize: '.78rem',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: '#162040',
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
      <div ref={bodyRef} style={{ padding: 20, lineHeight: 2 }} />

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
