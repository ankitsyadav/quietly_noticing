'use client';

import { useRef } from 'react';
import { m } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/types';
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

        <m.div custom={2} variants={revealUp} ref={ctaRef} className="flex flex-col gap-1.5">
          <ShopNowLink
            href={product.affiliateUrl}
            label={`Shop ${product.title} on ${product.platform}`}
            className="flex min-h-12 items-center justify-center gap-1.5 rounded-full bg-accent text-base font-medium text-on-accent transition-transform active:scale-[0.98]"
          >
            Shop now
            <ArrowUpRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </ShopNowLink>
          <p className="text-center text-xs text-muted">affiliate link</p>
        </m.div>

        <m.div custom={3} variants={revealUp}>
          <ShareButton title={product.title} url={url} />
        </m.div>

        {product.description && (
          <m.div custom={4} variants={revealUp}>
            <h2 className="mb-1 text-sm font-medium text-ink">Details</h2>
            <p className="text-sm text-muted">{product.description}</p>
          </m.div>
        )}

        <m.p custom={5} variants={revealUp} className="text-xs text-muted">
          {site.disclosure.short}
          {product.platform === 'Amazon' && ` ${site.disclosure.amazonRequired}`}
        </m.p>
      </div>

      <StickyCta product={product} anchorRef={ctaRef} />
    </m.div>
  );
}
