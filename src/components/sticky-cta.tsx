'use client';

/**
 * Sticky bottom bar for the product page. The inline Shop now button sits
 * high on a long page; once it scrolls out of view this pins to the bottom
 * so the highest-value element on the page is never more than a thumb's
 * reach away. Driven by IntersectionObserver via useInView on a sentinel
 * placed right after the inline CTA — not a scroll-position guess.
 */
import { AnimatePresence, m, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ShopNowLink } from './shop-now-link';
import { sheetVariants } from '@/lib/motion';

export function StickyCta({ product, anchorRef }: { product: Product; anchorRef: React.RefObject<HTMLDivElement | null> }) {
  const anchorInView = useInView(anchorRef);

  return (
    <AnimatePresence>
      {!anchorInView && (
        <m.div
          variants={sheetVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-sm [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto max-w-2xl">
            <ShopNowLink
              href={product.affiliateUrl}
              label={`Shop ${product.title} on ${product.platform}`}
              className="flex min-h-12 items-center justify-center gap-1.5 rounded-full bg-accent text-base font-medium text-on-accent"
            >
              Shop now
              <ArrowUpRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </ShopNowLink>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
