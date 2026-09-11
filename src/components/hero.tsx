'use client';

/**
 * Compact hero per Q15 — ~240px on a phone so the first product row still
 * breaks the fold. Transform-only entrance (see src/lib/motion.ts) so the
 * hero's own choreography never delays LCP: everything paints at full
 * opacity immediately and merely slides/scales into place.
 */
import Image from 'next/image';
import { m } from 'framer-motion';
import { site } from '@/config/site';
import { InstagramIcon, YoutubeIcon } from './icons';
import { heroItem, staggerContainer } from '@/lib/motion';

const socials = [
  { href: site.creator.instagram, label: 'Instagram', Icon: InstagramIcon },
  { href: site.creator.youtube, label: 'YouTube', Icon: YoutubeIcon },
];

export function Hero() {
  return (
    <m.section
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 pb-6 pt-8 text-center"
    >
      <m.div custom={0} variants={heroItem}>
        <Image
          src="https://picsum.photos/seed/quietly-noticing-avatar/160/160"
          alt={site.creator.displayName}
          width={72}
          height={72}
          priority
          className="rounded-full border border-line object-cover"
        />
      </m.div>

      <m.h1 custom={1} variants={heroItem} className="text-2xl font-medium text-ink">
        {site.name}
      </m.h1>

      <m.p custom={2} variants={heroItem} className="max-w-sm text-sm text-muted">
        {site.tagline}
      </m.p>

      <m.div custom={3} variants={heroItem} className="flex items-center gap-2">
        {socials.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-sink"
          >
            <Icon className="h-5 w-5" />
          </a>
        ))}
      </m.div>

      <m.p custom={4} variants={heroItem} className="max-w-xs text-xs text-muted">
        {site.disclosure.short}
      </m.p>
    </m.section>
  );
}
