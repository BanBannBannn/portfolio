const roles = [
  {
    period: 'Sep 2025 – Apr 2026',
    company: 'HANEXT Technology',
    title: 'Software Engineer',
    bullets: [
      'Built and shipped REST and GraphQL APIs across several client projects in Spring Boot, FastAPI and NestJS.',
      'Wrote the AI backend services in Python: agent logic, plus Qdrant for retrieval-augmented generation.',
      'Chose and modelled the storage layer per project: PostgreSQL, SQL Server, MongoDB.',
      'Covered roughly a third of the frontend work in Angular and Next.js when the team needed it.',
      'Took part in code review and architecture discussions with the senior engineers.',
    ],
  },
  {
    period: 'Jan 2024 – Apr 2024',
    company: 'FPT Software',
    title: 'Software Engineer Intern',
    bullets: [
      'Built and tested RESTful APIs in Java Spring Boot for internal projects.',
      'Worked inside a real team process: branches, reviews, standups, tickets.',
    ],
  },
];

export default function Experience() {
  return (
    <section id="work" className="section" aria-labelledby="work-h">
      <div className="wrap section-inner">
        <h2 className="h2" id="work-h">Experience</h2>

        <div className="jobs">
          {roles.map(({ period, company, title, bullets }) => (
            <article key={company}>
              <div className="job-head">
                <h3 className="job-title">
                  {title} <span className="at">· {company}</span>
                </h3>
                <span className="when">{period}</span>
              </div>
              <ul className="bullets">
                {bullets.map(b => <li key={b}>{b}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
