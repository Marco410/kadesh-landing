"use client";

import { useEffect, useId, useState } from 'react';
import { useInDash } from 'kadesh/components/app-shell/DashPortalContext';
import { DashButton, DashModal, dashLabelClass, dashTextareaClass } from 'kadesh/components/app-shell/ui';
import { Sheet } from 'kadesh/components/shared';
import { ADOPTION_LIMITS } from './constants';

export type AdoptionDecision = 'approved' | 'rejected';

interface AdoptionDecisionModalProps {
  open: boolean;
  decision: AdoptionDecision;
  applicantName: string;
  animalName: string;
  busy: boolean;
  onClose: () => void;
  /** `note` puede ir vacía: es opcional. */
  onConfirm: (note: string) => void;
}

const COPY: Record<
  AdoptionDecision,
  (applicant: string, animal: string) => { title: string; body: string; hint: string; placeholder: string; confirm: string }
> = {
  approved: (applicant, animal) => ({
    title: `¿Aprobar la solicitud de ${applicant}?`,
    body: `Le avisaremos a ${applicant} que aprobaste su solicitud. Luego coordinen cómo y cuándo conoce a ${animal}; cuando se vaya a su nuevo hogar, usa «Completar adopción».`,
    hint: `Le llega a ${applicant} junto con el aviso.`,
    placeholder: 'Te escribimos por WhatsApp para coordinar la visita.',
    confirm: 'Aprobar',
  }),
  rejected: (applicant, animal) => ({
    title: `¿No aprobar la solicitud de ${applicant}?`,
    body: `Le avisaremos a ${applicant}, con cuidado, que esta vez no fue posible. Si quieres, déjale un mensaje: un motivo breve y amable ayuda.`,
    hint: `Le llega a ${applicant} junto con el aviso.`,
    placeholder: `Gracias por tu interés en ${animal}. Buscamos una familia con patio porque necesita mucho espacio.`,
    confirm: 'No aprobar',
  }),
};

/**
 * Aprobar o no aprobar, con un mensaje opcional para quien envió la solicitud. Dentro del panel usa
 * el modal del panel; en la ficha pública, la hoja del sitio (igual que `ConfirmModal`).
 */
export default function AdoptionDecisionModal({
  open,
  decision,
  applicantName,
  animalName,
  busy,
  onClose,
  onConfirm,
}: AdoptionDecisionModalProps) {
  const inDash = useInDash();
  const noteId = useId();
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) setNote('');
  }, [open, decision]);

  const copy = COPY[decision](applicantName, animalName);
  const danger = decision === 'rejected';

  const field = (
    <div>
      <label
        htmlFor={noteId}
        className={inDash ? dashLabelClass : 'mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]'}
      >
        Mensaje para {applicantName} (opcional)
      </label>
      <textarea
        id={noteId}
        value={note}
        onChange={(event) => setNote(event.target.value.slice(0, ADOPTION_LIMITS.NOTE_MAX))}
        rows={3}
        placeholder={copy.placeholder}
        disabled={busy}
        aria-describedby={`${noteId}-hint`}
        className={
          inDash
            ? dashTextareaClass
            : 'w-full resize-none rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2]'
        }
      />
      <p
        id={`${noteId}-hint`}
        className={`mt-1 flex justify-between gap-3 text-xs ${inDash ? 'text-dash-muted' : 'text-[#5a5a5a] dark:text-[#9aa3b2]'}`}
      >
        <span>{copy.hint}</span>
        <span className="shrink-0 tabular-nums">
          {note.length}/{ADOPTION_LIMITS.NOTE_MAX}
        </span>
      </p>
    </div>
  );

  if (inDash) {
    return (
      <DashModal
        open={open}
        onClose={onClose}
        busy={busy}
        title={copy.title}
        footer={
          <>
            <DashButton variant="ghost" onClick={onClose} disabled={busy}>
              Cancelar
            </DashButton>
            <DashButton variant={danger ? 'danger' : 'primary'} onClick={() => onConfirm(note)} disabled={busy}>
              {busy ? 'Guardando…' : copy.confirm}
            </DashButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[15px] leading-relaxed text-dash-muted">{copy.body}</p>
          {field}
        </div>
      </DashModal>
    );
  }

  return (
    <Sheet
      isOpen={open}
      title={copy.title}
      onClose={onClose}
      busy={busy}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="min-h-11 flex-1 rounded-xl bg-[#f3f5f8] px-4 text-sm font-semibold text-[#121212] hover:bg-[#e6e9ef] disabled:opacity-50 dark:bg-night dark:text-[#eef1f6] dark:hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            disabled={busy}
            className={`min-h-11 flex-1 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-50 ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-kadesh hover:bg-kadesh-600'
            }`}
          >
            {busy ? 'Guardando…' : copy.confirm}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[#5a5a5a] dark:text-[#9aa3b2]">{copy.body}</p>
        {field}
      </div>
    </Sheet>
  );
}
