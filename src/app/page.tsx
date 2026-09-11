import { getCatalog } from '@/lib/catalog';
import { SiteHeader } from '@/components/site-header';
import { Hero } from '@/components/hero';
import { CategoryChips } from '@/components/category-chips';
import { ProductFeed } from '@/components/product-feed';

export default async function HomePage() {
  const catalog = await getCatalog();
  const latest = [...catalog.products].reverse(); // sheet order ~= newest-added-last

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <CategoryChips categories={catalog.categories} />
        <ProductFeed heading="Latest finds" products={latest} />
      </main>
    </>
  );
}
