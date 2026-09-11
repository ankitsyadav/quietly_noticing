/**
 * Server-only Sheets API v4 client. Never imported from a client component —
 * the key lives in GOOGLE_SHEETS_API_KEY and must not reach the browser.
 */
import 'server-only';
import type { ValueGrid } from './parse-catalog';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

async function fetchRange(tab: string): Promise<ValueGrid> {
  if (!SHEET_ID || !API_KEY) {
    throw new Error('GOOGLE_SHEET_ID / GOOGLE_SHEETS_API_KEY are not set');
  }
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tab)}?key=${API_KEY}&valueRenderOption=UNFORMATTED_VALUE`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Sheets API ${tab}: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { values?: unknown[][] };
  return (json.values ?? []).map((row) => row.map((cell) => String(cell ?? '')));
}

export async function fetchSheetGrids(): Promise<{
  productsGrid: ValueGrid;
  categoriesGrid: ValueGrid;
  collectionsGrid: ValueGrid;
}> {
  const [productsGrid, categoriesGrid, collectionsGrid] = await Promise.all([
    fetchRange('Products'),
    fetchRange('Categories'),
    fetchRange('Collections'),
  ]);
  return { productsGrid, categoriesGrid, collectionsGrid };
}
