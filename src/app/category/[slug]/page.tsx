import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog';
import { site } from '@/config/site';
import { SiteHeader } from '@/components/site-header';
import { ProductFeed } from '@/components/product-feed';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog();
  const category = catalog.categories.find((c) => c.slug === slug);
  if (!category) return { title: 'Category' };

  const description = category.blurb ?? `${category.name} picks on ${site.name}.`;
  const canonical = `${site.url}/category/${category.slug}`;
  return {
    title: category.name,
    description,
    alternates: { canonical },
    openGraph: { title: category.name, description, url: canonical },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const category = catalog.categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const products = catalog.products.filter((p) => p.categorySlug === slug && !p.soldOut);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-5xl px-4 pb-2 pt-6">
          <h1 className="text-2xl font-medium text-ink">{category.name}</h1>
          {category.blurb && <p className="mt-1 max-w-md text-sm text-muted">{category.blurb}</p>}
        </div>
        {products.length > 0 ? (
          <ProductFeed products={products} />
        ) : (
          <p className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted">
            Nothing here just yet — check back soon, or browse everything in{' '}
            <a href="/shop" className="text-accent-text">
              the shop
            </a>
            .
          </p>
        )}
      </main>
    </>
  );
}
