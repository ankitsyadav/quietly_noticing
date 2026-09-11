import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Pic_1 is the only image run through next/image (see Q29) — the
      // fast path is the whitelisted postimages host; the wildcard fallback
      // covers a stray merchant CDN URL someone pastes anyway.
      { protocol: 'https', hostname: 'i.postimg.cc' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'loremflickr.com' }, // fixture data only
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
