import type { MouseEvent } from 'react';

export function handleSpotlight(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  el.style.setProperty('--my', `${e.clientY - rect.top}px`);
}

export function handleMagnetic(e: MouseEvent<HTMLElement>, strength = 0.3) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = (e.clientX - rect.left - rect.width / 2) * strength;
  const y = (e.clientY - rect.top - rect.height / 2) * strength;
  el.style.transform = `translate(${x}px, ${y}px)`;
}

export function resetMagnetic(e: MouseEvent<HTMLElement>) {
  e.currentTarget.style.transform = '';
}
