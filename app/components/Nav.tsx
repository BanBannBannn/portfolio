'use client';
import { useEffect, useState } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px,5vw,80px)', height: 64,
        background: 'rgba(245,247,255,.88)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        transition: 'box-shadow .3s',
        boxShadow: scrolled ? '0 2px 20px rgba(13,27,62,.08)' : 'none',
      }}
    >
      <a
        href="#home"
        className="font-display"
        style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--navy)', letterSpacing: '-.5px' }}
      >
        Gia<span style={{ color: 'var(--blue)' }}>Bân</span>.dev
      </a>

      <div style={{ display: 'flex', gap: 8 }}>
        {['About', 'Skills', 'Experience', 'Projects'].map(s => (
          <a
            key={s}
            href={`#${s.toLowerCase()}`}
            style={{
              fontSize: '.85rem', fontWeight: 500, color: 'var(--muted)',
              padding: '6px 14px', borderRadius: 30, transition: 'all .2s',
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.color = 'var(--blue)';
              (e.target as HTMLElement).style.background = 'var(--blue-light)';
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.color = 'var(--muted)';
              (e.target as HTMLElement).style.background = 'transparent';
            }}
          >
            {s}
          </a>
        ))}
      </div>
      <a
        href="mailto:tranvangiaban@gmail.com"
        style={{
          fontSize: '.85rem', fontWeight: 600, color: '#fff',
          background: 'var(--blue)', padding: '8px 18px', borderRadius: 30,
          boxShadow: '0 2px 10px rgba(59,111,232,.3)', transition: 'all .2s',
        }}
        onMouseEnter={e => {
          (e.target as HTMLElement).style.transform = 'translateY(-1px)';
          (e.target as HTMLElement).style.boxShadow = '0 4px 18px rgba(59,111,232,.4)';
        }}
        onMouseLeave={e => {
          (e.target as HTMLElement).style.transform = 'none';
          (e.target as HTMLElement).style.boxShadow = '0 2px 10px rgba(59,111,232,.3)';
        }}
      >
        Hire me →
      </a>
    </nav>
  );
}
