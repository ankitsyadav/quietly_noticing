import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCatalog } from '@/lib/catalog';
import { SiteHeader } from '@/components/site-header';
import { ShopClient } from '@/components/shop/shop-client';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: 'Shop',
  description: `Every pick from ${site.name}, searchable and filterable.`,
  alternates: { canonical: `${site.url}/shop` },
};

export default async function ShopPage() {
  const catalog = await getCatalog();
  const products = catalog.products;

  return (
    <>
      <SiteHeader />
      <main>
        <Suspense>
          <ShopClient products={products} categories={catalog.categories} />
        </Suspense>
      </main>
    </>
  );
}
