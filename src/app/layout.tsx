import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { site } from '@/config/site';
import { colors } from '@/config/theme';
import { MotionProvider } from '@/components/motion-provider';
import { jsonLdScript } from '@/lib/json-ld';

// Self-hosted via next/font — no runtime request to Google, no CLS from a
// late-swapping web font. Variable fonts keep this to two font files total.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display-loaded',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s — ${site.name}` },
  description: site.creator.bio,
  applicationName: site.name,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: site.name,
    description: site.creator.bio,
    url: site.url,
  },
  twitter: { card: 'summary_large_image', title: site.name, description: site.creator.bio },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: colors.bone,
  width: 'device-width',
  initialScale: 1,
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.creator.displayName,
  url: site.url,
  sameAs: [site.creator.instagram, site.creator.youtube],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(personJsonLd) }}
        />
      </body>
    </html>
  );
}
