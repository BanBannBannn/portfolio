'use client';
import Reveal from './Reveal';

const experiences = [
  {
    company: 'HANEXT Technology',
    role: 'Backend Developer',
    date: 'Sep 2025 – Apr 2026',
    type: 'full',
    bullets: [
      'Designed and delivered production REST & GraphQL APIs across multiple client projects using Java Spring Boot, FastAPI, and NestJS.',
      'Built AI backend services with Python FastAPI — implemented agent-based logic and integrated QdrantDB for RAG (Retrieval-Augmented Generation) workflows.',
      'Applied SQL and NoSQL databases (PostgreSQL, MSSQL, MongoDB) based on system design requirements.',
      'Bridged backend and frontend (~30%) using Angular and Next.js to accelerate delivery timelines.',
      'Maintained Git workflows, participated in code reviews, and collaborated on architecture decisions with senior engineers.',
    ],
  },
  {
    company: 'FPT Software',
    role: 'Backend Developer Intern',
    date: 'Jan 2024 – Apr 2024',
    type: 'intern',
    bullets: [
      'Gained hands-on experience with Java Spring Boot in an enterprise environment, building and testing RESTful APIs for internal projects.',
      'Adopted professional coding standards, version control practices, and agile team workflows.',
    ],
  },
];

const BagIcon = () => (
  <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
  </svg>
);
const SchoolIcon = () => (
  <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
  </svg>
);

export default function Experience() {
  return (
    <section id="experience" style={{ padding: '100px clamp(20px,6vw,120px)' }}>
      <Reveal>
        <p className="font-mono" style={{ fontSize: '.72rem', fontWeight: 500, color: 'var(--blue)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
          03 / Experience
        </p>
        <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.4rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-1px', marginBottom: 48, lineHeight: 1.15 }}>
          Where I&apos;ve <span style={{ color: 'var(--blue)' }}>built things</span>
        </h2>
      </Reveal>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute', left: 19, top: 8, bottom: 8,
          width: 2, background: 'linear-gradient(to bottom, var(--blue), var(--blue-mid))',
          borderRadius: 2,
        }} />

        {experiences.map(({ company, role, date, type, bullets }, i) => (
          <Reveal key={company} delay={i * 100}>
            <div style={{ display: 'flex', gap: 32, paddingBottom: i < experiences.length - 1 ? 40 : 0 }}>
              {/* Dot */}
              <div style={{
                flexShrink: 0, width: 40, height: 40, borderRadius: '50%',
                background: type === 'full' ? 'var(--blue)' : 'var(--navy)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 1,
                boxShadow: '0 0 0 6px var(--blue-light)',
              }}>
                {type === 'full' ? <BagIcon /> : <SchoolIcon />}
              </div>

              {/* Card */}
              <div
                style={{
                  flex: 1, background: 'var(--surface)', border: '1.5px solid var(--border)',
                  borderRadius: 14, padding: '24px 28px', transition: 'all .25s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--blue-mid)';
                  el.style.boxShadow = 'var(--shadow)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--border)';
                  el.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span className="font-display" style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--navy)' }}>{company}</span>
                  <span className="font-mono" style={{
                    fontSize: '.72rem', color: 'var(--blue)',
                    background: 'var(--blue-light)', padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap',
                  }}>{date}</span>
                </div>
                <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--blue)', marginBottom: 14 }}>{role}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {bullets.map((b, j) => (
                    <li key={j} style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.6, paddingLeft: 16, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: 'var(--blue)', fontSize: '.8rem' }}>→</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
