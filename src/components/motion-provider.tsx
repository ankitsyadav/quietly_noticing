'use client';

/**
 * LazyMotion + the "domMax" feature bundle instead of importing the full
 * `motion` object everywhere — every animated component uses the lowercase
 * `m.div` etc., never `motion.div`. domMax (not the lighter domAnimation)
 * because the product gallery's swipe carousel and the filter bottom sheet
 * both use drag gestures, which domAnimation doesn't include. This is the
 * deliberate cost of "heavy Framer everywhere" (Q32/Q33) — the LCP path
 * itself still never depends on JS animation, so it's unaffected.
 */
import { LazyMotion, domMax, MotionConfig } from 'framer-motion';
import { motion as motionTokens } from '@/config/theme';

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig
        transition={{ duration: motionTokens.duration.reveal, ease: motionTokens.ease.out }}
        reducedMotion="user"
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
