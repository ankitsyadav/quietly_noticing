/**
 * Single entry point every page/route uses to get catalog data.
 *
 * The live Google Sheet is the only source of truth — reads through
 * fetchProductsGrid() (see sheets.ts), revalidated every 60s. If that
 * fetch fails (a Google outage, a sharing-permission change), we fall back
 * to the last-known-good committed snapshot (data/snapshot.json) so the
 * site stays up instead of going blank.
 */
import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildCatalog, type ValueGrid } from './parse-catalog';
import { fetchProductsGrid } from './sheets';
import type { Catalog } from './types';

// process.cwd()-relative rather than import.meta.url — the latter gets
// statically analyzed (and fails hard) by Turbopack's bundler even though
// this file is only ever read at runtime, not bundled as an asset.
const SNAPSHOT_PATH = join(process.cwd(), 'data', 'snapshot.json');

async function loadSnapshotGrid(): Promise<ValueGrid | null> {
  try {
    const raw = await readFile(SNAPSHOT_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    // Tolerate the older { productsGrid, categoriesGrid, collectionsGrid }
    // snapshot shape from before the schema simplified to one tab.
    return Array.isArray(parsed) ? parsed : (parsed.productsGrid ?? null);
  } catch {
    return null;
  }
}

export async function getCatalog(): Promise<Catalog> {
  try {
    const productsGrid = await fetchProductsGrid();
    return buildCatalog({ productsGrid, syncedAt: new Date().toISOString(), fromSnapshot: false });
  } catch (err) {
    console.error('[catalog] live sheet fetch failed, falling back to snapshot:', err);
    const productsGrid = await loadSnapshotGrid();
    if (!productsGrid) throw err; // no fallback available — surface the real error
    return buildCatalog({ productsGrid, syncedAt: new Date().toISOString(), fromSnapshot: true });
  }
}
