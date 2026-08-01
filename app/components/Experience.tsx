import Reveal from './Reveal';

const roles = [
  {
    period: 'Sep 2025 — Apr 2026',
    company: 'HANEXT Technology',
    title: 'Software Engineer',
    bullets: [
      'Built and shipped REST and GraphQL APIs across several client projects in Spring Boot, FastAPI and NestJS.',
      'Wrote the AI backend services in Python — agent logic, plus Qdrant for retrieval-augmented generation.',
      'Chose and modelled the storage layer per project: PostgreSQL, SQL Server, MongoDB.',
      'Covered roughly a third of the frontend work in Angular and Next.js when the team needed it.',
      'Code review, Git workflow, and architecture discussions with the senior engineers.',
    ],
  },
  {
    period: 'Jan 2024 — Apr 2024',
    company: 'FPT Software',
    title: 'Software Engineer Intern',
    bullets: [
      'First real codebase: building and testing RESTful APIs in Java Spring Boot for internal projects.',
      'Learned how a team actually works — branches, reviews, standups, ticket hygiene.',
    ],
  },
];

export default function Experience() {
  return (
    <section id="work" className="section">
      <div className="wrap cols">
        <p className="eyebrow">Work</p>

        <Reveal>
          <div className="rows">
            {roles.map(({ period, company, title, bullets }) => (
              <div key={company} className="row">
                <div className="row-meta">{period}</div>
                <div>
                  <div className="row-title">{company}</div>
                  <div className="row-sub">{title}</div>
                  <ul>
                    {bullets.map(b => <li key={b}>{b}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
