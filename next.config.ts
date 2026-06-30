import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',   // static export → works on Vercel / Netlify / GitHub Pages
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
