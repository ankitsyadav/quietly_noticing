/**
 * Reads data/tombstones.json — maintained by the daily snapshot GitHub
 * Action, which diffs today's product slugs against yesterday's and records
 * anything that disappeared. Powers the 410 "no longer available" page so a
 * saved/shared link never dead-ends into a bare 404.
 */
import 'server-only';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Tombstone } from './types';

const PATH = fileURLToPath(new URL('../../data/tombstones.json', import.meta.url));

export async function getTombstone(slug: string): Promise<Tombstone | null> {
  try {
    const raw = await readFile(PATH, 'utf8');
    const list = JSON.parse(raw) as Tombstone[];
    return list.find((t) => t.slug === slug) ?? null;
  } catch {
    return null;
  }
}
