/** Domain model. Everything downstream trusts these shapes. */

export const BADGES = ['Trending', 'New', 'Bestseller'] as const;
export type Badge = (typeof BADGES)[number];

export const STATUSES = ['Published', 'Draft', 'Sold Out'] as const;
export type Status = (typeof STATUSES)[number];

/** Minimum characters of original creator note required for Google indexing. */
export const INDEXABLE_NOTE_MIN = 120;

export type Product = {
  /** Stable, manually assigned in the sheet. Anchors the URL forever. */
  id: string;
  /** `${titleSlug}-${id}`. Retitling changes the prefix; the id still resolves. */
  slug: string;
  title: string;
  /** Her personal recommendation. Drives indexability. */
  note: string | null;
  /** Factual product copy. */
  description: string | null;
  category: string;
  categorySlug: string;
  platform: string;
  affiliateUrl: string;
  price: number;
  mrp: number | null;
  /** Whole percent, only when MRP is genuinely higher. */
  discountPercent: number | null;
  badge: Badge | null;
  featured: boolean;
  soldOut: boolean;
  /** 1–4 URLs. images[0] is Pic_1 — the grid thumbnail, LCP element and OG source. */
  images: string[];
  /** True only with an original note of at least INDEXABLE_NOTE_MIN chars. */
  indexable: boolean;
  /** 1-based spreadsheet row, for /health. */
  row: number;
};

export type Category = {
  name: string;
  slug: string;
  order: number;
  cover: string | null;
  /** Indexable prose for the category page. */
  blurb: string | null;
  featured: boolean;
};

export type Collection = {
  name: string;
  slug: string;
  productIds: string[];
  caption: string | null;
  cover: string | null;
};

/** A product that used to exist. Powers the 410 tombstone page. */
export type Tombstone = {
  slug: string;
  title: string;
  categorySlug: string;
  removedOn: string;
};

/** Why a row did not make it onto the site. Surfaced verbatim on /health. */
export type RowIssue = {
  row: number;
  /** Best-effort identifier so she can find the row. */
  label: string;
  reason: string;
};

export type Catalog = {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  /** Rows rejected by validation. */
  issues: RowIssue[];
  /** Status = Draft. Deliberately hidden, not an error. */
  draftCount: number;
  /** Published products lacking a long enough note. */
  notIndexable: Product[];
  /** ISO timestamp of the successful read. */
  syncedAt: string;
  /** True when the live sheet failed and the committed snapshot was served. */
  fromSnapshot: boolean;
};
