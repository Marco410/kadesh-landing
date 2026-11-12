'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon } from '@hugeicons/core-free-icons';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { useUser } from 'kadesh/utils/UserContext';
import { canEditAnimal } from '../canEditAnimal';
import { OPEN_CASE_STATUSES } from '../constants';
import CloseCaseModal from './CloseCaseModal';
import type { AnimalDetail } from './hooks/useAnimalDetail';

interface CloseCaseBannerProps {
  animal: AnimalDetail;
  status: string;
  onClosed: () => void | Promise<void>;
  /** `?accion=cerrar` (recordatorios de seguimiento): abre el modal al entrar. */
  autoOpen?: boolean;
  onAutoOpened?: () => void;
}

/**
 * Invitación a cerrar el caso para quien lo atiende, mientras sigue abierto (perdido, encontrado,
 * rescatado, abandonado o en adopción). Sin esto el contador de reencuentros no crece y el mapa se
 * llena de casos viejos.
 */
export default function CloseCaseBanner({
  animal,
  status,
  onClosed,
  autoOpen = false,
  onAutoOpened,
}: CloseCaseBannerProps) {
  const { user } = useUser();
  const motionPrefs = useUiMotion();
  const [open, setOpen] = useState(false);

  const eligible =
    canEditAnimal(user, animal) && !animal.duplicateOf && OPEN_CASE_STATUSES.includes(status);

  useEffect(() => {
    if (!autoOpen || !eligible) return;
    setOpen(true);
    onAutoOpened?.();
  }, [autoOpen, eligible, onAutoOpened]);

  if (!eligible) return null;

  const name = animal.name || 'este animal';
  const question = status === 'lost' ? `¿${name} ya volvió a casa?` : `¿${name} ya encontró hogar?`;
  // Inactivo: el cron lo sacó del mapa por no tener registros (`inactiveAt`, kadesh-back).
  const hint = animal.inactiveAt
    ? 'Este reporte ya no sale en el mapa porque lleva semanas sin novedades. Ciérralo, o agrega un registro para que vuelva a salir.'
    : 'Cierra el caso para que deje de salir como activo en el mapa.';

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-2xl border border-[#ececec] bg-white px-4 py-3 dark:border-white/10 dark:bg-night-raised">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kadesh-50 text-kadesh dark:bg-kadesh/20">
        <HugeiconsIcon icon={Home01Icon} size={18} strokeWidth={1.6} aria-hidden />
      </span>
      <p className="min-w-0 flex-1 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
        {question} {hint}
      </p>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileTap={motionPrefs.tap}
        className="inline-flex min-h-11 items-center rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh hover:bg-kadesh hover:text-white lg:min-h-9"
      >
        Cerrar caso
      </motion.button>

      <CloseCaseModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onClosed={onClosed}
        animalId={animal.id}
        animalName={animal.name}
        status={status}
      />
    </div>
  );
}
