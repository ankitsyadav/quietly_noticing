'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await fetch('/api/revalidate', { method: 'POST' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-on-accent disabled:opacity-60"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} aria-hidden="true" />
      {loading ? 'Refreshing…' : 'Refresh now'}
    </button>
  );
}
