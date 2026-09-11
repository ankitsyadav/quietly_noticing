import { ImageResponse } from 'next/og';
import { getCatalog } from '@/lib/catalog';
import { colors } from '@/config/theme';
import { site } from '@/config/site';
import { loadGoogleFont } from '@/lib/og-fonts';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const category = catalog.categories.find((c) => c.slug === slug);
  const name = category?.name ?? 'Shop';
  const blurb = category?.blurb ?? site.tagline;

  const text = `${name} ${blurb} ${site.name}`;
  const [displayFont, bodyFont] = await Promise.all([
    loadGoogleFont('Fraunces', text, 600),
    loadGoogleFont('Inter', text, 400),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: colors.bone,
          padding: 80,
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, color: colors.accentText, fontFamily: 'body' }}>{site.name}</div>
        <div style={{ display: 'flex', fontSize: 72, color: colors.ink, fontFamily: 'display', marginTop: 16 }}>
          {name}
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: colors.muted, fontFamily: 'body', marginTop: 20, maxWidth: 760 }}>
          {blurb}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(displayFont ? [{ name: 'display', data: displayFont, weight: 600 as const }] : []),
        ...(bodyFont ? [{ name: 'body', data: bodyFont, weight: 400 as const }] : []),
      ],
    },
  );
}
