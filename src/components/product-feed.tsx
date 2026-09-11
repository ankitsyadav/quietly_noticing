import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatDiscount, formatPrice } from '@/lib/format';
import { ProductCard } from './product-card';
import { ADAPTIVE_GRID_THRESHOLD } from '@/lib/constants';

/**
 * Adaptive per Q23: under the threshold, a single-column editorial feed
 * (a thin catalogue reads as curated, not abandoned); at/above it, the
 * familiar 2-up grid with full card treatment.
 */
export function ProductFeed({ products, heading }: { products: Product[]; heading?: string }) {
  if (products.length === 0) return null;

  if (products.length < ADAPTIVE_GRID_THRESHOLD) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-4">
        {heading && <h2 className="mb-4 text-lg font-medium text-ink">{heading}</h2>}
        <div className="flex flex-col gap-8">
          {products.map((p) => (
            <EditorialRow key={p.id} product={p} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-4">
      {heading && <h2 className="mb-4 text-lg font-medium text-ink">{heading}</h2>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 4} />
        ))}
      </div>
    </section>
  );
}

function EditorialRow({ product }: { product: Product }) {
  const href = `/product/${product.slug}`;
  return (
    <Link href={href} className="group flex flex-col gap-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-sink">
        <Image
          src={product.images[0]!}
          alt={`${product.title} — ${product.category}`}
          fill
          sizes="(min-width: 640px) 560px, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted">{product.platform}</p>
          <h3 className="text-base font-medium text-ink">{product.title}</h3>
          <div className="mt-1 flex items-baseline gap-2 tabular-nums">
            <span className="text-base font-semibold text-ink">{formatPrice(product.price)}</span>
            {product.mrp && <span className="text-sm text-muted line-through">{formatPrice(product.mrp)}</span>}
            {product.discountPercent && (
              <span className="text-xs font-medium text-accent-text">{formatDiscount(product.discountPercent)}</span>
            )}
          </div>
        </div>
        <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted" strokeWidth={1.75} aria-hidden="true" />
      </div>
    </Link>
  );
}
