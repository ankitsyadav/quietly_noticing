/**
 * Turns raw Sheets API v4 value ranges into a validated Catalog.
 *
 * Design rules this file enforces:
 *  - Parse by HEADER NAME, never column position. Reordering columns in the
 *    sheet must never silently corrupt data.
 *  - A malformed row is skipped and recorded in `issues`, never thrown.
 *    One bad row must not take the whole site down.
 *  - A product is indexable only with a real, original note — see
 *    INDEXABLE_NOTE_MIN. This is the thin-affiliate-content guard.
 */
import { z } from 'zod';
import {
  BADGES,
  STATUSES,
  INDEXABLE_NOTE_MIN,
  type Product,
  type Category,
  type Collection,
  type RowIssue,
  type Catalog,
  type Badge,
} from './types';
import { discountPercent, normalizeImageUrl, parsePrice, productSlug, slugify } from './normalize';

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

const badgeSchema = z.enum(BADGES as unknown as [Badge, ...Badge[]]);

function parseProductRow(
  row: string[],
  idx: Map<string, number>,
  rowNumber: number,
  categorySlugByName: Map<string, string>,
): { product: Product } | { issue: RowIssue } {
  const label = cell(row, idx, 'Title') || `row ${rowNumber}`;
  const fail = (reason: string): { issue: RowIssue } => ({ issue: { row: rowNumber, label, reason } });

  const id = cell(row, idx, 'Id');
  const title = cell(row, idx, 'Title');
  const categoryRaw = cell(row, idx, 'Category');
  const platform = cell(row, idx, 'Platform');
  const affiliateUrl = cell(row, idx, 'Affiliate_Link', 'Affliate_Link');
  const priceRaw = cell(row, idx, 'Price');
  const mrpRaw = cell(row, idx, 'MRP');
  const badgeRaw = cell(row, idx, 'Badge');
  const featuredRaw = cell(row, idx, 'Featured');
  const statusRaw = cell(row, idx, 'Status') || 'Published';
  const noteRaw = cell(row, idx, 'Note');
  const descriptionRaw = cell(row, idx, 'Description');

  if (!id) return fail('Id is empty');
  if (!title) return fail('Title is empty');
  if (!categoryRaw) return fail('Category is empty');
  if (!affiliateUrl) return fail('Affiliate_Link is empty');
  if (!/^https?:\/\//i.test(affiliateUrl)) return fail('Affiliate_Link must start with https://');

  const price = parsePrice(priceRaw);
  if (price === null) return fail(`Price "${priceRaw}" is not a number`);

  let mrp: number | null = null;
  if (mrpRaw) {
    mrp = parsePrice(mrpRaw);
    if (mrp === null) return fail(`MRP "${mrpRaw}" is not a number`);
  }

  const statusParse = z.enum(STATUSES as unknown as [string, ...string[]]).safeParse(statusRaw);
  if (!statusParse.success) return fail(`Status "${statusRaw}" must be Published, Draft, or Sold Out`);
  const status = statusParse.data;
  if (status === 'Draft') return { issue: { row: rowNumber, label, reason: 'Draft — hidden on purpose' } };

  let badge: Badge | null = null;
  if (badgeRaw) {
    const b = badgeSchema.safeParse(badgeRaw);
    if (!b.success) return fail(`Badge "${badgeRaw}" must be one of ${BADGES.join(', ')}`);
    badge = b.data;
  }

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

  const categorySlug = categorySlugByName.get(categoryRaw.toLowerCase()) ?? slugify(categoryRaw);
  const note = noteRaw || null;
  const description = descriptionRaw || null;

  const product: Product = {
    id,
    slug: productSlug(title, id),
    title,
    note,
    description,
    category: categoryRaw,
    categorySlug,
    platform: platform || inferPlatform(affiliateUrl),
    affiliateUrl,
    price,
    mrp,
    discountPercent: discountPercent(price, mrp),
    badge,
    featured: /^(true|yes|1|✓)$/i.test(featuredRaw.trim()),
    soldOut: status === 'Sold Out',
    images,
    indexable: (note?.length ?? 0) >= INDEXABLE_NOTE_MIN,
    row: rowNumber,
  };

  return { product };
}

/** Best-effort merchant name from a bare or shortened affiliate URL. */
function inferPlatform(url: string): string {
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  })();
  const known: [RegExp, string][] = [
    [/amazon\.|amzn\.to/, 'Amazon'],
    [/flipkart\.|fkrt\./, 'Flipkart'],
    [/meesho\./, 'Meesho'],
    [/myntra\./, 'Myntra'],
    [/ajio\./, 'Ajio'],
    [/nykaa\./, 'Nykaa'],
  ];
  for (const [re, name] of known) if (re.test(host)) return name;
  return host || 'Other';
}

