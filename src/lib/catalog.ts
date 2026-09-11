/**
 * Single entry point every page/route uses to get catalog data.
 *
 * DATA_SOURCE=fixture (default) — dummy data, no network, no keys needed.
 * DATA_SOURCE=sheet             — live Google Sheet via Sheets API v4,
 *                                  falling back to the committed snapshot
 *                                  (data/snapshot.json) if the fetch fails.
 *
 * This is the ONE place that decides fixture vs. live vs. snapshot — pages
 * never branch on DATA_SOURCE themselves.
 */
import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildCatalog, type ValueGrid } from './parse-catalog';
import { fixtureProductsGrid, fixtureCategoriesGrid, fixtureCollectionsGrid } from '@/data/fixture';
import type { Catalog } from './types';

// process.cwd()-relative rather than import.meta.url — the latter gets
// statically analyzed (and fails hard) by Turbopack's bundler even though
// this file is only ever read at runtime, not bundled as an asset.
const SNAPSHOT_PATH = join(process.cwd(), 'data', 'snapshot.json');

async function loadSnapshotGrids(): Promise<{
  productsGrid: ValueGrid;
  categoriesGrid: ValueGrid;
  collectionsGrid: ValueGrid;
} | null> {
  try {
    const raw = await readFile(SNAPSHOT_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function getCatalog(): Promise<Catalog> {
  const source = process.env.DATA_SOURCE ?? 'fixture';

  if (source === 'fixture') {
    return buildCatalog({
      productsGrid: fixtureProductsGrid,
      categoriesGrid: fixtureCategoriesGrid,
      collectionsGrid: fixtureCollectionsGrid,
      syncedAt: new Date().toISOString(),
      fromSnapshot: false,
    });
  }

  // source === 'sheet'
  const { fetchSheetGrids } = await import('./sheets');
  try {
    const grids = await fetchSheetGrids();
    return buildCatalog({ ...grids, syncedAt: new Date().toISOString(), fromSnapshot: false });
  } catch (err) {
    console.error('[catalog] live sheet fetch failed, falling back to snapshot:', err);
    const snapshot = await loadSnapshotGrids();
    if (!snapshot) throw err; // no fallback available — surface the real error
    return buildCatalog({ ...snapshot, syncedAt: new Date().toISOString(), fromSnapshot: true });
  }
}
