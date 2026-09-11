'use client';

/**
 * Pic_1 only runs through next/image (AVIF/WebP, responsive srcset,
 * priority-loadable) — see Q29's image-quota budget. On error, it swaps to
 * a quiet fallback tile rather than a broken-image icon, since Neha's data
 * entry is free-text URLs that can go stale or be mistyped.
 */
import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';

export function ProductImage({
  src,
  alt,
  priority = false,
  sizes,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-sink">
        <ImageOff className="h-8 w-8 text-muted" strokeWidth={1.5} aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
