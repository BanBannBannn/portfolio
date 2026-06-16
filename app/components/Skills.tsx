'use client';
import Reveal from './Reveal';

const skillGroups = [
  { icon: '⚡', title: 'Languages',          tags: ['C#', 'Java', 'Python', 'JavaScript', 'TypeScript'] },
  { icon: '🔧', title: 'Frameworks & APIs',  tags: ['ASP.NET Core', 'Spring Boot', 'FastAPI', 'NestJS', 'Next.js', 'REST', 'GraphQL'] },
  { icon: '🗄️', title: 'Databases',          tags: ['SQL Server', 'PostgreSQL', 'MongoDB', 'QdrantDB'] },
  { icon: '☁️', title: 'Cloud & Services',   tags: ['Azure', 'AWS S3', 'AWS Rekognition', 'Firebase', 'Supabase'] },
  { icon: '🤖', title: 'AI & ML Integration',tags: ['RAG Pipeline', 'Agent-based Logic', 'Vector DB', 'LLM Integration'] },
  { icon: '🛠️', title: 'Tools & Practices',  tags: ['Git / GitHub', 'GitLab', 'CI/CD', 'JWT', 'EF Core'] },
];

function Tag({ label }: { label: string }) {
  return (
    <span
      className="font-mono"
      style={{
        fontSize: '.72rem', color: 'var(--blue)',
        background: 'var(--tag-bg)', padding: '4px 10px',
        borderRadius: 6, border: '1px solid var(--blue-mid)',
        transition: 'all .15s', cursor: 'default',
        display: 'inline-block',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'var(--blue)';
        el.style.color = '#fff';
        el.style.borderColor = 'var(--blue)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'var(--tag-bg)';
        el.style.color = 'var(--blue)';
        el.style.borderColor = 'var(--blue-mid)';
      }}
    >
      {label}
    </span>
  );
}

export default function Skills() {
  return (
    <section id="skills" style={{ padding: '100px clamp(20px,6vw,120px)', background: 'var(--surface)' }}>
      <Reveal>
        <p className="font-mono" style={{ fontSize: '.72rem', fontWeight: 500, color: 'var(--blue)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
          02 / Skills
        </p>
        <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.4rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-1px', marginBottom: 48, lineHeight: 1.15 }}>
          My <span style={{ color: 'var(--blue)' }}>technical toolkit</span>
        </h2>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
        {skillGroups.map(({ icon, title, tags }, i) => (
          <Reveal key={title} delay={i * 60}>
            <div
              style={{
                background: 'var(--bg)', border: '1.5px solid var(--border)',
                borderRadius: 14, padding: 24, transition: 'all .25s', height: '100%',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--blue-mid)';
                el.style.boxShadow = 'var(--shadow-hover)';
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--border)';
                el.style.boxShadow = 'none';
                el.style.transform = 'none';
              }}
            >
              <div style={{ width:40, height:40, borderRadius:10, background:'var(--blue-light)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, fontSize:'1.2rem' }}>
                {icon}
              </div>
              <div className="font-display" style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--navy)', marginBottom: 14 }}>
                {title}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tags.map(t => <Tag key={t} label={t} />)}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
