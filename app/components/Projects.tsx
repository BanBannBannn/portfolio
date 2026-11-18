import Image from 'next/image';
import { checkAll } from '../../lib/health';

type Project = {
  kind: string;
  name: string;
  desc: string;
  tech: string[];
  github: string;
  demo?: string;
  /** Screenshot of the live demo, 1280×800, in /public/shots. */
  shot?: { src: string; alt: string };
};

const projects: Project[] = [
  {
    kind: 'Personal',
    name: 'Bàn Tròn',
    desc: 'A realtime collaborative whiteboard: freehand drawing, shapes, rich text, tables and a chat, with live cursors and presence. Chat, board content and profile data are encrypted with AES-256, and it needs no account, only a shared link. It runs on the free tiers of Supabase and Vercel, with CI/CD and end-to-end tests.',
    tech: ['Next.js 16', 'Supabase Realtime', 'Tiptap', 'Tailwind 4', 'Playwright'],
    github: 'https://github.com/BanBannBannn/ban-tron',
    demo: 'https://bantron.vercel.app/',
    shot: { src: '/shots/ban-tron.jpg', alt: 'Bàn Tròn home page: "Cùng vẽ, cùng viết, cùng bàn — ngay lúc này." beside a whiteboard with sticky notes, shapes, a table and live cursors.' },
  },
  {
    kind: 'Personal',
    name: 'GameHub',
    desc: 'An offline-first PWA with six board games: chess against Stockfish, xiangqi, gomoku, sudoku, minesweeper and number guessing. Progress is saved to IndexedDB, so a half-finished game survives a closed tab.',
    tech: ['Next.js', 'React 19', 'TypeScript', 'Zustand', 'PWA'],
    github: 'https://github.com/BanBannBannn/gamehub',
    demo: 'https://gamehub-board.vercel.app/',
    shot: { src: '/shots/gamehub.jpg', alt: 'GameHub home page: a Sudoku board next to the headline "Rèn tư duy mỗi ngày".' },
  },
  {
    kind: 'Personal',
    name: 'SmartMenuVibe',
    desc: 'A multi-tenant restaurant SaaS: QR ordering, a realtime kitchen board, and dish recommendations that take time of day and weather into account.',
    tech: ['Next.js', 'React 19', 'Supabase Realtime', 'Azure Face'],
    github: 'https://github.com/BanBannBannn/SmartMenuVibe',
    demo: 'https://smart-menu-vibe.vercel.app/',
    shot: { src: '/shots/smartmenuvibe.jpg', alt: 'SmartMenuVibe home page: "Menu đẹp hơn. Phục vụ nhanh hơn." beside an illustration of a digital menu.' },
  },
  {
    kind: 'Personal',
    name: 'DevToolBox AI',
    desc: 'Twelve developer tools that run entirely in the browser (JSON formatter, JWT decoder, QR and UUID generators) alongside a small markdown blog.',
    tech: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind'],
    github: 'https://github.com/BanBannBannn/devtoolbox-ai',
    demo: 'https://devtoolbox-ai-murex.vercel.app/',
    shot: { src: '/shots/devtoolbox-ai.jpg', alt: 'DevToolBox AI home page: "Write, share, and explore developer knowledge with AI" with a preview of the knowledge platform.' },
  },
  {
    kind: 'Capstone · 4 months',
    name: 'WareEase',
    desc: 'A warehouse management API: products and batches with expiry dates, stock levels, goods requests, receive, issue and internal transfer notes, stocktakes and adjustments, and a dashboard. Layered ASP.NET Core 8 on EF Core, with JWT access and refresh tokens in httpOnly cookies, group-based permissions, a Docker image, and GitHub Actions that build it and redeploy. My part: the permission middleware and the endpoints it protects, quantity validation across the request and note flows, and the dashboard figures.',
    tech: ['ASP.NET Core 8', 'EF Core', 'SQL Server', 'JWT', 'Docker', 'GitHub Actions'],
    github: 'https://github.com/ware-ease/we-api',
  },
  {
    kind: 'Team project · 4 months',
    name: 'Smart Menu',
    desc: 'A restaurant menu system that reads a customer\u2019s age, gender and mood from a camera photo with AWS Rekognition, then recommends the menu configured for that segment and time of day. Brands subscribe to plans and pay through PayOS; a React admin portal and an Expo mobile app sit on the .NET API, hosted on Azure. My part: menu recommendation, subscription limits and payment confirmation, and the brand dashboard API. SmartMenuVibe later grew out of it.',
    tech: ['ASP.NET Core 8', 'SQL Server', 'AWS Rekognition', 'S3', 'PayOS', 'Azure'],
    github: 'https://github.com/BanBannBannn/SmartMenu',
  },
];

export default async function Projects() {
  // Server-side, cached; see lib/health.ts. The label reflects a real check.
  const up = await checkAll(projects.flatMap((p) => (p.demo ? [p.demo] : [])));

  return (
    <section id="projects" className="section" aria-labelledby="projects-h">
      <div className="wrap section-inner">
        <h2 className="h2" id="projects-h">Projects</h2>

        <div className="projects">
          {projects.map(({ kind, name, desc, tech, github, demo, shot }) => {
            const live = demo ? up[demo] : false;
            return (
            <article key={name} className="project">
              <div className="project-head">
                <h3 className="project-name">{name}</h3>
                <span className="project-kind">
                  {demo && (
                    <span className={live ? 'live' : 'live live-off'}>
                      {live ? 'Live' : 'Demo offline'}
                    </span>
                  )}
                  {kind}
                </span>
              </div>

              {shot && (
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={1280}
                  height={800}
                  sizes="(min-width: 880px) 700px, 100vw"
                  className="project-shot"
                />
              )}

              <p className="project-desc">{desc}</p>
              <p className="stack">{tech.join(' · ')}</p>

              <div className="project-links">
                {demo && live && (
                  <a href={demo} className="a" target="_blank" rel="noreferrer">
                    Open demo<span className="arrow" aria-hidden="true">↗</span>
                  </a>
                )}
                <a href={github} className="a" target="_blank" rel="noreferrer">
                  Source<span className="arrow" aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
