'use client';
import { useEffect, useState } from 'react';
import { handleMagnetic, resetMagnetic } from '../lib/interactions';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -50% 0px' }
    );

    const sections = ['home', 'about', 'skills', 'experience', 'projects', 'contact'];
    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px,5vw,80px)', height: 64,
        background: scrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        transition: 'background .3s, box-shadow .3s',
        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,.35)' : 'none',
      }}
    >
      <a
        href="#home"
        className="font-display"
        style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--navy)', letterSpacing: '-.5px' }}
      >
        Gia<span className="grad-text">Bân</span>.dev
      </a>

      <div style={{ display: 'flex', gap: 8 }}>
        {['About', 'Skills', 'Experience', 'Projects'].map(s => {
          const isActive = activeSection === s.toLowerCase();
          return (
            <a
              key={s}
              href={`#${s.toLowerCase()}`}
              style={{
                fontSize: '.85rem', fontWeight: 500,
                color: isActive ? 'var(--blue)' : 'var(--muted)',
                background: isActive ? 'var(--blue-light)' : 'transparent',
                padding: '6px 14px', borderRadius: 30, transition: 'all .2s',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.target as HTMLElement).style.color = 'var(--blue)';
                  (e.target as HTMLElement).style.background = 'var(--blue-light)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.target as HTMLElement).style.color = 'var(--muted)';
                  (e.target as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              {s}
            </a>
          );
        })}
      </div>
      <a
        href="mailto:tranvangiaban@gmail.com"
        className="magnetic"
        style={{
          fontSize: '.85rem', fontWeight: 600, color: 'var(--cta-text)',
          background: 'var(--gradient-accent)', padding: '8px 18px', borderRadius: 30,
          boxShadow: '0 2px 16px rgba(110,168,255,.3)', transition: 'transform .15s cubic-bezier(.2,.9,.3,1), box-shadow .2s',
        }}
        onMouseMove={e => handleMagnetic(e, 0.3)}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 22px rgba(110,168,255,.45)';
        }}
        onMouseLeave={e => {
          resetMagnetic(e);
          (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(110,168,255,.3)';
        }}
      >
        Hire me →
      </a>
    </nav>
  );
}
