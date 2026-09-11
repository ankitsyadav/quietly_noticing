import { ImageResponse } from 'next/og';
import { colors } from '@/config/theme';
import { site } from '@/config/site';
import { loadGoogleFont } from '@/lib/og-fonts';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const text = `${site.name} ${site.tagline}`;
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
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.bone,
        }}
      >
        <div style={{ display: 'flex', fontSize: 84, color: colors.ink, fontFamily: 'display' }}>{site.name}</div>
        <div style={{ display: 'flex', fontSize: 32, color: colors.muted, fontFamily: 'body', marginTop: 20 }}>
          {site.tagline}
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
