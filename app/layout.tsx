import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import DevSwGuard from './components/DevSwGuard';
import './globals.css';

/* One family for everything. It has to set the owner's name with diacritics. */
const text = Be_Vietnam_Pro({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--text',
  display: 'swap',
});

/**
 * Set NEXT_PUBLIC_SITE_URL to the real deployed origin before shipping.
 * Social scrapers need an absolute URL for the OG image.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const DESCRIPTION =
  'Software and AI engineer in Ho Chi Minh City. .NET microservices and APIs in Spring Boot, ASP.NET Core, FastAPI and NestJS; RAG pipelines with Qdrant and Python.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Trần Văn Gia Bân — Software & AI Engineer',
  description: DESCRIPTION,
  keywords: ['Software Engineer', 'AI Engineer', 'Backend', 'ASP.NET Core', 'Spring Boot', 'FastAPI', 'Vietnam'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Trần Văn Gia Bân — Software & AI Engineer',
    description: DESCRIPTION,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trần Văn Gia Bân — Software & AI Engineer',
    description: DESCRIPTION,
  },
};

export const viewport = {
  viewportFit: 'cover' as const, // lets the gutter respect the notch in landscape
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfa' },
    { media: '(prefers-color-scheme: dark)', color: '#111113' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={text.variable}>
      <body>
        <DevSwGuard />
        <a href="#main" className="skip">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
