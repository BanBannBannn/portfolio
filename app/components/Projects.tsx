type Project = {
  kind: string;
  name: string;
  desc: string;
  tech: string[];
  github: string;
  demo?: string;
};

const projects: Project[] = [
  {
    kind: 'Personal',
    name: 'GameHub',
    desc: 'An offline-first PWA with six board games: chess against Stockfish, xiangqi, gomoku, sudoku, minesweeper and number guessing. Progress is saved to IndexedDB, so a half-finished game survives a closed tab.',
    tech: ['Next.js', 'React 19', 'TypeScript', 'Zustand', 'PWA'],
    github: 'https://github.com/BanBannBannn/gamehub',
    demo: 'https://gamehub-board.vercel.app/',
  },
  {
    kind: 'Personal',
    name: 'SmartMenuVibe',
    desc: 'A multi-tenant restaurant SaaS: QR ordering, a realtime kitchen board, and dish recommendations that take time of day and weather into account.',
    tech: ['Next.js', 'React 19', 'Supabase Realtime', 'Azure Face'],
    github: 'https://github.com/BanBannBannn/SmartMenuVibe',
    demo: 'https://smart-menu-vibe.vercel.app/',
  },
  {
    kind: 'Personal',
    name: 'DevToolBox AI',
    desc: 'Twelve developer tools that run entirely in the browser (JSON formatter, JWT decoder, QR and UUID generators) alongside a small markdown blog.',
    tech: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind'],
    github: 'https://github.com/BanBannBannn/devtoolbox-ai',
    demo: 'https://devtoolbox-ai-murex.vercel.app/',
  },
  {
    kind: 'Capstone · 4 months',
    name: 'WareEase',
    desc: 'A warehouse inventory API with role-based access control and fine-grained permissions, deployed through a CI/CD pipeline.',
    tech: ['ASP.NET Core', 'EF Core', 'SQL Server', 'JWT', 'CI/CD'],
    github: 'https://github.com/ware-ease/we-api',
  },
  {
    kind: 'Team project · 4 months',
    name: 'Smart Menu',
    desc: 'A restaurant menu backend that recognises dishes from photos, using AWS Rekognition and S3, hosted on Azure. SmartMenuVibe later grew out of it.',
    tech: ['ASP.NET Core', 'SQL Server', 'AWS Rekognition', 'S3', 'Azure'],
    github: 'https://github.com/BanBannBannn/SmartMenu',
  },
];

export default function Projects() {
  return (
    <section id="projects" className="section" aria-labelledby="projects-h">
      <div className="wrap section-inner">
        <h2 className="h2" id="projects-h">Projects</h2>

        <div className="projects">
          {projects.map(({ kind, name, desc, tech, github, demo }) => (
            <article key={name} className="project">
              <div className="project-head">
                <h3 className="project-name">{name}</h3>
                <span className="project-kind">
                  {demo && <span className="live">Live</span>}
                  {kind}
                </span>
              </div>

              <p className="project-desc">{desc}</p>
              <p className="stack">{tech.join(' · ')}</p>

              <div className="project-links">
                {demo && (
                  <a href={demo} className="a" target="_blank" rel="noreferrer">
                    Open demo<span className="arrow" aria-hidden="true">↗</span>
                  </a>
                )}
                <a href={github} className="a" target="_blank" rel="noreferrer">
                  Source<span className="arrow" aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
