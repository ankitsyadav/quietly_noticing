import Link from 'next/link';
import { Search } from 'lucide-react';
import { site } from '@/config/site';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bone/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-lg tracking-tight text-ink">
          {site.name}
        </Link>
        <Link
          href="/shop"
          aria-label="Search products"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-sink"
        >
          <Search className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
