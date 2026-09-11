import Link from 'next/link';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';

/** "More in {category}" — a horizontal row, not a full grid, since it sits
 * at the bottom of an already-long product page (Q24). */
export function RelatedProducts({ products, categoryName, categorySlug }: {
  products: Product[];
  categoryName: string;
  categorySlug: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-2xl px-4 pb-10">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-base font-medium text-ink">More in {categoryName}</h2>
        <Link href={`/category/${categorySlug}`} className="text-sm text-accent-text">
          See all
        </Link>
      </div>
      <div className="scrollbar-none flex gap-3 overflow-x-auto">
        {products.map((p) => (
          <div key={p.id} className="w-40 shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
