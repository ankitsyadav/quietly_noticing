import { describe, expect, it } from 'vitest';
import { applyShopFilters, DEFAULT_FILTERS } from '../src/lib/shop-filters';
import type { Product } from '../src/lib/types';

function product(overrides: Partial<Product>): Product {
  return {
    id: '1', slug: 'x-1', title: 'X', note: null, description: null,
    category: 'Jewellery', categorySlug: 'jewellery', platform: 'Amazon',
    affiliateUrl: 'https://amazon.in/x', price: 100, mrp: null, discountPercent: null,
    badge: null, featured: false, soldOut: false, images: ['https://i.postimg.cc/a.jpg'],
    indexable: false, row: 2,
    ...overrides,
  };
}

const catalog: Product[] = [
  product({ id: '1', title: 'Gold Hoops', category: 'Jewellery', categorySlug: 'jewellery', platform: 'Amazon', price: 300, mrp: 900, discountPercent: 67 }),
  product({ id: '2', title: 'Ribbed Tote', category: 'Bags', categorySlug: 'bags', platform: 'Myntra', price: 700, badge: 'Trending' }),
  product({ id: '3', title: 'Lip Oil', category: 'Beauty', categorySlug: 'beauty', platform: 'Nykaa', price: 400, mrp: 500, discountPercent: 20, note: 'jewellery-adjacent glow' }),
];

describe('applyShopFilters — search', () => {
  it('matches on title', () => {
    expect(applyShopFilters(catalog, { ...DEFAULT_FILTERS, q: 'hoops' })).toHaveLength(1);
  });
  it('matches on note text too', () => {
    expect(applyShopFilters(catalog, { ...DEFAULT_FILTERS, q: 'glow' }).map((p) => p.id)).toEqual(['3']);
  });
  it('is case-insensitive', () => {
    expect(applyShopFilters(catalog, { ...DEFAULT_FILTERS, q: 'GOLD' })).toHaveLength(1);
  });
  it('empty query returns everything', () => {
    expect(applyShopFilters(catalog, DEFAULT_FILTERS)).toHaveLength(3);
  });
});

describe('applyShopFilters — category/platform', () => {
  it('filters by category slug', () => {
    expect(applyShopFilters(catalog, { ...DEFAULT_FILTERS, category: 'bags' }).map((p) => p.id)).toEqual(['2']);
  });
  it('filters by platform', () => {
    expect(applyShopFilters(catalog, { ...DEFAULT_FILTERS, platform: 'Nykaa' }).map((p) => p.id)).toEqual(['3']);
  });
  it('combines search + category + platform', () => {
    const result = applyShopFilters(catalog, { q: 'tote', category: 'bags', platform: 'Myntra', sort: 'newest' });
    expect(result.map((p) => p.id)).toEqual(['2']);
  });
});

describe('applyShopFilters — sort', () => {
  it('price-asc', () => {
    expect(applyShopFilters(catalog, { ...DEFAULT_FILTERS, sort: 'price-asc' }).map((p) => p.id)).toEqual(['1', '3', '2']);
  });
  it('price-desc', () => {
    expect(applyShopFilters(catalog, { ...DEFAULT_FILTERS, sort: 'price-desc' }).map((p) => p.id)).toEqual(['2', '3', '1']);
  });
  it('discount, missing discount sorts last', () => {
    expect(applyShopFilters(catalog, { ...DEFAULT_FILTERS, sort: 'discount' }).map((p) => p.id)).toEqual(['1', '3', '2']);
  });
  it('trending puts Trending-badged items first, stable otherwise', () => {
    expect(applyShopFilters(catalog, { ...DEFAULT_FILTERS, sort: 'trending' }).map((p) => p.id)).toEqual(['2', '1', '3']);
  });
});
