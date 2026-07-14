'use client';
import Reveal from './Reveal';

const projects = [
  {
    emoji: '📦',
    gradient: 'linear-gradient(135deg,#dbeafe,#bfdbfe)',
    name: 'WareEase — Warehouse Management System',
    desc: 'Capstone project · 4 months. Full-featured inventory management API with role-based access control, permission management, and automated CI/CD deployment pipeline.',
    tags: ['ASP.NET Core', 'EF Core', 'SQL Server', 'JWT', 'CI/CD'],
    github: 'https://github.com/ware-ease/we-api',
  },
  {
    emoji: '🍽️',
    gradient: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
    name: 'Smart Menu with AI',
    desc: '4 months. AI-powered restaurant menu system — backend APIs integrated with AWS Rekognition for image recognition, S3 for media storage, deployed on Azure cloud infrastructure.',
    tags: ['ASP.NET Core', 'SQL Server', 'AWS Rekognition', 'S3', 'Azure'],
    github: 'https://github.com/BanBannBannn/SmartMenu',
  },
];

const personalProjects = [
  {
    emoji: '🎮',
    gradient: 'linear-gradient(135deg,#ffedd5,#fed7aa)',
    name: 'GameHub — Classic Web Games Collection',
    desc: 'Personal project. An offline-first PWA game portal featuring 6 fully playable classic games: Chess (with Stockfish AI), Xiangqi, Gomoku, Sudoku, Minesweeper, and Number Guessing. Features include IndexedDB progress auto-saving, unified Zustand state management, fluid Framer Motion animations, and responsive hotseat multiplayer.',
    tags: ['Next.js', 'React 19', 'TypeScript', 'Zustand', 'PWA'],
    github: 'https://github.com/BanBannBannn/gamehub',
    demo: 'https://gamehub-board.vercel.app/',
  },
  {
    emoji: '✨',
    gradient: 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
    name: 'SmartMenuVibe — Restaurant SaaS',
    desc: 'Personal project. A multi-tenant restaurant SaaS: QR ordering, a realtime kitchen Kanban board, context-aware dish recommendations (time + weather + best-sellers), AI-written menu descriptions, and a drag-and-drop menu builder.',
    tags: ['Next.js', 'React 19', 'Supabase', 'Realtime', 'Azure Face'],
    github: 'https://github.com/BanBannBannn/SmartMenuVibe',
    demo: 'https://smart-menu-vibe.vercel.app/',
  },
  {
    emoji: '🧰',
    gradient: 'linear-gradient(135deg,#fef3c7,#fde68a)',
    name: 'DevToolBox AI — Free Developer Tools',
    desc: 'Personal project. An SEO-first site with 12 free, browser-based developer tools (JSON formatter, JWT decoder, QR & UUID generators, git and AI-prompt helpers) plus a markdown dev blog and a RAG-powered docs assistant.',
    tags: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind', 'SEO'],
    github: 'https://github.com/BanBannBannn/devtoolbox-ai',
    demo: 'https://devtoolbox-ai-murex.vercel.app/',
  },
  {
    emoji: '🌐',
    gradient: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)',
    name: 'Personal Portfolio (this site)',
    desc: 'Personal project. The site you are looking at — a fast, responsive portfolio built on the Next.js App Router, with PWA support (installable, offline-ready) and smooth scroll-reveal animations.',
    tags: ['Next.js', 'TypeScript', 'PWA', 'App Router'],
    github: 'https://github.com/BanBannBannn/portfolio',
    demo: 'https://portfolio-self-seven-kmbo72h8bm.vercel.app/',
  },
];

const ArrowIcon = () => (
  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 6v2H5v11h11v-5h2v7H3V6h7zm11-3v8l-3.08-3.08L9.41 17.5 6.5 14.59l9.5-9.5L12.99 2H21z"/>
  </svg>
);

const ProjectCard = ({ project, index }: { project: any, index: number }) => {
  return (
    <Reveal delay={index * 80}>
      <div
        style={{
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg)', border: '1.5px solid var(--border)',
          borderRadius: 14, overflow: 'hidden',
          transition: 'all .3s', height: '100%',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'var(--blue)';
          el.style.transform = 'translateY(-4px)';
          el.style.boxShadow = 'var(--shadow-hover)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'var(--border)';
          el.style.transform = 'none';
          el.style.boxShadow = 'none';
        }}
      >
        {/* Top banner */}
        <div style={{ height: 140, background: project.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
          {project.emoji}
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)', marginBottom: 6 }}>
            {project.name}
          </div>
          <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6, flex: 1, marginBottom: 14 }}>
            {project.desc}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
            {project.tags.map((t: string) => (
              <span key={t} className="font-mono" style={{
                fontSize: '.68rem', color: 'var(--blue)',
                background: 'var(--blue-light)', padding: '3px 8px',
                borderRadius: 6, border: '1px solid var(--blue-mid)',
              }}>
                {t}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 600, color: 'var(--blue)', textDecoration: 'none' }}
              >
                Live demo <ArrowIcon />
              </a>
            )}
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 600, color: project.demo ? 'var(--muted)' : 'var(--blue)', textDecoration: 'none' }}
            >
              {project.demo ? 'GitHub' : 'View on GitHub'} <ArrowIcon />
            </a>
          </div>
        </div>
      </div>
    </Reveal>
  );
};

export default function Projects() {
  return (
    <section id="projects" style={{ padding: '100px clamp(20px,6vw,120px)', background: 'var(--surface)' }}>
      <Reveal>
        <p className="font-mono" style={{ fontSize: '.72rem', fontWeight: 500, color: 'var(--blue)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
          04 / Projects
        </p>
        <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.4rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-1px', marginBottom: 48, lineHeight: 1.15 }}>
          Things I&apos;ve <span style={{ color: 'var(--blue)' }}>shipped</span>
        </h2>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20 }}>
        {projects.map((project, i) => (
          <ProjectCard key={project.name} project={project} index={i} />
        ))}
      </div>

      <Reveal>
        <h3 className="font-display" style={{ fontSize: 'clamp(1.4rem,2.5vw,1.8rem)', fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.5px', marginTop: 80, marginBottom: 32, lineHeight: 1.15 }}>
          Personal <span style={{ color: 'var(--blue)' }}>Projects</span>
        </h3>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20 }}>
        {personalProjects.map((project, i) => (
          <ProjectCard key={project.name} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
