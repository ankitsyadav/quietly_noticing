import Link from 'next/link';
import { getCatalog } from '@/lib/catalog';
import { SiteHeader } from '@/components/site-header';
import { CategoryChips } from '@/components/category-chips';
import { ProductFeed } from '@/components/product-feed';

/**
 * The generic 404 — distinct from the product tombstone (410) in
 * /product/[slug], which knows what specifically went missing. This one
 * covers everything else: a mistyped URL, an old bookmark, a stray link.
 * Never a dead end — search, categories, and a few live picks to browse.
 */
export default async function NotFound() {
  const catalog = await getCatalog();
  const recent = [...catalog.products].reverse().slice(0, 8);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 text-center">
        <h1 className="text-xl font-medium text-ink">This page has moved on</h1>
        <p className="mt-1 text-sm text-muted">
          Try{' '}
          <Link href="/shop" className="text-accent-text">
            searching everything
          </Link>{' '}
          instead, or browse a category below.
        </p>
      </main>
      <CategoryChips categories={catalog.categories} />
      {recent.length > 0 && <ProductFeed heading="Recently added" products={recent} />}
    </>
  );
}
