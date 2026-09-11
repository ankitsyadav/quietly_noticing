'use client';

/**
 * Sticky bottom bar for the product page (Q24). The inline Shop now button
 * sits high on a long page; once it scrolls out of view this pins to the
 * bottom so the highest-value element on the page is never more than a
 * thumb's reach away. Driven by IntersectionObserver via useInView on a
 * sentinel placed right after the inline CTA — not a scroll-position guess.
 */
import { AnimatePresence, m, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { ShopNowLink } from './shop-now-link';
import { sheetVariants } from '@/lib/motion';

export function StickyCta({ product, anchorRef }: { product: Product; anchorRef: React.RefObject<HTMLDivElement | null> }) {
  const anchorInView = useInView(anchorRef);

  return (
    <AnimatePresence>
      {!anchorInView && !product.soldOut && (
        <m.div
          variants={sheetVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-sm [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
            <div className="tabular-nums">
              <p className="text-base font-semibold text-ink">{formatPrice(product.price)}</p>
              {product.mrp && <p className="text-xs text-muted line-through">{formatPrice(product.mrp)}</p>}
            </div>
            <ShopNowLink
              href={product.affiliateUrl}
              label={`Shop ${product.title} on ${product.platform}`}
              className="flex min-h-11 flex-1 max-w-56 items-center justify-center gap-1.5 rounded-full bg-accent px-6 text-sm font-medium text-on-accent"
            >
              Shop now
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </ShopNowLink>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
