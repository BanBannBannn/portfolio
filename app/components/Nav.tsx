'use client';
import { useEffect, useState } from 'react';

const SECTIONS = ['about', 'skills', 'work', 'projects'] as const;

export default function Nav() {
  const [active, setActive] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <a href="#top" className="nav-name">Trần Văn Gia Bân</a>

        <div className="nav-links">
          {SECTIONS.map(id => (
            <a key={id} href={`#${id}`} className="nav-link" data-active={active === id}>
              {id[0].toUpperCase() + id.slice(1)}
            </a>
          ))}
        </div>

        <a href="mailto:tranvangiaban@gmail.com" className="nav-link" style={{ color: 'var(--ink)' }}>
          Email ↗
        </a>
      </div>
    </nav>
  );
}
