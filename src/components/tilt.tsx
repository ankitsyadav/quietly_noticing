'use client';

/**
 * A genuine 3D perspective tilt driven by pointer position — the "heavy
 * Framer" treatment on product imagery (Q32/Q33). Desktop + fine-pointer
 * only: touch has no hover to drive it, and it would otherwise fight
 * scrolling on mobile. Fully inert under prefers-reduced-motion.
 *
 * Deliberately NOT used on the LCP element itself — this wraps interaction,
 * not the first paint, so it never delays LCP (see src/lib/motion.ts).
 */
import { useRef } from 'react';
import { m, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

export function Tilt({
  children,
  className,
  maxTilt = 10,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 300, damping: 28, mass: 0.6 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  const rotateX = useTransform(sy, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(sx, [0, 1], [-maxTilt, maxTilt]);
  const scale = useSpring(1, spring);
  const glareOpacity = useTransform(sy, [0, 0.5, 1], [0.16, 0, 0.16]);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion || e.pointerType !== 'mouse') return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handlePointerEnter(e: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion || e.pointerType !== 'mouse') return;
    scale.set(1.03);
  }

  function handlePointerLeave() {
    px.set(0.5);
    py.set(0.5);
    scale.set(1);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={className}
      style={{ perspective: 800 }}
    >
      <m.div style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d' }} className="relative h-full w-full">
        {children}
        {glare && !reducedMotion && (
          <m.div
            aria-hidden="true"
            style={{ opacity: glareOpacity }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-on-accent to-transparent mix-blend-overlay"
          />
        )}
      </m.div>
    </div>
  );
}
