/**
 * Non-visual site configuration. Everything that would otherwise be a
 * hardcoded string scattered across metadata, JSON-LD and OG generation
 * lives here so a domain migration or a rebrand is a one-file change.
 */
export const site = {
  name: 'Quietly Noticing',
  tagline: 'small everyday finds I actually use',
  /** Read from env so moving off the free subdomain later is a single var. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://quietlynoticing.vercel.app',
  creator: {
    displayName: 'Neha',
    bio: 'Affordable finds, fashion, beauty & lifestyle picks — the things I actually buy and use.',
    instagram: 'https://instagram.com/quietly__noticing',
    instagramHandle: '@quietly__noticing',
    youtube: 'https://www.youtube.com/@quietly__noticing',
  },
  disclosure: {
    short: 'Some links here earn me a small commission — it never changes what I recommend.',
    amazonRequired: 'As an Amazon Associate I earn from qualifying purchases.',
  },
} as const;
