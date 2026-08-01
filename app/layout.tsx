import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trần Văn Gia Bân — Software Engineer',
  description:
    'Backend engineer in Ho Chi Minh City. REST and GraphQL APIs in Spring Boot, FastAPI and ASP.NET Core, plus RAG pipelines in Python.',
  keywords: ['Software Engineer', 'Backend', 'ASP.NET Core', 'Spring Boot', 'FastAPI', 'Vietnam'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Trần Văn Gia Bân — Software Engineer',
    description: 'Backend engineer in Ho Chi Minh City. APIs, data models, and the plumbing behind them.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f4ef' },
    { media: '(prefers-color-scheme: dark)', color: '#14120e' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
