'use client';
import Reveal from './Reveal';

const stats = [
  { num: '2+', label: 'Years experience' },
  { num: '5+', label: 'Projects shipped' },
  { num: '4',  label: 'Frameworks mastered' },
  { num: '3',  label: 'Languages spoken' },
];

export default function About() {
  return (
    <section id="about" style={{ padding: '100px clamp(20px,6vw,120px)' }}>
      <Reveal>
        <p className="font-mono" style={{ fontSize: '.72rem', fontWeight: 500, color: 'var(--blue)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
          01 / About
        </p>
        <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.4rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-1px', marginBottom: 48, lineHeight: 1.15 }}>
          The engineer <span style={{ color: 'var(--blue)' }}>behind the API</span>
        </h2>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 64, alignItems: 'center' }}>
        {/* Text */}
        <Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              <>I&apos;m a <strong>Backend Developer based in Ho Chi Minh City</strong> with nearly 2 years of hands-on experience crafting APIs that power real products — from warehouse management systems to AI-driven restaurant menus.</>,
              <>At <strong>HANEXT Technology</strong>, I work across the full backend stack — designing REST and GraphQL APIs, building AI services with Python FastAPI, integrating vector databases for RAG pipelines, and deploying to cloud infrastructure.</>,
              <>I care deeply about <strong>clean architecture, developer experience, and systems that don&apos;t break at 3am</strong>. When I&apos;m not writing code, I&apos;m exploring distributed systems concepts and AI backend patterns.</>,
            ].map((text, i) => (
              <p key={i} style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.8 }}>
                {text}
              </p>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 32 }}>
            {stats.map(({ num, label }) => (
              <div key={label} style={{
                background: 'var(--blue-light)', borderRadius: 12, padding: 20,
                border: '1px solid var(--blue-mid)',
              }}>
                <div className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--blue)', lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Avatar */}
        <Reveal delay={150}>
          <div style={{
            aspectRatio: '1', borderRadius: 20, overflow: 'hidden',
            background: 'linear-gradient(135deg,var(--blue-light),var(--blue-mid))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', maxWidth: 360, margin: '0 auto',
          }}>
            <span className="font-display" style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--blue)', opacity: .3, userSelect: 'none' }}>
              GB
            </span>
            <div style={{
              position: 'absolute', bottom: 20, right: 20,
              background: 'var(--surface)', borderRadius: 12, padding: '10px 16px',
              boxShadow: 'var(--shadow)',
              fontSize: '.78rem', fontWeight: 600, color: 'var(--navy)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}/>
              Open to fulltime roles
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
