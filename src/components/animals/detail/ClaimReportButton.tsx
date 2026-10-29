"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserCheck01Icon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import AuthGateModal from 'kadesh/components/auth/AuthGateModal';
import { ClaimReportModal, useAnimalClaims } from 'kadesh/components/animals/claim';
import { canEditAnimal } from 'kadesh/components/animals/canEditAnimal';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { Routes } from 'kadesh/core/routes';
import { useUser } from 'kadesh/utils/UserContext';
import type { AnimalDetail } from './hooks/useAnimalDetail';

/** Estatus en los que el animal está con quien lo encontró: su familia puede pedir el reporte. */
const STREET_STATUSES = ['found', 'rescued', 'abandoned'];
/** Al volver del inicio de sesión se abre la solicitud sola. */
const CLAIM_PARAM = 'reclamar';

interface ClaimReportButtonProps {
  animal: AnimalDetail;
  /** Estatus actual (último registro). */
  status: string;
}

/**
 * «¿Es tu mascota?» en la ficha de un reporte ajeno que subió un voluntario o alguien que lo
 * encontró. Sin sesión pide cuenta; con una solicitud pendiente muestra su estado.
 */
export default function ClaimReportButton({ animal, status }: ClaimReportButtonProps) {
  const { user } = useUser();
  const motionPrefs = useUiMotion();
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const eligible =
    !animal.duplicateOf &&
    !canEditAnimal(user, animal) &&
    (animal.reportedBy === 'volunteer' || STREET_STATUSES.includes(status));
  const { claims, cancelClaim, cancelling } = useAnimalClaims(animal.id, eligible && Boolean(user));
  const mine = claims.find((claim) => claim.status === 'pending' && claim.claimant?.id === user?.id);

  useEffect(() => {
    if (!eligible || !user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get(CLAIM_PARAM) !== '1') return;
    params.delete(CLAIM_PARAM);
    const query = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
    setOpen(true);
  }, [eligible, user]);

  if (!eligible) return null;

  const cancel = async () => {
    if (!mine) return;
    try {
      const result = await cancelClaim(mine.id);
      if (result?.success) sileo.success({ title: result.message });
      else sileo.error({ title: result?.message || 'No se pudo cancelar la solicitud' });
    } catch (error) {
      console.error('[claim] no se pudo cancelar', error);
      sileo.error({ title: 'No se pudo cancelar la solicitud' });
    }
  };

  const slug = animal.slug || animal.id;

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-2xl border border-[#ececec] bg-white px-4 py-3 dark:border-white/10 dark:bg-night-raised">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kadesh-50 text-kadesh dark:bg-kadesh/20">
        <HugeiconsIcon icon={UserCheck01Icon} size={18} strokeWidth={1.6} />
      </span>
      <p className="min-w-0 flex-1 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
        {mine
          ? 'Pediste que este reporte pase a tu nombre. Te avisaremos cuando quien lo reportó responda.'
          : '¿Es tu mascota? Si este reporte lo publicó otra persona, pide que pase a tu nombre.'}
      </p>
      {mine ? (
        <button
          type="button"
          onClick={() => void cancel()}
          disabled={cancelling}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-[#3a3a3a] hover:bg-[#f3f5f8] disabled:opacity-50 dark:text-[#d0d0d0] dark:hover:bg-night lg:min-h-9"
        >
          {cancelling ? 'Cancelando…' : 'Cancelar solicitud'}
        </button>
      ) : (
        <motion.button
          type="button"
          onClick={() => (user ? setOpen(true) : setAuthOpen(true))}
          whileTap={motionPrefs.tap}
          className="inline-flex min-h-11 items-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 lg:min-h-9"
        >
          Es mi mascota
        </motion.button>
      )}

      <ClaimReportModal
        isOpen={open}
        onClose={() => setOpen(false)}
        animalId={animal.id}
        animalName={animal.name}
        defaultPhone={user?.phone}
      />
      <AuthGateModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        redirectTo={`${Routes.animals.detail(slug)}?${CLAIM_PARAM}=1`}
        title="Inicia sesión para pedir el reporte"
        description="Así quien lo reportó sabe quién lo pide y puede contactarte antes de aceptar."
        reasons={[
          'Le avisamos a quien lo reportó y te avisamos cuando responda.',
          'Si acepta, el reporte pasa a tu nombre y lo puedes actualizar.',
          'Tu teléfono queda como contacto para quien vea a tu mascota.',
        ]}
      />
    </div>
  );
}
