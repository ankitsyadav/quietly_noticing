'use client';

/**
 * /shop — search, category + platform filters in bottom sheets, sort, and
 * a capped "Load more" (Q39/Q20). Filter state lives in the URL so a
 * filtered view is shareable and survives the back button (Q20).
 */
import { useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, SlidersHorizontal, ArrowDownUp, X } from 'lucide-react';
import type { Category, Product } from '@/lib/types';
import { applyShopFilters, SORTS, SORT_LABELS, type Sort } from '@/lib/shop-filters';
import { SHOP_GRID_CAP, SHOP_PAGE_SIZE, ADAPTIVE_GRID_THRESHOLD } from '@/lib/constants';
import { ProductCard } from '../product-card';
import { BottomSheet } from '../bottom-sheet';

function readSort(value: string | null): Sort {
  return (SORTS as readonly string[]).includes(value ?? '') ? (value as Sort) : 'newest';
}

export function ShopClient({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const category = searchParams.get('category');
  const platform = searchParams.get('platform');
  const sort = readSort(searchParams.get('sort'));
  const [visible, setVisible] = useState(SHOP_PAGE_SIZE);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const platforms = useMemo(() => Array.from(new Set(products.map((p) => p.platform))).sort(), [products]);

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
    setVisible(SHOP_PAGE_SIZE);
  }

  const filtered = useMemo(
    () => applyShopFilters(products, { q, category, platform, sort }),
    [products, q, category, platform, sort],
  );
  const capped = filtered.slice(0, SHOP_GRID_CAP);
  const shown = capped.slice(0, visible);
  const activeFilterCount = (category ? 1 : 0) + (platform ? 1 : 0);

  return (
    <div>
      <div className="sticky top-[57px] z-20 border-b border-line bg-bone/95 px-4 py-2.5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                updateParams({ q: e.target.value || null });
              }}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-10 w-full rounded-full border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-muted"
            />
          </label>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="relative flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-sm text-ink"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-on-accent">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSortOpen(true)}
            className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-sm text-ink"
          >
            <ArrowDownUp className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Sort
          </button>
        </div>

        {activeFilterCount > 0 && (
          <div className="mx-auto mt-2 flex max-w-5xl flex-wrap gap-2">
            {category && (
              <Chip label={categories.find((c) => c.slug === category)?.name ?? category} onRemove={() => updateParams({ category: null })} />
            )}
            {platform && <Chip label={platform} onRemove={() => updateParams({ platform: null })} />}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-4 py-4">
        {isPending ? (
          <SkeletonGrid />
        ) : shown.length === 0 ? (
          <EmptyState query={q} />
        ) : (
          <>
            <div
              className={
                filtered.length < ADAPTIVE_GRID_THRESHOLD
                  ? 'grid grid-cols-2 gap-3 sm:grid-cols-3'
                  : 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'
              }
            >
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {visible < capped.length && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + SHOP_PAGE_SIZE)}
                  className="flex h-11 items-center rounded-full border border-line px-6 text-sm font-medium text-ink hover:bg-sink"
                >
                  Load more
                </button>
              </div>
            )}
            {visible >= capped.length && capped.length < filtered.length && (
              <p className="mt-6 text-center text-sm text-muted">
                Showing our top {SHOP_GRID_CAP} matches — narrow it down with a search or category to see more.
              </p>
            )}
          </>
        )}
      </div>

      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filters">
        <FilterGroup
          label="Category"
          options={categories.map((c) => ({ value: c.slug, label: c.name }))}
          value={category}
          onChange={(v) => updateParams({ category: v })}
        />
        <FilterGroup
          label="Platform"
          options={platforms.map((p) => ({ value: p, label: p }))}
          value={platform}
          onChange={(v) => updateParams({ platform: v })}
        />
      </BottomSheet>

      <BottomSheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort">
        <div className="flex flex-col">
          {SORTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                updateParams({ sort: s === 'newest' ? null : s });
                setSortOpen(false);
              }}
              className="flex min-h-11 items-center justify-between border-b border-line py-2.5 text-left text-sm last:border-none"
              aria-current={sort === s}
            >
              <span className={sort === s ? 'font-medium text-ink' : 'text-ink'}>{SORT_LABELS[s]}</span>
              {sort === s && <span className="h-2 w-2 rounded-full bg-accent" />}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="flex h-8 items-center gap-1 rounded-full bg-sink px-3 text-xs text-ink"
    >
      {label}
      <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
    </button>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <fieldset className="mb-5">
      <legend className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">{label}</legend>
      <div className="flex flex-wrap gap-2">
        <FilterPill selected={!value} label="All" onClick={() => onChange(null)} />
        {options.map((o) => (
          <FilterPill key={o.value} selected={value === o.value} label={o.label} onClick={() => onChange(o.value)} />
        ))}
      </div>
    </fieldset>
  );
}

function FilterPill({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex h-9 items-center rounded-full border px-3.5 text-sm ${
        selected ? 'border-accent bg-accent text-on-accent' : 'border-line bg-surface text-ink'
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-sm text-muted">
        {query ? (
          <>No products found for &ldquo;{query}&rdquo;. Try searching for jewellery, bags or beauty.</>
        ) : (
          <>No products match these filters yet.</>
        )}
      </p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="aspect-[4/5] animate-pulse bg-sink" />
          <div className="flex flex-col gap-2 p-3">
            <div className="h-3 w-16 animate-pulse rounded bg-sink" />
            <div className="h-4 w-full animate-pulse rounded bg-sink" />
            <div className="h-4 w-20 animate-pulse rounded bg-sink" />
          </div>
        </div>
      ))}
    </div>
  );
}
