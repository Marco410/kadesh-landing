"use client";

import { useId, type FormEvent, type ReactNode } from 'react';
import { DashButton, DashModal } from 'kadesh/components/app-shell';

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

/**
 * Formulario de la cartilla en un `DashModal` del panel (hoja inferior en móvil, centrado en
 * escritorio). Mientras guarda no se cierra con Escape, el velo ni la ✕. El botón de enviar vive en
 * el pie del modal y se liga al formulario por `form`.
 */
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
  const formId = useId();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isSubmitting) onSubmit();
  };

  return (
    <DashModal
      open={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      busy={isSubmitting}
      footer={
        <>
          <DashButton variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </DashButton>
          <DashButton type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : submitLabel}
          </DashButton>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </div>
        ) : null}
        {children}
      </form>
    </DashModal>
  );
}
