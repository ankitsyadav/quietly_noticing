import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog';
import { getTombstone } from '@/lib/tombstones';
import { idFromSlug } from '@/lib/normalize';
import { site } from '@/config/site';
import { SiteHeader } from '@/components/site-header';
import { ProductDetail } from '@/components/product-detail';
import { RelatedProducts } from '@/components/related-products';
import { jsonLdScript } from '@/lib/json-ld';

// Next.js 16: params is always a Promise (sync access was fully removed).
type Props = { params: Promise<{ slug: string }> };

async function resolveProduct(slug: string) {
  const catalog = await getCatalog();
  const id = idFromSlug(slug);
  const product = catalog.products.find((p) => p.id === id) ?? null;
  return { catalog, product };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await resolveProduct(slug);
  if (!product) return { title: 'Product' };

  const canonical = `${site.url}/product/${product.slug}`;
  const description = product.note ?? product.description ?? `${product.title} — spotted on ${site.name}.`;

  return {
    title: product.title,
    description,
    alternates: { canonical },
    // Conditional indexing per Q31 — only a real, original note earns a
    // place in Google's index. Thin merchant-copy pages stay noindex.
    robots: product.indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: product.title,
      description,
      url: canonical,
      images: [{ url: `${canonical}/opengraph-image` }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { catalog, product } = await resolveProduct(slug);

  if (!product) {
    const id = idFromSlug(slug);
    const tombstone = id ? await getTombstone(slug) : null;
    if (tombstone) {
      // A real, deliberate 410 rather than a bare 404 — the visitor who
      // saved or shared this link is the highest-intent one we'll ever get.
      const alternatives = catalog.products
        .filter((p) => !p.soldOut && p.categorySlug === tombstone.categorySlug)
        .slice(0, 8);
      return (
        <>
          <SiteHeader />
          <main className="mx-auto max-w-2xl px-4 py-12 text-center">
            <h1 className="text-xl font-medium text-ink">{tombstone.title} isn&apos;t available any more</h1>
            <p className="mt-2 text-sm text-muted">It may have sold out or moved on — here&apos;s what&apos;s current instead.</p>
            <RelatedProducts
              products={alternatives}
              categoryName={catalog.categories.find((c) => c.slug === tombstone.categorySlug)?.name ?? 'similar picks'}
              categorySlug={tombstone.categorySlug}
            />
          </main>
        </>
      );
    }
    notFound();
  }

  // Retitling changes the slug's title prefix, not its trailing id (Q18) —
  // an old link still resolves here, so send it on to the current spelling.
  // permanentRedirect (308), not redirect (307): this is a durable rename,
  // and 308 is what preserves SEO equity / lets crawlers drop the old URL.
  if (product.slug !== slug) {
    permanentRedirect(`/product/${product.slug}`);
  }

  const related = catalog.products
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug && !p.soldOut)
    .slice(0, 10);
  const categoryName = catalog.categories.find((c) => c.slug === product.categorySlug)?.name ?? product.category;

  return (
    <>
      <SiteHeader />
      <main>
        <ProductDetail product={product} url={`${site.url}/product/${product.slug}`} />
        <RelatedProducts products={related} categoryName={categoryName} categorySlug={product.categorySlug} />
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            description: product.note ?? product.description ?? undefined,
            image: product.images,
            category: product.category,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'INR',
              availability: product.soldOut
                ? 'https://schema.org/OutOfStock'
                : 'https://schema.org/InStock',
              url: product.affiliateUrl,
            },
          }),
        }}
      />
    </>
  );
}
