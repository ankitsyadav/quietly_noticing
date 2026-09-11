import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * Powers the "Refresh now" button on /health (Q34). Not analytics, not a
 * write path to the sheet — it only asks Next.js to re-fetch the catalog on
 * the next request instead of waiting out the 60s ISR window. Deliberately
 * unauthenticated: the worst outcome of abuse is a few extra Sheets API
 * reads, far under quota, so it isn't worth making Neha juggle a secret for
 * a button she's the only realistic user of.
 */
export async function POST() {
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
