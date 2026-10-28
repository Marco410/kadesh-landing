"use client";

import { useEffect, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { useUiMotion } from 'kadesh/components/shared/motion';

interface PetSheetProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
  /** Error general del envío (arriba del formulario). */
  error?: string;
  children: ReactNode;
}

/** Hoja modal de la cartilla: mismo marco que el registro de un reporte (AddLogModal). */
export default function PetSheet({
  isOpen,
  title,
  onClose,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  error,
  children,
}: PetSheetProps) {
  const motionPrefs = useUiMotion();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSubmitting, onClose]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isSubmitting) onSubmit();
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={isSubmitting ? undefined : onClose}
          variants={motionPrefs.overlay}
          initial={motionPrefs.overlay ? 'hidden' : false}
          animate="show"
          exit="exit"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pet-sheet-title"
            className="flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-t-2xl border border-[#ececec] bg-white shadow-[0_16px_40px_rgba(15,35,80,0.18)] sm:max-h-[90vh] sm:rounded-2xl dark:border-white/10 dark:bg-night-raised"
            onClick={(event) => event.stopPropagation()}
            variants={motionPrefs.sheet}
            initial={motionPrefs.sheet ? 'hidden' : false}
            animate="show"
            exit="exit"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#ececec] p-4 dark:border-white/10">
              <h2
                id="pet-sheet-title"
                className="min-w-0 break-words text-lg font-black tracking-[-0.03em] text-[#121212] dark:text-[#eef1f6]"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#5a5a5a] hover:bg-[#f7f8fa] disabled:opacity-50 dark:text-[#9aa3b2] dark:hover:bg-night"
                aria-label="Cerrar"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto p-4">
                {error ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                  >
                    {error}
                  </div>
                ) : null}
                {children}
              </div>

              <div className="flex gap-3 border-t border-[#ececec] p-4 dark:border-white/10">
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  whileTap={motionPrefs.tap}
                  className="min-h-11 flex-1 rounded-xl bg-[#f3f5f8] px-4 text-sm font-semibold text-[#121212] hover:bg-[#e6e9ef] disabled:opacity-50 dark:bg-night dark:text-[#eef1f6] dark:hover:bg-white/10"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileTap={isSubmitting ? undefined : motionPrefs.tap}
                  className="min-h-11 flex-1 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando…' : submitLabel}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
