'use client';

/**
 * Web Share API where supported (native share sheet), copy-to-clipboard
 * fallback otherwise — the one save/share affordance we kept (Q19).
 */
import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled the native sheet — not an error worth surfacing
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — nothing further we can do silently
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-ink transition-colors hover:bg-sink"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          Link copied
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          Share
        </>
      )}
    </button>
  );
}
