"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Megaphone01Icon } from '@hugeicons/core-free-icons';
import { canEditAnimal } from 'kadesh/components/animals/canEditAnimal';
import type { AnimalDetail } from 'kadesh/components/animals/detail/hooks/useAnimalDetail';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { useUser } from 'kadesh/utils/UserContext';
import { isPromotableStatus } from './constants';
import PromotionSheet from './PromotionSheet';

interface PromoteReportBannerProps {
  animal: AnimalDetail;
  /** Estatus actual (último registro). */
  status: string;
  /** Zona del último registro, para el mensaje de WhatsApp. */
  place?: string | null;
  /** Abrir la hoja al entrar (`?accion=impulsar`, desde el correo de reporte publicado). */
  autoOpen?: boolean;
  /** Ya se abrió: la ficha quita el parámetro. */
  onAutoOpened?: () => void;
}

/**
 * Ofrece, solo a quien puede editar el reporte, pagar un anuncio en Facebook e Instagram. Es
 * opcional y discreto: el reporte ya se publicó gratis en la página de KADESH.
 */
export default function PromoteReportBanner({
  animal,
  status,
  place,
  autoOpen = false,
  onAutoOpened,
}: PromoteReportBannerProps) {
  const { user } = useUser();
  const motionPrefs = useUiMotion();
  const [open, setOpen] = useState(false);
  const eligible = !animal.duplicateOf && isPromotableStatus(status) && canEditAnimal(user, animal);

  useEffect(() => {
    if (!autoOpen || !eligible) return;
    setOpen(true);
    onAutoOpened?.();
  }, [autoOpen, eligible, onAutoOpened]);

  if (!eligible) return null;

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-2xl border border-[#ececec] bg-white px-4 py-3 dark:border-white/10 dark:bg-night-raised">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kadesh-50 text-kadesh dark:bg-kadesh/20">
        <HugeiconsIcon icon={Megaphone01Icon} size={18} strokeWidth={1.6} />
      </span>
      <p className="min-w-0 flex-1 basis-[14rem] text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
        Tu reporte ya está en nuestra página de Facebook, gratis. Si quieres que lo vea más gente de la zona, puedes
        pagar un anuncio: KADESH no cobra nada y te mandamos los comprobantes.
      </p>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileTap={motionPrefs.tap}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh hover:text-white sm:w-auto lg:min-h-9"
      >
        Impulsar en Facebook
      </motion.button>

      <PromotionSheet
        isOpen={open}
        onClose={() => setOpen(false)}
        animal={animal}
        status={status}
        place={place}
      />
    </div>
  );
}
