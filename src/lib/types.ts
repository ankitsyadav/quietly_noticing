/**
 * Domain model. Everything downstream trusts these shapes.
 *
 * Deliberately minimal — matched exactly to the real Google Sheet, not to
 * a schema invented ahead of it: Id, Title, Description, Category,
 * Affliate_Link, Pic_1..4. Nothing else exists in the sheet, so nothing
 * else lives here. Platform is inferred from the affiliate URL; category
 * slugs are derived from whatever text appears in the Category column;
 * there is no Note/Platform/Badge/Featured/Status column and no separate
 * Categories or Collections tab.
 */

/** Minimum characters of description required for Google indexing — the
 * thin-affiliate-content guard (see parse-catalog.ts). */
export const INDEXABLE_DESCRIPTION_MIN = 120;

export type Product = {
  /** Stable, manually assigned in the sheet. Anchors the URL forever. */
  id: string;
  /** `${titleSlug}-${id}`. Retitling changes the prefix; the id still resolves. */
  slug: string;
  title: string;
  description: string | null;
  category: string;
  categorySlug: string;
  /** Inferred from the affiliate URL's host — there is no Platform column. */
  platform: string;
  affiliateUrl: string;
  /** 1–4 URLs. images[0] is Pic_1 — the grid thumbnail, LCP element and OG source. */
  images: string[];
  /** True only when the description is at least INDEXABLE_DESCRIPTION_MIN chars. */
  indexable: boolean;
  /** 1-based spreadsheet row, for /health. */
  row: number;
};

/** Derived purely from the distinct Category values used across products —
 * there is no separate Categories tab to curate order/blurb/cover from. */
export type Category = {
  name: string;
  slug: string;
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
  /** Rows rejected by validation. */
  issues: RowIssue[];
  /** Published products whose description is too short to index. */
  notIndexable: Product[];
  /** ISO timestamp of the successful read. */
  syncedAt: string;
  /** True when the live sheet failed and the committed snapshot was served. */
  fromSnapshot: boolean;
};
