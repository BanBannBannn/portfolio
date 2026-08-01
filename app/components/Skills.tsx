import Reveal from './Reveal';

const groups: [string, string[]][] = [
  ['Languages', ['C#', 'Java', 'Python', 'TypeScript', 'JavaScript']],
  ['Backend', ['ASP.NET Core', 'Spring Boot', 'FastAPI', 'NestJS', 'REST', 'GraphQL']],
  ['Data', ['PostgreSQL', 'SQL Server', 'MongoDB', 'Qdrant', 'EF Core']],
  ['Cloud', ['Azure', 'AWS S3', 'AWS Rekognition', 'Firebase', 'Supabase']],
  ['AI work', ['RAG pipelines', 'agent logic', 'vector search', 'LLM integration']],
  ['Frontend', ['Next.js', 'React', 'Angular']],
  ['Practice', ['Git & code review', 'CI/CD', 'JWT auth', 'API design']],
];

export default function Skills() {
  return (
    <section id="skills" className="section">
      <div className="wrap cols">
        <p className="eyebrow">Toolkit</p>

        <Reveal>
          <div className="rows">
            {groups.map(([title, items]) => (
              <div key={title} className="row">
                <div className="row-meta">{title}</div>
                <div className="meta" style={{ fontSize: '.88rem', color: 'var(--ink-2)', paddingTop: '.3em' }}>
                  {items.join('  ·  ')}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
