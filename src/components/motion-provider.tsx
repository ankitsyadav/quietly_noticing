'use client';

/**
 * LazyMotion + the "domAnimation" feature bundle instead of importing the
 * full `motion` object everywhere. Per the perf budget (Q29/Q32), this is
 * what takes Framer Motion from ~34KB to ~15KB gzipped — every animated
 * component below uses the lowercase `m.div` etc., never `motion.div`.
 */
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';
import { motion as motionTokens } from '@/config/theme';

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig
        transition={{ duration: motionTokens.duration.reveal, ease: motionTokens.ease.out }}
        reducedMotion="user"
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
