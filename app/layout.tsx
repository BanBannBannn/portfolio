import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Background from './components/Background';
import CursorGlow from './components/CursorGlow';
import ScrollProgress from './components/ScrollProgress';
import ThemeSwitcher from './components/ThemeSwitcher';

const THEME_INIT = `
try {
  var t = localStorage.getItem('portfolio-theme');
  if (t && t !== 'aurora') document.documentElement.setAttribute('data-theme', t);
} catch (e) {}
`;

export const metadata: Metadata = {
  title: 'Trần Văn Gia Bân — Software Engineer',
  description: 'Software Engineer with ~2 years experience building scalable APIs and AI-integrated systems. ASP.NET Core, Spring Boot, FastAPI, NestJS.',
  keywords: ['Software Engineer', 'ASP.NET Core', 'Spring Boot', 'FastAPI', 'Vietnam'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Trần Văn Gia Bân — Software Engineer',
    description: 'Crafting software that scales & systems that think.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#06070f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script id="theme-init" strategy="beforeInteractive">{THEME_INIT}</Script>
        <Background />
        <CursorGlow />
        <ScrollProgress />
        {children}
        <ThemeSwitcher />
      </body>
    </html>
  );
}
