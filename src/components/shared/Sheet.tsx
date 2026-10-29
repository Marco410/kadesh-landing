"use client";

import { useEffect, useId, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { useUiMotion } from 'kadesh/components/shared/motion';

interface SheetProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  /** Mientras guarda: no se cierra con Escape, el fondo ni la X. */
  busy?: boolean;
  /** Botones fijos abajo; sin ellos el contenido llega hasta el borde. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Hoja modal: sube desde abajo en móvil y queda centrada en escritorio. Mismo marco que
 * `AddLogModal` y la cartilla (`PetSheet`), sin formulario propio. Se monta en `body` para que
 * ningún contenedor con transform la recorte.
 */
export default function Sheet({ isOpen, title, onClose, busy = false, footer, children }: SheetProps) {
  const motionPrefs = useUiMotion();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, busy, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={busy ? undefined : onClose}
          variants={motionPrefs.overlay}
          initial={motionPrefs.overlay ? 'hidden' : false}
          animate="show"
          exit="exit"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-t-2xl border border-[#ececec] bg-white shadow-[0_16px_40px_rgba(15,35,80,0.18)] sm:max-h-[90vh] sm:rounded-2xl dark:border-white/10 dark:bg-night-raised"
            onClick={(event) => event.stopPropagation()}
            variants={motionPrefs.sheet}
            initial={motionPrefs.sheet ? 'hidden' : false}
            animate="show"
            exit="exit"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#ececec] p-4 dark:border-white/10">
              <h2
                id={titleId}
                className="min-w-0 break-words text-lg font-black tracking-[-0.03em] text-[#121212] dark:text-[#eef1f6]"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#5a5a5a] hover:bg-[#f7f8fa] disabled:opacity-50 dark:text-[#9aa3b2] dark:hover:bg-night"
                aria-label="Cerrar"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>

            {footer ? (
              <div className="border-t border-[#ececec] p-4 dark:border-white/10">{footer}</div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
