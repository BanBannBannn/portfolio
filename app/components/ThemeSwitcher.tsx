'use client';
import { useSyncExternalStore } from 'react';

const THEMES = [
  { id: 'aurora', label: 'Dark Aurora', swatch: 'linear-gradient(135deg,#0b0d18,#6ea8ff)' },
  { id: 'macos', label: 'macOS Vibrancy', swatch: 'linear-gradient(135deg,#eef1f6,#0A84FF)' },
  { id: 'light', label: 'Light Clean', swatch: 'linear-gradient(135deg,#ffffff,#3b6fe8)' },
] as const;

const STORAGE_KEY = 'portfolio-theme';
const THEME_EVENT = 'portfolio-theme-change';

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) || 'aurora';
}

function getServerSnapshot() {
  return 'aurora';
}

function applyTheme(id: string) {
  localStorage.setItem(STORAGE_KEY, id);
  if (id === 'aurora') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', id);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export default function ThemeSwitcher() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div className="theme-switcher glass">
      {THEMES.map(t => (
        <button
          key={t.id}
          type="button"
          aria-label={t.label}
          title={t.label}
          className={`theme-swatch${theme === t.id ? ' active' : ''}`}
          style={{ background: t.swatch }}
          onClick={() => applyTheme(t.id)}
        />
      ))}
    </div>
  );
}
