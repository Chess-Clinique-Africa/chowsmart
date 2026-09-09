import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { backdrop, easeOut, softSpring } from '@/utils/motion';

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Wider panel for forms */
  size?: 'sm' | 'md' | 'lg';
  closeDisabled?: boolean;
};

const sizeClass = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({
  open,
  title,
  onClose,
  children,
  size = 'md',
  closeDisabled = false,
}: ModalProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !closeDisabled) onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, closeDisabled]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(21,45,41,0.42)] p-0 sm:items-center sm:p-6"
          role="presentation"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => {
            if (e.target === e.currentTarget && !closeDisabled) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            transition={reduce ? { duration: 0 } : softSpring}
            className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-bg-elevated shadow-soft sm:rounded-2xl ${sizeClass[size]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 id="admin-modal-title" className="font-extrabold tracking-tight text-xl capitalize">
                {title}
              </h2>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:bg-line/60 disabled:opacity-50"
                aria-label="Close"
                disabled={closeDisabled}
                onClick={onClose}
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <motion.div
              className="overflow-y-auto px-5 py-4"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.28, ease: easeOut }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
