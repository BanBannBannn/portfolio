import type { Metadata } from 'next';
import './globals.css';

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
  themeColor: '#111827',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
