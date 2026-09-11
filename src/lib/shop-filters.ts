/**
 * Pure filter/sort/search logic for /shop — kept separate from the client
 * component so it's unit-testable and so swapping the full product list for
 * a trimmed remote index later (Q7, at 300+ products) only touches the data
 * source, not this logic.
 */
import type { Product } from './types';

export const SORTS = ['newest', 'price-asc', 'price-desc', 'discount', 'trending'] as const;
export type Sort = (typeof SORTS)[number];

export const SORT_LABELS: Record<Sort, string> = {
  newest: 'Newest',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  discount: 'Biggest discount',
  trending: 'Trending',
};

export type ShopFilters = {
  q: string;
  category: string | null;
  platform: string | null;
  sort: Sort;
};

export const DEFAULT_FILTERS: ShopFilters = { q: '', category: null, platform: null, sort: 'newest' };

function matchesSearch(p: Product, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const haystack = [p.title, p.note, p.description, p.category, p.platform].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(needle);
}

export function applyShopFilters(products: Product[], filters: ShopFilters): Product[] {
  let result = products.filter(
    (p) =>
      matchesSearch(p, filters.q) &&
      (!filters.category || p.categorySlug === filters.category) &&
      (!filters.platform || p.platform === filters.platform),
  );

  result = [...result];
  switch (filters.sort) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'discount':
      result.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
      break;
    case 'trending':
      result.sort((a, b) => Number(b.badge === 'Trending') - Number(a.badge === 'Trending'));
      break;
    case 'newest':
    default:
      result.reverse(); // sheet order ~= oldest-first, so newest-added-last
      break;
  }
  return result;
}
