import { ImageResponse } from 'next/og';
import { getCatalog } from '@/lib/catalog';
import { idFromSlug } from '@/lib/normalize';
import { formatPrice, formatDiscount } from '@/lib/format';
import { colors } from '@/config/theme';
import { site } from '@/config/site';
import { loadGoogleFont } from '@/lib/og-fonts';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Next.js 16: params is a Promise here too.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const id = idFromSlug(slug);
  const product = catalog.products.find((p) => p.id === id);

  const title = product?.title ?? site.name;
  const priceText = product ? formatPrice(product.price) : '';
  const mrpText = product?.mrp ? formatPrice(product.mrp) : '';
  const discountText = product?.discountPercent ? formatDiscount(product.discountPercent) : '';

  const fontText = `${title} ${priceText} ${mrpText} ${discountText} ${site.name}`;
  const [displayFont, bodyFont] = await Promise.all([
    loadGoogleFont('Fraunces', fontText, 600),
    loadGoogleFont('Inter', fontText, 500),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: colors.bone,
          padding: 56,
        }}
      >
        {product && (
          <img
            src={product.images[0]}
            alt=""
            width={430}
            height={518}
            style={{ objectFit: 'cover', borderRadius: 24, background: colors.sink }}
          />
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginLeft: 48,
            flex: 1,
          }}
        >
          <div style={{ display: 'flex', fontSize: 30, color: colors.muted, fontFamily: 'body' }}>
            {product?.platform ?? site.name}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 56,
              color: colors.ink,
              fontFamily: 'display',
              marginTop: 12,
              lineHeight: 1.1,
              maxWidth: 620,
            }}
          >
            {title}
          </div>
          {product && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 28 }}>
              <div style={{ display: 'flex', fontSize: 44, color: colors.ink, fontFamily: 'body', fontWeight: 700 }}>
                {priceText}
              </div>
              {mrpText && (
                <div style={{ display: 'flex', fontSize: 28, color: colors.muted, fontFamily: 'body' }}>{mrpText}</div>
              )}
              {discountText && (
                <div style={{ display: 'flex', fontSize: 26, color: colors.accentText, fontFamily: 'body' }}>
                  {discountText}
                </div>
              )}
            </div>
          )}
          <div style={{ display: 'flex', fontSize: 26, color: colors.accent, fontFamily: 'display', marginTop: 44 }}>
            {site.name}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(displayFont ? [{ name: 'display', data: displayFont, weight: 600 as const }] : []),
        ...(bodyFont ? [{ name: 'body', data: bodyFont, weight: 500 as const }] : []),
      ],
    },
  );
}
