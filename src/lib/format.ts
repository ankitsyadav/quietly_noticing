/** Small display helpers shared across server and client components. */
import { formatPrice } from './normalize';
export { formatPrice };

/** "70% off" — never "-70%", never a bare number. */
export function formatDiscount(pct: number): string {
  return `${pct}% off`;
}
