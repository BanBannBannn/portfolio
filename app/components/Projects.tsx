import Reveal from './Reveal';

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
    kind: 'Capstone · 4 months',
    name: 'WareEase',
    desc: 'A warehouse inventory API with role-based access control and fine-grained permission management, deployed through a CI/CD pipeline.',
    tech: ['ASP.NET Core', 'EF Core', 'SQL Server', 'JWT', 'CI/CD'],
    github: 'https://github.com/ware-ease/we-api',
  },
  {
    kind: 'Team project · 4 months',
    name: 'Smart Menu',
    desc: 'A restaurant menu backend that recognises dishes from photographs — AWS Rekognition for the vision, S3 for media, running on Azure.',
    tech: ['ASP.NET Core', 'SQL Server', 'AWS Rekognition', 'S3', 'Azure'],
    github: 'https://github.com/BanBannBannn/SmartMenu',
  },
  {
    kind: 'Personal',
    name: 'GameHub',
    desc: 'An offline-first PWA with six playable board games — chess against Stockfish, xiangqi, gomoku, sudoku, minesweeper, number guessing. Progress saves to IndexedDB, so a half-finished game survives a closed tab.',
    tech: ['Next.js', 'React 19', 'TypeScript', 'Zustand', 'PWA'],
    github: 'https://github.com/BanBannBannn/gamehub',
    demo: 'https://gamehub-board.vercel.app/',
  },
  {
    kind: 'Personal',
    name: 'SmartMenuVibe',
    desc: 'A multi-tenant restaurant SaaS: QR ordering, a realtime kitchen board, and dish recommendations that take time of day and weather into account.',
    tech: ['Next.js', 'React 19', 'Supabase', 'Realtime', 'Azure Face'],
    github: 'https://github.com/BanBannBannn/SmartMenuVibe',
    demo: 'https://smart-menu-vibe.vercel.app/',
  },
  {
    kind: 'Personal',
    name: 'DevToolBox AI',
    desc: 'Twelve developer tools that run entirely in the browser — JSON formatter, JWT decoder, QR and UUID generators — alongside a small markdown blog.',
    tech: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind'],
    github: 'https://github.com/BanBannBannn/devtoolbox-ai',
    demo: 'https://devtoolbox-ai-murex.vercel.app/',
  },
  {
    kind: 'Personal',
    name: 'This site',
    desc: 'Next.js App Router, statically exported, installable as a PWA and readable offline.',
    tech: ['Next.js', 'TypeScript', 'PWA'],
    github: 'https://github.com/BanBannBannn/portfolio',
  },
];

export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="wrap cols">
        <p className="eyebrow">Projects</p>

        <Reveal>
          <div className="rows">
            {projects.map(({ kind, name, desc, tech, github, demo }) => (
              <div key={name} className="row row--hover">
                <div className="row-meta">{kind}</div>
                <div>
                  <div className="row-title">{name}</div>
                  <p>{desc}</p>
                  <div className="tech">{tech.join('  ·  ')}</div>
                  <div className="inline-links" style={{ marginTop: 14 }}>
                    {demo && (
                      <a href={demo} className="link" target="_blank" rel="noreferrer">
                        Live demo ↗
                      </a>
                    )}
                    <a href={github} className="link" target="_blank" rel="noreferrer">
                      Source ↗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
