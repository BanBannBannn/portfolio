import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  // No `output: 'export'`: the chat needs a server route (/api/chat) to keep the
  // API key off the client. Every page is still prerendered as static HTML.
  images: {
    unoptimized: true,
  },
  // The chat route reads the profile with fs at runtime; make sure Vercel
  // bundles it into the function.
  outputFileTracingIncludes: {
    '/api/chat': ['./content/**/*'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Nobody may frame the site (clickjacking).
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