function parseCategoryRow(row: string[], idx: Map<string, number>): Category | null {
  const name = cell(row, idx, 'Name');
  if (!name) return null;
  const slug = cell(row, idx, 'Slug') || slugify(name);
  const order = Number.parseInt(cell(row, idx, 'Order'), 10);
  return {
    name,
    slug,
    order: Number.isFinite(order) ? order : 999,
    cover: cell(row, idx, 'Cover') || null,
    blurb: cell(row, idx, 'Blurb') || null,
    featured: /^(true|yes|1|✓)$/i.test(cell(row, idx, 'Featured').trim()),
  };
}

function parseCollectionRow(row: string[], idx: Map<string, number>): Collection | null {
  const name = cell(row, idx, 'Name');
  if (!name) return null;
  const slug = cell(row, idx, 'Slug') || slugify(name);
  const productIds = cell(row, idx, 'Product_Ids', 'Product_Ids')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    name,
    slug,
    productIds,
    caption: cell(row, idx, 'Caption') || null,
    cover: cell(row, idx, 'Cover') || null,
  };
}

export function parseProducts(grid: ValueGrid, categories: Category[]): { products: Product[]; issues: RowIssue[] } {
  const [headers, ...rows] = grid;
  if (!headers) return { products: [], issues: [] };
  const idx = headerIndex(headers);
  const categorySlugByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.slug]));

  const products: Product[] = [];
  const issues: RowIssue[] = [];
  const seenIds = new Set<string>();

  rows.forEach((row, i) => {
    if (row.every((c) => !c || !c.trim())) return; // fully blank row, ignore silently
    const rowNumber = i + 2; // +1 for header, +1 for 1-based sheet rows
    const result = parseProductRow(row, idx, rowNumber, categorySlugByName);
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

export function parseCategories(grid: ValueGrid): Category[] {
  const [headers, ...rows] = grid;
  if (!headers) return [];
  const idx = headerIndex(headers);
  return rows.map((row) => parseCategoryRow(row, idx)).filter((c): c is Category => c !== null).sort((a, b) => a.order - b.order);
}

export function parseCollections(grid: ValueGrid): Collection[] {
  const [headers, ...rows] = grid;
  if (!headers) return [];
  const idx = headerIndex(headers);
  return rows.map((row) => parseCollectionRow(row, idx)).filter((c): c is Collection => c !== null);
}

export function buildCatalog(input: {
  productsGrid: ValueGrid;
  categoriesGrid: ValueGrid;
  collectionsGrid: ValueGrid;
  syncedAt: string;
  fromSnapshot: boolean;
}): Catalog {
  const categories = parseCategories(input.categoriesGrid);

  // Any category used on a product but missing from the tab still works —
  // it appends at the end rather than disappearing.
  const known = new Set(categories.map((c) => c.slug));
  const { products, issues } = parseProducts(input.productsGrid, categories);
  for (const p of products) {
    if (!known.has(p.categorySlug)) {
      known.add(p.categorySlug);
      categories.push({ name: p.category, slug: p.categorySlug, order: 999, cover: null, blurb: null, featured: false });
    }
  }

  const collections = parseCollections(input.collectionsGrid);
  const draftCount = issues.filter((i) => i.reason.startsWith('Draft')).length;
  const notIndexable = products.filter((p) => !p.soldOut && !p.indexable);

  return {
    products,
    categories,
    collections,
    issues: issues.filter((i) => !i.reason.startsWith('Draft')),
    draftCount,
    notIndexable,
    syncedAt: input.syncedAt,
    fromSnapshot: input.fromSnapshot,
  };
}
