'use client';

/**
 * Generic gesture-driven bottom sheet (Q20/Q32/Q39) — slides up on open,
 * drag-to-dismiss downward past a threshold or via the scrim. Body scroll
 * is locked while open so a background /shop grid doesn't scroll under it.
 */
import { useEffect } from 'react';
import { AnimatePresence, m, type PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { sheetVariants, scrimVariants } from '@/lib/motion';

const DISMISS_THRESHOLD = 120;

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  function handleDragEnd(_e: unknown, info: PanInfo) {
    if (info.offset.y > DISMISS_THRESHOLD || info.velocity.y > 600) onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div
            variants={scrimVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/40"
            aria-hidden="true"
          />
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-xl border-t border-line bg-surface [padding-bottom:env(safe-area-inset-bottom)]"
          >
            <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-line-strong" />
            <div className="flex items-center justify-between px-4 pb-2 pt-3">
              <h2 className="text-base font-medium text-ink">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-sink"
              >
                <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
            <div className="px-4 pb-6">{children}</div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
