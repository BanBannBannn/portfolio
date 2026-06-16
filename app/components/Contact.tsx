'use client';
import Reveal from './Reveal';

const contacts = [
  {
    href: 'mailto:tranvangiaban@gmail.com',
    label: 'Email',
    val: 'tranvangiaban@gmail.com',
    icon: (
      <svg width="16" height="16" fill="var(--blue)" viewBox="0 0 24 24">
        <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    ),
  },
  {
    href: 'tel:+84967174978',
    label: 'Phone',
    val: '+84 967 174 978',
    icon: (
      <svg width="16" height="16" fill="var(--blue)" viewBox="0 0 24 24">
        <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01z"/>
      </svg>
    ),
  },
  {
    href: 'https://github.com/BanBannBannn',
    label: 'GitHub',
    val: 'BanBannBannn',
    icon: (
      <svg width="16" height="16" fill="var(--blue)" viewBox="0 0 24 24">
        <path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
      </svg>
    ),
  },
  {
    href: 'https://www.linkedin.com/in/bantrandev/',
    label: 'LinkedIn',
    val: 'bantrandev',
    icon: (
      <svg width="16" height="16" fill="var(--blue)" viewBox="0 0 24 24">
        <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6C1.1 6 0 4.88 0 3.5C0 2.12 1.12 1 2.5 1C3.88 1 4.98 2.12 4.98 3.5ZM.24 8.99H4.72V24H.24V8.99ZM8.75 8.99H13.03V11.04H13.09C13.86 9.6 15.8 8.68 17.98 8.68C22.13 8.68 24 11.13 24 15.35V24H19.51V16.44C19.51 14.52 19.47 11.99 16.84 11.99C14.17 11.99 13.77 13.94 13.77 16.31V24H9.29V8.99H8.75Z"/>
      </svg>
    ),
  },
];

const MailIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

export default function Contact() {
  return (
    <section id="contact" style={{ padding: '100px clamp(20px,6vw,120px)' }}>
      <Reveal>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <p className="font-mono" style={{ fontSize: '.72rem', fontWeight: 500, color: 'var(--blue)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
            05 / Contact
          </p>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.4rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-1px', marginBottom: 16, lineHeight: 1.15 }}>
            Let&apos;s <span style={{ color: 'var(--blue)' }}>work together</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: 48, lineHeight: 1.7 }}>
            I&apos;m actively looking for fulltime backend roles. Whether you have a position,
            a project, or just want to talk tech — my inbox is open.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
            {contacts.map(({ href, label, val, icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--surface)', border: '1.5px solid var(--border)',
                  borderRadius: 12, padding: '16px 22px', transition: 'all .25s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--blue)';
                  el.style.transform = 'translateY(-2px)';
                  el.style.boxShadow = 'var(--shadow)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--border)';
                  el.style.transform = 'none';
                  el.style.boxShadow = 'none';
                }}
              >
                <div style={{ width:36, height:36, borderRadius:9, background:'var(--blue-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)', fontWeight: 500 }}>{label}</div>
                  <div className="font-display" style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--navy)' }}>{val}</div>
                </div>
              </a>
            ))}
          </div>

          <a
            href="mailto:tranvangiaban@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              fontWeight: 700, fontSize: '1rem', color: '#fff',
              background: 'var(--blue)', padding: '16px 36px', borderRadius: 30,
              boxShadow: '0 6px 24px rgba(59,111,232,.35)', transition: 'all .25s',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = 'translateY(-2px)';
              el.style.boxShadow = '0 10px 30px rgba(59,111,232,.45)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = 'none';
              el.style.boxShadow = '0 6px 24px rgba(59,111,232,.35)';
            }}
          >
            <MailIcon /> Send me a message
          </a>
        </div>
      </Reveal>
    </section>
  );
}
