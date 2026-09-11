import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog';
import { site } from '@/config/site';
import { SiteHeader } from '@/components/site-header';
import { ProductFeed } from '@/components/product-feed';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog();
  const collection = catalog.collections.find((c) => c.slug === slug);
  if (!collection) return { title: 'Collection' };
  const description = collection.caption ?? `A curated set of picks from ${site.name}.`;
  const canonical = `${site.url}/c/${collection.slug}`;
  return {
    title: collection.name,
    description,
    alternates: { canonical },
    // Reel/Story drop pages: real, useful pages for humans, but not worth
    // indexing individually — they're ephemeral by nature.
    robots: { index: false, follow: true },
    openGraph: { title: collection.name, description, url: canonical },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const collection = catalog.collections.find((c) => c.slug === slug);
  if (!collection) notFound();

  // Preserve the order she listed them in — that's usually the order they
  // appeared in the video.
  const products = collection.productIds
    .map((id) => catalog.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-5xl px-4 pb-2 pt-6 text-center">
          <h1 className="text-2xl font-medium text-ink">{collection.name}</h1>
          {collection.caption && <p className="mt-1 text-sm text-muted">{collection.caption}</p>}
        </div>
        {products.length > 0 ? (
          <ProductFeed products={products} />
        ) : (
          <p className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-muted">This collection is empty right now.</p>
        )}
      </main>
    </>
  );
}
