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
 * Best-effort merchant name from a bare or shortened affiliate URL. There
 * is no Platform column in the sheet, so this is the only source of the
 * platform label shown on cards and used for the /shop platform filter.
 */
export function inferPlatform(url: string): string {
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
