/**
 * Pure filter/sort/search logic for /shop — kept separate from the client
 * component so it's unit-testable.
 */
import type { Product } from './types';

export const SORTS = ['newest', 'name-asc'] as const;
export type Sort = (typeof SORTS)[number];

export const SORT_LABELS: Record<Sort, string> = {
  newest: 'Newest',
  'name-asc': 'A to Z',
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
  const haystack = [p.title, p.description, p.category, p.platform].filter(Boolean).join(' ').toLowerCase();
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
    case 'name-asc':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'newest':
    default:
      result.reverse(); // sheet order ~= oldest-first, so newest-added-last
      break;
  }
  return result;
}
