'use client';
import Image from 'next/image';
import ApiCard from './ApiCard';

const PORTRAIT_SRC = '/portrait.jpg';
const CV_SRC = '/cv.pdf';

const GithubIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01z" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);
const PlayIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
  </svg>
);
const LinkedinIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6C1.1 6 0 4.88 0 3.5C0 2.12 1.12 1 2.5 1C3.88 1 4.98 2.12 4.98 3.5ZM.24 8.99H4.72V24H.24V8.99ZM8.75 8.99H13.03V11.04H13.09C13.86 9.6 15.8 8.68 17.98 8.68C22.13 8.68 24 11.13 24 15.35V24H19.51V16.44C19.51 14.52 19.47 11.99 16.84 11.99C14.17 11.99 13.77 13.94 13.77 16.31V24H9.29V8.99H8.75Z" />
  </svg>
);

export default function Hero() {
  const socials = [
    { href: 'https://github.com/BanBannBannn', icon: <GithubIcon />, label: 'GitHub' },
    { href: 'https://www.linkedin.com/in/bantrandev/', icon: <LinkedinIcon />, label: 'LinkedIn' },
    { href: 'mailto:tranvangiaban@gmail.com', icon: <MailIcon />, label: 'Email' },
    { href: 'tel:+84967174978', icon: <PhoneIcon />, label: 'Phone' },
  ];

  return (
    <section
      id="home"
      style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        padding: '80px clamp(20px,6vw,120px) 60px',
        gap: 48,
        flexWrap: 'wrap',
      }}
    >
      {/* LEFT */}
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{
          width: 124, height: 124, borderRadius: '50%',
          padding: 5, marginBottom: 24,
          background: 'linear-gradient(135deg, var(--blue), #22c55e)',
          boxShadow: '0 14px 36px rgba(59,111,232,.22)',
        }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            overflow: 'hidden', background: 'var(--surface)',
            display: 'grid', placeItems: 'center',
            border: '4px solid var(--bg)', position: 'relative',
          }}>
            <span
              className="font-display"
              style={{
                color: 'var(--blue)', fontWeight: 800,
                fontSize: '2rem', letterSpacing: 0,
              }}
            >
              GB
            </span>
            <Image
              src={PORTRAIT_SRC}
              alt="Portrait of Trần Văn Gia Bân"
              width={124}
              height={124}
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: "'JetBrains Mono', monospace", fontSize: '.78rem',
          color: 'var(--blue)', background: 'var(--blue-light)',
          padding: '6px 14px', borderRadius: 30, marginBottom: 24,
        }}>
          <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Open to work · HCMC, Vietnam
        </div>

        <h1 className="font-display" style={{
          fontSize: 'clamp(2.4rem,5vw,3.8rem)',
          fontWeight: 800, color: 'var(--navy)',
          lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20,
        }}>
          Crafting software<br />
          that <span style={{ color: 'var(--blue)' }}>scales</span> &<br />
          systems that think.
        </h1>

        <p style={{ fontSize: '1.05rem', color: 'var(--muted)', maxWidth: 480, lineHeight: 1.7, marginBottom: 36 }}>
          I&apos;m <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Trần Văn Gia Bân</strong> — Software Engineer specialising
          in REST APIs, AI-integrated pipelines, and distributed systems using
          ASP.NET Core, Spring Boot &amp; FastAPI.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a
            href="#projects"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontWeight: 600, fontSize: '.9rem', color: '#fff',
              background: 'var(--blue)', padding: '13px 26px', borderRadius: 30,
              boxShadow: '0 4px 14px rgba(59,111,232,.35)', transition: 'all .25s',
              textDecoration: 'none',
            }}
          >
            <PlayIcon /> View Projects
          </a>
          <a
            href={CV_SRC}
            download="Tran-Van-Gia-Ban-CV.pdf"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontWeight: 600, fontSize: '.9rem', color: 'var(--navy)',
              background: 'var(--surface)', padding: '13px 26px', borderRadius: 30,
              border: '1.5px solid var(--border)', transition: 'all .25s',
              textDecoration: 'none',
            }}
          >
            <DownloadIcon /> Download CV
          </a>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 28 }}>
          {socials.map(({ href, icon, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              title={label}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'var(--surface)', border: '1.5px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--muted)', transition: 'all .2s',
              }}
            >
              {icon}
            </a>
          ))}
        </div>
      </div>

      {/* RIGHT — API CARD */}
      <div style={{ flex: '0 0 420px', maxWidth: '100%' }}>
        <ApiCard />
      </div>
    </section>
  );
}
