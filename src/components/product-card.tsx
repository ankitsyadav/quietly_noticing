'use client';

/**
 * The reusable product card. Dual-target: photo/title go to the product
 * page (context, description, share); the Shop now row is a separate
 * ≥44px hit area straight to the merchant. Reveals once on scroll into
 * view via useInView, then its observer detaches so a long /shop grid
 * never accumulates hundreds of live observers.
 *
 * No price/MRP/discount/badge/sold-out — the real sheet has no columns
 * for any of those, so none of it is shown.
 */
import { useRef } from 'react';
import Link from 'next/link';
import { m, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ProductImage } from './product-image';
import { ShopNowLink } from './shop-now-link';
import { Tilt } from './tilt';
import { revealUp } from '@/lib/motion';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const href = `/product/${product.slug}`;
  const alt = `${product.title} — ${product.category}`;

  // whileInView/viewport need framer-motion's inView Feature, which isn't
  // bundled into domAnimation or domMax in this version — only the public
  // useInView hook works reliably with LazyMotion's `m` components.
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
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs text-muted">{product.platform}</p>
        <Link href={href} className="min-h-10">
          <h3 className="line-clamp-2 text-sm font-medium text-ink">{product.title}</h3>
        </Link>

        <div className="mt-auto border-t border-line pt-2">
          <ShopNowLink
            href={product.affiliateUrl}
            label={`Shop ${product.title} on ${product.platform}`}
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-accent text-sm font-medium text-on-accent transition-transform active:scale-[0.98]"
          >
            Shop now
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </ShopNowLink>
        </div>
      </div>
    </m.article>
  );
}
