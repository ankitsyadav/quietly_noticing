import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { colors } from '@/config/theme';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.creator.bio,
    start_url: '/',
    display: 'standalone',
    background_color: colors.bone,
    theme_color: colors.bone,
    icons: [{ src: '/icon', sizes: '64x64', type: 'image/png' }],
  };
}
