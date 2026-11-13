'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import { ConfirmModal } from 'kadesh/components/shared';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { Routes } from 'kadesh/core/routes';
import { useUser } from 'kadesh/utils/UserContext';
import { KEEP_ANIMAL_MUTATION, type KeepAnimalResponse } from '../queries';
import type { AnimalDetail } from './hooks/useAnimalDetail';
import { animalNameSource, animalSentenceName, capitalizeFirst } from '../animalName';

/** Estados en los que quien publicó tenía al animal consigo (no aplica a un perdido propio). */
const KEEPABLE_STATUSES = ['rescued', 'found', 'abandoned', 'in_adoption'];

/**
 * «Se quedó conmigo» para quien publicó el reporte: lo pasa a su cartilla (datos y fotos) para
 * llevar vacunas y recordatorios, y el reporte se cierra «En familia». No aparece en reportes de un
 * espacio de rescate (allá la adopción la completa el equipo) ni si ya tiene cartilla.
 */
export default function KeepAnimalButton({ animal, status }: { animal: AnimalDetail; status: string }) {
  const router = useRouter();
  const { user } = useUser();
  const motionPrefs = useUiMotion();
  const [confirming, setConfirming] = useState(false);
  const [keep, { loading }] = useMutation<KeepAnimalResponse>(KEEP_ANIMAL_MUTATION);

  const eligible =
    Boolean(user?.id) &&
    animal.user?.id === user?.id &&
    !animal.organization &&
    !animal.pet &&
    !animal.duplicateOf &&
    KEEPABLE_STATUSES.includes(status);
  if (!eligible) return null;

  const who = capitalizeFirst(animalSentenceName(animalNameSource(animal)));

  const handleKeep = async () => {
    try {
      const result = await keep({ variables: { animalId: animal.id } });
      const payload = result.data?.convertAnimalToPet;
      if (!payload?.success || !payload.petId) {
        sileo.error({ title: 'No se pudo pasar a tu cartilla', description: payload?.message });
        return;
      }
      setConfirming(false);
      sileo.success({ title: payload.message, description: 'Ya puedes llevar sus vacunas y recordatorios.' });
      router.push(Routes.profilePet(payload.petId));
    } catch {
      sileo.error({ title: 'No se pudo pasar a tu cartilla', description: 'Revisa tu conexión e intenta de nuevo.' });
    }
  };

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-2xl border border-[#ececec] bg-white px-4 py-3 dark:border-white/10 dark:bg-night-raised">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kadesh-50 text-kadesh dark:bg-kadesh/20">
        <HugeiconsIcon icon={Home01Icon} size={18} strokeWidth={1.6} aria-hidden />
      </span>
      <p className="min-w-0 flex-1 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
        ¿{who} se quedó contigo? Pásalo a tu cartilla para llevar sus vacunas y recordatorios.
      </p>
      <motion.button
        type="button"
        onClick={() => setConfirming(true)}
        whileTap={motionPrefs.tap}
        className="inline-flex min-h-11 items-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 lg:min-h-9"
      >
        Se quedó conmigo
      </motion.button>

      <ConfirmModal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={handleKeep}
        title={`¿${who} se quedó contigo?`}
        message="Crearemos su cartilla con los datos y fotos del reporte, y el reporte quedará «En familia»."
        confirmText="Sí, se quedó conmigo"
        confirmButtonColor="blue"
        isLoading={loading}
      />
    </div>
  );
}
