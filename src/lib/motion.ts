/**
 * Shared Framer Motion variants. Every animated surface in the app pulls
 * from here rather than inlining ad-hoc durations/eases — this is the
 * enforcement mechanism for the motion spec in src/config/theme.ts.
 *
 * Two rules baked in throughout:
 *  - Nothing on the LCP path animates opacity (see heroImage). Transform
 *    (translate/scale) paints at full opacity immediately, so LCP is
 *    recorded on time even while the element visibly slides into place.
 *  - Grid card reveals use `viewport={{ once: true }}` everywhere they're
 *    applied — the observer detaches after the first reveal so a long
 *    /shop grid doesn't accumulate hundreds of live IntersectionObservers.
 */
import type { Variants, Transition } from 'framer-motion';
import { motion as tokens } from '@/config/theme';

export const springSoft: Transition = { type: 'spring', stiffness: 300, damping: 30, mass: 0.6 };
export const springSnappy: Transition = { type: 'spring', stiffness: 420, damping: 34, mass: 0.5 };

/** Hero cascade — transform-only so it never delays LCP. */
export const heroItem: Variants = {
  hidden: { opacity: 1, transform: 'translateY(14px) scale(0.98)' },
  visible: (i: number = 0) => ({
    opacity: 1,
    transform: 'translateY(0px) scale(1)',
    transition: { duration: tokens.duration.hero, ease: tokens.ease.out, delay: i * tokens.stagger },
  }),
};

/** Standard below-the-fold reveal: fade + rise, fine below the first viewport. */
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: tokens.duration.reveal, ease: tokens.ease.out, delay: i * tokens.stagger },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: tokens.duration.reveal, ease: tokens.ease.out } },
};

/** Bottom sheet: slides from the actual bottom of the viewport. */
export const sheetVariants: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { duration: tokens.duration.sheet, ease: tokens.ease.out } },
  exit: { y: '100%', transition: { duration: tokens.duration.sheet, ease: tokens.ease.in } },
};

export const scrimVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: tokens.duration.sheet } },
  exit: { opacity: 0, transition: { duration: tokens.duration.sheet } },
};

/** Container that staggers its children using revealUp/heroItem custom index. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: tokens.stagger } },
};
