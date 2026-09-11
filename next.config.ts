import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Pic_1 is the only image run through next/image — the fast path is
      // the hosts she'll actually paste (postimages, or a Meesho/merchant
      // CDN URL copied directly); the wildcard fallback covers anything else.
      { protocol: 'https', hostname: 'i.postimg.cc' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.meesho.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
