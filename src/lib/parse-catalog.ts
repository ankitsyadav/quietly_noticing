/**
 * Turns a raw Google Sheet values grid into a validated Catalog.
 *
 * Matched exactly to the real sheet's columns — Id, Title, Description,
 * Category, Affliate_Link (also accepts the corrected "Affiliate_Link"
 * spelling), Pic_1..4. Nothing else exists, so nothing else is parsed:
 * platform is inferred from the URL, categories are derived purely from
 * whatever text appears in the Category column, and there is no
 * Note/Badge/Featured/Status/Price/MRP field anywhere.
 *
 * Design rules this file enforces:
 *  - Parse by HEADER NAME, never column position. Reordering columns in the
 *    sheet must never silently corrupt data.
 *  - A malformed row is skipped and recorded in `issues`, never thrown.
 *    One bad row must not take the whole site down.
 *  - A product is indexable only with a description of real length (the
 *    thin-affiliate-content guard) — see INDEXABLE_DESCRIPTION_MIN.
 */
import { INDEXABLE_DESCRIPTION_MIN, type Product, type Category, type RowIssue, type Catalog } from './types';
import { inferPlatform, normalizeImageUrl, productSlug, slugify } from './normalize';

/** A sheet "values" response: first row headers, rest are rows of strings. */
export type ValueGrid = string[][];

function headerIndex(headers: string[]): Map<string, number> {
  const map = new Map<string, number>();
  headers.forEach((h, i) => map.set(h.trim().toLowerCase(), i));
  return map;
}

/** Reads a cell by header name, tolerant of a couple of known misspellings. */
function cell(row: string[], idx: Map<string, number>, ...names: string[]): string {
  for (const name of names) {
    const i = idx.get(name.toLowerCase());
    if (i !== undefined) return (row[i] ?? '').trim();
  }
  return '';
}

function parseProductRow(
  row: string[],
  idx: Map<string, number>,
  rowNumber: number,
): { product: Product } | { issue: RowIssue } {
  const label = cell(row, idx, 'Title') || `row ${rowNumber}`;
  const fail = (reason: string): { issue: RowIssue } => ({ issue: { row: rowNumber, label, reason } });

  const id = cell(row, idx, 'Id');
  const title = cell(row, idx, 'Title');
  const categoryRaw = cell(row, idx, 'Category');
  const affiliateUrl = cell(row, idx, 'Affiliate_Link', 'Affliate_Link');
  const descriptionRaw = cell(row, idx, 'Description');

  if (!id) return fail('Id is empty');
  if (!title) return fail('Title is empty');
  if (!categoryRaw) return fail('Category is empty');
  if (!affiliateUrl) return fail('Affliate_Link is empty');
  if (!/^https?:\/\//i.test(affiliateUrl)) return fail('Affliate_Link must start with https://');

  const images: string[] = [];
  for (const col of ['Pic_1', 'Pic_2', 'Pic_3', 'Pic_4']) {
    const raw = cell(row, idx, col);
    if (!raw) continue;
    const normalized = normalizeImageUrl(raw);
    if ('error' in normalized) {
      if (col === 'Pic_1') return fail(`Pic_1: ${normalized.error}`);
      continue; // Pic_2-4 are optional; skip a bad one rather than failing the row.
    }
    images.push(normalized.url);
  }
  if (images.length === 0) return fail('Pic_1 is required (no valid image found)');

  const description = descriptionRaw || null;

  const product: Product = {
    id,
    slug: productSlug(title, id),
    title,
    description,
    category: categoryRaw,
    categorySlug: slugify(categoryRaw),
    platform: inferPlatform(affiliateUrl),
    affiliateUrl,
    images,
    indexable: (description?.length ?? 0) >= INDEXABLE_DESCRIPTION_MIN,
    row: rowNumber,
  };

  return { product };
}

export function parseProducts(grid: ValueGrid): { products: Product[]; issues: RowIssue[] } {
  const [headers, ...rows] = grid;
  if (!headers) return { products: [], issues: [] };
  const idx = headerIndex(headers);

  const products: Product[] = [];
  const issues: RowIssue[] = [];
  const seenIds = new Set<string>();

  rows.forEach((row, i) => {
    if (row.every((c) => !c || !c.trim())) return; // fully blank row, ignore silently
    const rowNumber = i + 2; // +1 for header, +1 for 1-based sheet rows
    const result = parseProductRow(row, idx, rowNumber);
    if ('issue' in result) {
      issues.push(result.issue);
      return;
    }
    if (seenIds.has(result.product.id)) {
      issues.push({ row: rowNumber, label: result.product.title, reason: `duplicate Id "${result.product.id}"` });
      return;
    }
    seenIds.add(result.product.id);
    products.push(result.product);
  });

  return { products, issues };
}

/** Pure derivation — there is no Categories tab, so this is the only
 * source of category names, slugs and ordering (alphabetical). */
function deriveCategories(products: Product[]): Category[] {
  const seen = new Map<string, Category>();
  for (const p of products) {
    if (!seen.has(p.categorySlug)) seen.set(p.categorySlug, { name: p.category, slug: p.categorySlug });
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function buildCatalog(input: {
  productsGrid: ValueGrid;
  syncedAt: string;
  fromSnapshot: boolean;
}): Catalog {
  const { products, issues } = parseProducts(input.productsGrid);
  const categories = deriveCategories(products);
  const notIndexable = products.filter((p) => !p.indexable);

  return {
    products,
    categories,
    issues,
    notIndexable,
    syncedAt: input.syncedAt,
    fromSnapshot: input.fromSnapshot,
  };
}
