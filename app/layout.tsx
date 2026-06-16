import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trần Văn Gia Bân — Backend Developer',
  description: 'Backend Developer with ~2 years experience building scalable APIs and AI-integrated systems. ASP.NET Core, Spring Boot, FastAPI, NestJS.',
  keywords: ['backend developer', 'ASP.NET Core', 'Spring Boot', 'FastAPI', 'Vietnam'],
  openGraph: {
    title: 'Trần Văn Gia Bân — Backend Developer',
    description: 'Building backends that scale & systems that think.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
