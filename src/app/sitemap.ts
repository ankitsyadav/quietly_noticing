import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/catalog';
import { site } from '@/config/site';

/**
 * Only products that clear the indexability gate (a real description) get
 * a sitemap entry — the sitemap and the noindex/index metadata always
 * agree, since both read the same `product.indexable` flag.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();

  const staticPages: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: 'daily', priority: 1 },
    { url: `${site.url}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${site.url}/disclosure`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = catalog.categories.map((c) => ({
    url: `${site.url}/category/${c.slug}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = catalog.products
    .filter((p) => p.indexable)
    .map((p) => ({
      url: `${site.url}/product/${p.slug}`,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

  return [...staticPages, ...categoryPages, ...productPages];
}
