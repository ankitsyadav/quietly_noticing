import { Flame, Sparkles, Award } from 'lucide-react';
import type { Badge as BadgeType } from '@/lib/types';

const BADGE_META: Record<BadgeType, { icon: typeof Flame; label: string }> = {
  Trending: { icon: Flame, label: 'Trending' },
  New: { icon: Sparkles, label: 'New' },
  Bestseller: { icon: Award, label: 'Bestseller' },
};

/** Small icon+label pill overlaid on a product image. Never an emoji. */
export function ProductBadge({ badge }: { badge: BadgeType }) {
  const { icon: Icon, label } = BADGE_META[badge];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-ink backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 text-accent-text" strokeWidth={2} aria-hidden="true" />
      {label}
    </span>
  );
}
