'use client';

/**
 * The affiliate CTA. A real <a href> at all times (works with no JS, honors
 * long-press "copy link", lets merchant apps deep-link) — see Q3/Q21.
 *
 * Tab behavior: same-tab by default (best for the Instagram in-app webview,
 * where the back button becomes the re-engagement loop) and new-tab once we
 * detect a desktop-width pointer-capable viewport, per Q3's split decision.
 * useSyncExternalStore rather than an effect+setState — it subscribes to
 * matchMedia directly instead of causing an extra render pass on mount.
 */
import { useSyncExternalStore } from 'react';

const QUERY = '(min-width: 768px) and (pointer: fine)';

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false; // same-tab until proven otherwise — matches the mobile-first default
}

export function ShopNowLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const newTab = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <a
      href={href}
      aria-label={label}
      rel="sponsored nofollow noopener"
      target={newTab ? '_blank' : undefined}
      className={className}
    >
      {children}
    </a>
  );
}
