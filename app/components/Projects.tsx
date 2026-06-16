'use client';
import Reveal from './Reveal';

const projects = [
  {
    emoji: '📦',
    gradient: 'linear-gradient(135deg,#dbeafe,#bfdbfe)',
    name: 'WareEase — Warehouse Management System',
    desc: 'Capstone project · 4 months. Full-featured inventory management API with role-based access control, permission management, and automated CI/CD deployment pipeline.',
    tags: ['ASP.NET Core', 'EF Core', 'SQL Server', 'JWT', 'CI/CD'],
    href: 'https://github.com/ware-ease/we-api',
  },
  {
    emoji: '🍽️',
    gradient: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
    name: 'Smart Menu with AI',
    desc: '4 months. AI-powered restaurant menu system — backend APIs integrated with AWS Rekognition for image recognition, S3 for media storage, deployed on Azure cloud infrastructure.',
    tags: ['ASP.NET Core', 'SQL Server', 'AWS Rekognition', 'S3', 'Azure'],
    href: 'https://github.com/BanBannBannn/SmartMenu',
  },
];

const ArrowIcon = () => (
  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 6v2H5v11h11v-5h2v7H3V6h7zm11-3v8l-3.08-3.08L9.41 17.5 6.5 14.59l9.5-9.5L12.99 2H21z"/>
  </svg>
);

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
        {projects.map(({ emoji, gradient, name, desc, tags, href }, i) => (
          <Reveal key={name} delay={i * 80}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex', flexDirection: 'column',
                background: 'var(--bg)', border: '1.5px solid var(--border)',
                borderRadius: 14, overflow: 'hidden', textDecoration: 'none',
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
              <div style={{ height: 140, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                {emoji}
              </div>

              {/* Body */}
              <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="font-display" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)', marginBottom: 6 }}>
                  {name}
                </div>
                <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6, flex: 1, marginBottom: 14 }}>
                  {desc}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
                  {tags.map(t => (
                    <span key={t} className="font-mono" style={{
                      fontSize: '.68rem', color: 'var(--blue)',
                      background: 'var(--blue-light)', padding: '3px 8px',
                      borderRadius: 6, border: '1px solid var(--blue-mid)',
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 600, color: 'var(--blue)' }}>
                  View on GitHub <ArrowIcon />
                </div>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
