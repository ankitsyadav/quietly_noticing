'use client';

/**
 * The reusable product card (spec §14). Dual-target per Q21: photo/title
 * go to the product page (context, gallery, her note); the Shop now row is
 * a separate ≥44px hit area straight to the merchant. Reveals once on
 * scroll into view, then its observer detaches (Q39) so a long /shop grid
 * never accumulates hundreds of live observers.
 */
import { useRef } from 'react';
import Link from 'next/link';
import { m, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice, formatDiscount } from '@/lib/format';
import { ProductImage } from './product-image';
import { ProductBadge } from './badge';
import { ShopNowLink } from './shop-now-link';
import { Tilt } from './tilt';
import { revealUp } from '@/lib/motion';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const href = `/product/${product.slug}`;
  const alt = `${product.title} — ${product.category}`;

  // `whileInView`/`viewport` need framer-motion's `inView` Feature, which
  // isn't bundled into either domAnimation or domMax in this version — only
  // the public useInView hook works reliably with LazyMotion's `m`
  // components, so the reveal is driven by that instead of the declarative
  // prop. `once: true` still detaches the observer after the first reveal
  // (Q39) so a long /shop grid doesn't accumulate hundreds of live ones.
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' });

  return (
    <m.article
      ref={ref}
      variants={revealUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface"
    >
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden bg-sink" tabIndex={-1}>
        <Tilt className="h-full w-full" maxTilt={8}>
          <ProductImage
            src={product.images[0]!}
            alt={alt}
            priority={priority}
            sizes="(min-width: 768px) 25vw, 50vw"
          />
        </Tilt>
        {product.badge && (
          <span className="absolute left-2 top-2">
            <ProductBadge badge={product.badge} />
          </span>
        )}
        {product.soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/45">
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium tracking-wide text-ink uppercase">
              Sold out
            </span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs text-muted">{product.platform}</p>
        <Link href={href} className="min-h-10">
          <h3 className="line-clamp-2 text-sm font-medium text-ink">{product.title}</h3>
        </Link>

        <div className="flex items-baseline gap-2 tabular-nums">
          <span className="text-base font-semibold text-ink">{formatPrice(product.price)}</span>
          {product.mrp && (
            <span className="text-sm text-muted line-through">{formatPrice(product.mrp)}</span>
          )}
        </div>
        {product.discountPercent && (
          <p className="-mt-1 text-xs font-medium text-accent-text">{formatDiscount(product.discountPercent)}</p>
        )}

        <div className="mt-auto border-t border-line pt-2">
          {product.soldOut ? (
            <Link
              href={href}
              className="flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-sink text-sm font-medium text-muted"
            >
              See similar
            </Link>
          ) : (
            <ShopNowLink
              href={product.affiliateUrl}
              label={`Shop ${product.title} on ${product.platform}`}
              className="flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-accent text-sm font-medium text-on-accent transition-transform active:scale-[0.98]"
            >
              Shop now
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </ShopNowLink>
          )}
        </div>
      </div>
    </m.article>
  );
}
