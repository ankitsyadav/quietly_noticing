/**
 * Pure normalisers for spreadsheet input. Every function here assumes the
 * worst about what was typed into a cell on a phone.
 */

/** URL-safe slug from arbitrary text. Falls back rather than returning ''. */
export function slugify(input: string): string {
  const s = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return s || 'item';
}

/** `${titleSlug}-${id}` — the id is what actually resolves the page. */
export function productSlug(title: string, id: string): string {
  return `${slugify(title)}-${slugify(id)}`;
}

/** Recover the trailing id from a product slug, however the title has changed. */
export function idFromSlug(slug: string): string | null {
  const i = slug.lastIndexOf('-');
  if (i === -1) return slug || null;
  return slug.slice(i + 1) || null;
}

/**
 * Accepts what a person actually types: `299`, `₹299`, `Rs. 1,299`,
 * `1,299.00`, `299/-`, `  299 `. Rejects anything left holding letters.
 */
export function parsePrice(raw: string): number | null {
  const cleaned = raw
    .replace(/[₹$]/g, '')
    .replace(/\brs\.?/gi, '')
    .replace(/\binr\b/gi, '')
    .replace(/\/-/g, '')
    .replace(/,/g, '')
    .trim();
  if (!cleaned || !/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Whole-percent saving. Null unless MRP is genuinely above the price. */
export function discountPercent(price: number, mrp: number | null): number | null {
  if (mrp === null || mrp <= price) return null;
  const pct = Math.round(((mrp - price) / mrp) * 100);
  return pct >= 1 ? pct : null;
}

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** ₹1,299 — Indian digit grouping, no stray decimals. */
export function formatPrice(value: number): string {
  return inr.format(value);
}

/**
 * Rewrites share links into something an <img> can actually load.
 * Returns null when the URL can never render, so the row can be rejected
 * with a message she can act on rather than showing a broken tile.
 */
export function normalizeImageUrl(raw: string): { url: string } | { error: string } {
  const url = raw.trim();
  if (!url) return { error: 'image URL is empty' };
  if (!/^https?:\/\//i.test(url)) return { error: 'image URL must start with https://' };

  // Google Drive share link -> direct-serve host.
  const drive = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?[^ ]*id=)([\w-]{10,})/);
  if (drive?.[1]) return { url: `https://lh3.googleusercontent.com/d/${drive[1]}` };

  if (/photos\.(google|app\.goo)\.gl|photos\.google\.com/.test(url)) {
    return { error: 'Google Photos links cannot be shown as images — upload to postimages instead' };
  }

  // postimages page URL rather than the direct image URL. Very easy mistake.
  if (/(^|\/\/)(www\.)?postimg\.cc\//i.test(url) && !/i\.postimg\.cc/i.test(url)) {
    return { error: 'this is the postimages page link — copy the "Direct link" instead (starts with i.postimg.cc)' };
  }

  return { url };
}
