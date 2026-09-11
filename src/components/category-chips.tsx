import Link from 'next/link';
import type { Category } from '@/lib/types';

/** Horizontal, swipeable chip row — the Featured Categories section (spec §4). */
export function CategoryChips({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <nav aria-label="Featured categories" className="mx-auto max-w-5xl px-4 pb-4">
      <ul className="scrollbar-none flex gap-2 overflow-x-auto">
        {categories.map((c) => (
          <li key={c.slug} className="shrink-0">
            <Link
              href={`/category/${c.slug}`}
              className="flex h-9 items-center rounded-full border border-line bg-surface px-4 text-sm text-ink transition-colors hover:border-line-strong"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
