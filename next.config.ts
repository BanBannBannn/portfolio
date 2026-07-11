import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  output: 'export',   // static export → works on Vercel / Netlify / GitHub Pages
  images: {
    unoptimized: true,
  },
};

export default withSerwist(nextConfig);
