import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog';
import { SiteHeader } from '@/components/site-header';
import { RefreshButton } from '@/components/refresh-button';
import { INDEXABLE_DESCRIPTION_MIN } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Site health',
  robots: { index: false, follow: false },
};

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
}

export default async function HealthPage() {
  const catalog = await getCatalog();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-xl font-medium text-ink">Site health</h1>
        <p className="mt-1 text-sm text-muted">
          A plain-language check of what&apos;s live on the site right now. Bookmark this page — it&apos;s the fastest way
          to tell whether something you added is showing up.
        </p>

        {catalog.fromSnapshot && (
          <div className="mt-4 rounded-md bg-sink px-3 py-2 text-sm text-caution">
            The live sheet couldn&apos;t be reached — showing yesterday&apos;s saved copy instead so the site stays up.
          </div>
        )}

        <div className="mt-5 flex items-center justify-between rounded-lg border border-line bg-surface p-4">
          <div>
            <p className="text-sm text-ink">Synced {timeAgo(catalog.syncedAt)}</p>
            <p className="text-xs text-muted">Changes in the sheet appear here within about a minute automatically.</p>
          </div>
          <RefreshButton />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-center">
          <Stat label="Live products" value={catalog.products.length} />
          <Stat label="Categories" value={catalog.categories.length} />
        </dl>

        <Section title={`Not showing (${catalog.issues.length})`} empty="Nothing to fix — every row looks good.">
          {catalog.issues.map((issue) => (
            <li key={`${issue.row}-${issue.reason}`} className="flex items-start gap-2 border-b border-line py-2 text-sm last:border-none">
              <span className="mt-0.5 shrink-0 rounded bg-sink px-1.5 py-0.5 text-xs text-muted">row {issue.row}</span>
              <span className="text-ink">
                <strong className="font-medium">{issue.label}</strong> — {issue.reason}
              </span>
            </li>
          ))}
        </Section>

        <Section
          title={`Missing a description (${catalog.notIndexable.length})`}
          empty="Every live product has a long enough description to show up in Google."
        >
          <p className="mb-2 text-xs text-muted">
            These won&apos;t appear in Google search yet — write a description of at least {INDEXABLE_DESCRIPTION_MIN}{' '}
            characters, and it will start showing up.
          </p>
          {catalog.notIndexable.map((p) => (
            <li key={p.id} className="flex items-center justify-between border-b border-line py-2 text-sm last:border-none">
              <span className="text-ink">{p.title}</span>
              <span className="text-xs text-muted">row {p.row}</span>
            </li>
          ))}
        </Section>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-surface py-3">
      <p className="text-xl font-semibold text-ink tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const isEmpty = Array.isArray(children) ? children.length === 0 : !children;
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-sm font-medium text-ink">{title}</h2>
      {isEmpty ? <p className="text-sm text-muted">{empty}</p> : <ul>{children}</ul>}
    </section>
  );
}
