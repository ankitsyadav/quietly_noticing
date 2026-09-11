/** Cross-cutting numeric rules that aren't visual tokens (those live in theme.ts). */

/** Below this many products, /  and category pages use the single-column
 * editorial feed instead of the grid — see Q23. At/above it, the grid and
 * full filter bar switch on automatically. */
export const ADAPTIVE_GRID_THRESHOLD = 12;

/** Hard cap on cards rendered before the empty-state nudge, per Q39 — keeps
 * live Framer observers bounded even after several "Load more" presses. */
export const SHOP_GRID_CAP = 120;

/** Products per "Load more" press on /shop. */
export const SHOP_PAGE_SIZE = 24;
