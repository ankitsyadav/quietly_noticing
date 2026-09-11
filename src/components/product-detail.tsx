'use client';

import { useRef } from 'react';
import { m } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice, formatDiscount } from '@/lib/format';
import { site } from '@/config/site';
import { Carousel } from './carousel';
import { ShopNowLink } from './shop-now-link';
import { ShareButton } from './share-button';
import { StickyCta } from './sticky-cta';
import { revealUp, staggerContainer } from '@/lib/motion';

export function ProductDetail({ product, url }: { product: Product; url: string }) {
  const ctaRef = useRef<HTMLDivElement>(null);

  return (
    <m.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-2xl px-4 pb-24 pt-4"
    >
      <m.div custom={0} variants={revealUp}>
        <Carousel images={product.images} alt={product.title} />
      </m.div>

      <div className="mt-5 flex flex-col gap-4">
        <m.div custom={1} variants={revealUp}>
          <p className="text-sm text-muted">{product.platform}</p>
          <h1 className="mt-1 text-xl font-medium text-ink">{product.title}</h1>
        </m.div>

        <m.div custom={2} variants={revealUp} className="flex items-baseline gap-2 tabular-nums">
          <span className="text-2xl font-semibold text-ink">{formatPrice(product.price)}</span>
          {product.mrp && <span className="text-base text-muted line-through">{formatPrice(product.mrp)}</span>}
          {product.discountPercent && (
            <span className="text-sm font-medium text-accent-text">{formatDiscount(product.discountPercent)}</span>
          )}
        </m.div>

        {product.soldOut ? (
          <m.p custom={3} variants={revealUp} className="rounded-md bg-sink px-3 py-2 text-sm text-muted">
            This one is currently sold out — take a look at similar picks below.
          </m.p>
        ) : (
          <m.div custom={3} variants={revealUp} ref={ctaRef} className="flex flex-col gap-1.5">
            <ShopNowLink
              href={product.affiliateUrl}
              label={`Shop ${product.title} on ${product.platform}`}
              className="flex min-h-12 items-center justify-center gap-1.5 rounded-full bg-accent text-base font-medium text-on-accent transition-transform active:scale-[0.98]"
            >
              Shop now
              <ArrowUpRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </ShopNowLink>
            <p className="text-center text-xs text-muted">affiliate link · price when I found it — these do change</p>
          </m.div>
        )}

        <m.div custom={4} variants={revealUp}>
          <ShareButton title={product.title} url={url} />
        </m.div>

        {product.note && (
          <m.div custom={5} variants={revealUp} className="rounded-lg border border-line bg-surface p-4">
            <p className="mb-1 text-xs font-medium tracking-wide text-accent-text uppercase">Why I picked this</p>
            <p className="text-sm text-ink">{product.note}</p>
          </m.div>
        )}

        {product.description && (
          <m.div custom={6} variants={revealUp}>
            <h2 className="mb-1 text-sm font-medium text-ink">Details</h2>
            <p className="text-sm text-muted">{product.description}</p>
          </m.div>
        )}

        <m.p custom={7} variants={revealUp} className="text-xs text-muted">
          {site.disclosure.short}
          {product.platform === 'Amazon' && ` ${site.disclosure.amazonRequired}`}
        </m.p>
      </div>

      <StickyCta product={product} anchorRef={ctaRef} />
    </m.div>
  );
}
