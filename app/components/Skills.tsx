const groups: [string, string][] = [
  ['Languages', 'Java, C#, Python, TypeScript'],
  ['Backend', 'Spring Boot, ASP.NET Core, FastAPI, NestJS, REST, GraphQL'],
  ['Data', 'PostgreSQL, SQL Server, MongoDB, Qdrant, EF Core'],
  ['AI', 'RAG pipelines, agent logic, vector search, LLM integration'],
  ['Cloud', 'Azure, AWS (S3, Rekognition), Supabase, Firebase'],
  ['Frontend', 'Next.js, React, Angular'],
  ['Practice', 'API design, JWT auth, CI/CD, Git and code review'],
];

export default function Skills() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-h">
      <div className="wrap section-inner">
        <h2 className="h2" id="skills-h">Skills</h2>

        <dl className="skills">
          {groups.map(([k, v]) => (
            <div key={k} className="skill">
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
