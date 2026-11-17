"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { BinocularsIcon } from '@hugeicons/core-free-icons';
import { attendsAnimalReport } from 'kadesh/components/animals/canEditAnimal';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { useUser } from 'kadesh/utils/UserContext';
import type { AnimalDetail } from '../detail/hooks/useAnimalDetail';
import ReportSightingSheet from './ReportSightingSheet';
import { SIGHTING_STATUSES } from './constants';

interface SightingBannerProps {
  animal: AnimalDetail;
  /** Estatus actual (último registro). */
  status: string;
  /** «Luna» o «esta perra». */
  sentenceName: string;
  mapCenter?: { lat: number; lng: number };
  onSent?: () => void | Promise<void>;
}

/**
 * «¿Lo viste?» en la ficha de un animal perdido o abandonado. Para cualquiera menos quien atiende
 * el reporte (su autor o su equipo, que agregan un registro); un admin sí lo ve. No pide cuenta.
 */
export default function SightingBanner({ animal, status, sentenceName, mapCenter, onSent }: SightingBannerProps) {
  const { user } = useUser();
  const motionPrefs = useUiMotion();
  const [open, setOpen] = useState(false);

  if (animal.duplicateOf || !SIGHTING_STATUSES.includes(status) || attendsAnimalReport(user, animal)) return null;

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-2xl border border-kadesh/30 bg-kadesh-50 px-4 py-3 dark:border-kadesh/30 dark:bg-kadesh/10">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-kadesh dark:bg-kadesh/20">
        <HugeiconsIcon icon={BinocularsIcon} size={18} strokeWidth={1.6} />
      </span>
      <p className="min-w-0 flex-1 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
        <span className="font-semibold text-[#121212] dark:text-[#eef1f6]">¿Viste a {sentenceName}?</span>{' '}
        Dinos dónde y cuándo. No necesitas cuenta.
      </p>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileTap={motionPrefs.tap}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 lg:min-h-9"
      >
        Lo vi
      </motion.button>

      <ReportSightingSheet
        isOpen={open}
        onClose={() => setOpen(false)}
        onSent={onSent}
        animalId={animal.id}
        sentenceName={sentenceName}
        mapCenter={mapCenter}
      />
    </div>
  );
}
