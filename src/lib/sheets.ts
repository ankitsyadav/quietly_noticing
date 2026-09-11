/**
 * Server-only Google Sheets client, via the public gviz endpoint.
 *
 * This is the documented trade-off from the plan: gviz is undocumented and
 * unversioned, versus the officially supported Sheets API v4 (which needs a
 * Google Cloud project + API key). With the sheet actively being filled in
 * right now and no key set up yet, gviz gets the live site working with
 * zero configuration. It's the same endpoint that already worked reliably
 * throughout development. Swap to Sheets API v4 later for a supported
 * integration — see git history for the earlier implementation — by
 * replacing fetchProductsGrid's body; nothing else needs to change.
 *
 * Never imported from a client component — not that there's a secret here
 * (the sheet is deliberately link-public), but fetches should only ever
 * happen server-side, at ISR time.
 */
import 'server-only';
import type { ValueGrid } from './parse-catalog';

// The actual spreadsheet. Not a secret — it's a link-public sheet by
// design (Q1) — but still overridable via env if she ever moves it.
const DEFAULT_SHEET_ID = '1qcd5ajkSqG6q_QnoX3crDrGbqtW9tV6mzUxKFrx6vF0';
const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? DEFAULT_SHEET_ID;

type GvizCell = { v: unknown; f?: string } | null;
type GvizResponse = {
  table: {
    cols: { id: string; label: string }[];
    rows: { c: GvizCell[] }[];
  };
};

/** Strips gviz's JSONP wrapper (`/*O_o*\/\ngoogle.visualization.Query.setResponse({...});`). */
function parseGvizResponse(text: string): GvizResponse {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('unexpected gviz response shape');
  return JSON.parse(text.slice(start, end + 1)) as GvizResponse;
}

function cellText(c: GvizCell): string {
  if (!c) return '';
  if (c.f !== undefined) return c.f; // formatted string avoids "1.0" for whole numbers
  return c.v === null || c.v === undefined ? '' : String(c.v);
}

export async function fetchProductsGrid(): Promise<ValueGrid> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Sheet fetch failed: ${res.status} ${res.statusText}`);
  }
  const { table } = parseGvizResponse(await res.text());

  const headers = table.cols.map((c) => c.label || c.id);
  const rows = table.rows.map((r) => headers.map((_, i) => cellText(r.c[i] ?? null)));

  return [headers, ...rows];
}
