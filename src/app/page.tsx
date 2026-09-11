import { getCatalog } from '@/lib/catalog';
import { SiteHeader } from '@/components/site-header';
import { Hero } from '@/components/hero';
import { CategoryChips } from '@/components/category-chips';
import { ProductFeed } from '@/components/product-feed';

export default async function HomePage() {
  const catalog = await getCatalog();
  const live = catalog.products.filter((p) => !p.soldOut);
  const featuredCategories = catalog.categories.filter((c) => c.featured);
  const chips = featuredCategories.length > 0 ? featuredCategories : catalog.categories;
  const featured = live.filter((p) => p.featured);
  const latest = [...live].reverse(); // sheet order ~= newest-added-last

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <CategoryChips categories={chips} />
        {featured.length > 0 && <ProductFeed heading="Featured picks" products={featured.slice(0, 8)} />}
        <ProductFeed heading="Latest finds" products={latest} />
      </main>
    </>
  );
}
