'use client';

/**
 * Swipe carousel with dot indicators (Q24). Follows Framer Motion's own
 * reference pattern for a paginated, drag-to-swipe gallery: one slide
 * mounted at a time, AnimatePresence handles the enter/exit direction,
 * and onDragEnd reads offset + velocity together ("swipe power") so a
 * fast flick advances even with a small on-screen drag distance.
 *
 * Fully keyboard operable via the prev/next buttons (visible on desktop,
 * always in the tab order) — not reachable only by touch, per Q28.
 */
import { useState } from 'react';
import { AnimatePresence, m, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImage } from './product-image';
import { motion as tokens } from '@/config/theme';

const SWIPE_CONFIDENCE_THRESHOLD = 8000;
function swipePower(offset: number, velocity: number) {
  return Math.abs(offset) * velocity;
}

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
};

export function Carousel({ images, alt }: { images: string[]; alt: string }) {
  const [[page, direction], setPage] = useState([0, 0]);
  const index = ((page % images.length) + images.length) % images.length;

  function paginate(newDirection: number) {
    setPage([page + newDirection, newDirection]);
  }

  function handleDragEnd(_e: unknown, info: PanInfo) {
    const swipe = swipePower(info.offset.x, info.velocity.x);
    if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) paginate(1);
    else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) paginate(-1);
  }

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-sink">
      <AnimatePresence initial={false} custom={direction}>
        <m.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: tokens.duration.sheet, ease: tokens.ease.out }}
          drag={images.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          className="absolute inset-0"
        >
          <ProductImage src={images[index]!} alt={`${alt} — image ${index + 1} of ${images.length}`} priority sizes="100vw" />
        </m.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => paginate(-1)}
            className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-ink shadow-sm md:flex"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => paginate(1)}
            className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-ink shadow-sm md:flex"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5" role="tablist" aria-label="Image navigation">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to image ${i + 1}`}
                onClick={() => setPage([i, i > index ? 1 : -1])}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? '1.25rem' : '0.375rem',
                  background: i === index ? 'var(--color-accent)' : 'var(--color-surface)',
                  opacity: i === index ? 1 : 0.7,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
