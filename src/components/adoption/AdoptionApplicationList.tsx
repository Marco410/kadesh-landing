"use client";

import { useState } from 'react';
import { sileo } from 'sileo';
import { ConfirmModal } from 'kadesh/components/shared';
import AdoptionApplicationCard, { type AdoptionCardAction } from './AdoptionApplicationCard';
import AdoptionDecisionModal, { type AdoptionDecision } from './AdoptionDecisionModal';
import { adoptionAnimalName, adoptionErrorMessage } from './format';
import { useAdoptionActions } from './hooks/useAdoptionActions';
import type { AdoptionApplication } from './types';

export interface AdoptionListChange {
  applicationId: string;
  /** Se completó la adopción: el animal cambió («Adoptado») y hay que recargarlo. */
  completed: boolean;
}

interface AdoptionApplicationListProps {
  applications: AdoptionApplication[];
  canReview: boolean;
  canComplete: boolean;
  showAnimal?: boolean;
  highlightId?: string | null;
  /** Después de cada acción con éxito: quien pinta la lista la vuelve a pedir. */
  onChanged: (change: AdoptionListChange) => void | Promise<void>;
  className?: string;
}

/**
 * Tarjetas de solicitudes con sus acciones. Lo comparten el panel de la ficha pública y la vista
 * «Solicitudes» del espacio de rescate. «Poner en revisión» va directo; aprobar y no aprobar piden
 * un mensaje opcional; completar pide confirmación.
 */
export default function AdoptionApplicationList({
  applications,
  canReview,
  canComplete,
  showAnimal = false,
  highlightId,
  onChanged,
  className,
}: AdoptionApplicationListProps) {
  const { review, reviewing, complete, completing } = useAdoptionActions();
  // La solicitud elegida se conserva al cerrar: el diálogo no cambia de texto mientras se va.
  const [decision, setDecision] = useState<{ application: AdoptionApplication; decision: AdoptionDecision } | null>(
    null,
  );
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [toComplete, setToComplete] = useState<AdoptionApplication | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [pending, setPending] = useState<{ id: string; action: AdoptionCardAction } | null>(null);
  const busy = reviewing || completing;

  const nameOf = (application: AdoptionApplication | null | undefined) =>
    application?.applicantName?.trim() || 'esta persona';

  const runReview = async (application: AdoptionApplication, status: 'in_review' | AdoptionDecision, note?: string) => {
    setPending({ id: application.id, action: status });
    try {
      const result = await review(application.id, status, note);
      if (!result?.success) {
        sileo.error({ title: 'No se pudo guardar', description: result?.message });
        return;
      }
      sileo.success({ title: result.message || 'Listo' });
      setDecisionOpen(false);
      await onChanged({ applicationId: application.id, completed: false });
    } catch (error) {
      console.error('[adopcion] no se pudo revisar', error);
      sileo.error({
        title: 'No se pudo guardar',
        description: adoptionErrorMessage(error, 'Revisa tu conexión e inténtalo de nuevo.'),
      });
    } finally {
      setPending(null);
    }
  };

  const runComplete = async () => {
    const application = toComplete;
    if (!application) return;
    setPending({ id: application.id, action: 'complete' });
    try {
      const result = await complete(application.id);
      if (!result?.success) {
        sileo.error({ title: 'No se pudo completar la adopción', description: result?.message });
        return;
      }
      sileo.success({
        title: `¡${adoptionAnimalName(application.animal?.name)} tiene familia!`,
        description: result.message,
      });
      setCompleteOpen(false);
      await onChanged({ applicationId: application.id, completed: true });
    } catch (error) {
      console.error('[adopcion] no se pudo completar', error);
      sileo.error({
        title: 'No se pudo completar la adopción',
        description: adoptionErrorMessage(error, 'Revisa tu conexión e inténtalo de nuevo.'),
      });
    } finally {
      setPending(null);
    }
  };

  const handleAction = (action: AdoptionCardAction, application: AdoptionApplication) => {
    if (action === 'in_review') {
      void runReview(application, 'in_review');
    } else if (action === 'complete') {
      setToComplete(application);
      setCompleteOpen(true);
    } else {
      setDecision({ application, decision: action });
      setDecisionOpen(true);
    }
  };

  return (
    <>
      <ul className={className ?? 'space-y-3'}>
        {applications.map((application) => (
          <li key={application.id}>
            <AdoptionApplicationCard
              application={application}
              showAnimal={showAnimal}
              highlighted={application.id === highlightId}
              canReview={canReview}
              canComplete={canComplete}
              busy={busy}
              pendingAction={pending?.id === application.id ? pending.action : null}
              onAction={handleAction}
            />
          </li>
        ))}
      </ul>

      <AdoptionDecisionModal
        open={decisionOpen}
        decision={decision?.decision ?? 'approved'}
        applicantName={nameOf(decision?.application)}
        animalName={adoptionAnimalName(decision?.application.animal?.name)}
        busy={reviewing}
        onClose={() => setDecisionOpen(false)}
        onConfirm={(note) => {
          if (decision) void runReview(decision.application, decision.decision, note);
        }}
      />

      <ConfirmModal
        isOpen={completeOpen}
        onClose={() => setCompleteOpen(false)}
        onConfirm={() => void runComplete()}
        isLoading={completing}
        title={`¿Completar la adopción de ${adoptionAnimalName(toComplete?.animal?.name)}?`}
        message={`Su cartilla (o una nueva con los datos del reporte) pasará a la cuenta de ${nameOf(toComplete)} y el reporte quedará como Adoptado. Las demás solicitudes se cerrarán.`}
        confirmText="Completar adopción"
        confirmButtonColor="blue"
      />
    </>
  );
}
