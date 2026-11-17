"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BinocularsIcon,
  Call02Icon,
  Location01Icon,
  ViewIcon,
  ViewOffSlashIcon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import { canEditAnimal } from 'kadesh/components/animals/canEditAnimal';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { friendlyErrorText } from 'kadesh/utils/errorText';
import { useUser } from 'kadesh/utils/UserContext';
import type { AnimalDetail, AnimalSighting } from '../detail/hooks/useAnimalDetail';
import {
  SET_ANIMAL_SIGHTING_HIDDEN_MUTATION,
  type SetAnimalSightingHiddenResponse,
} from '../queries';
import { SIGHTINGS_ANCHOR } from './constants';
import { sightingTimeLabel } from './time';

interface SightingsSectionProps {
  animal: AnimalDetail;
  onChanged?: () => void | Promise<void>;
}

function mapsUrl(sighting: AnimalSighting) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${sighting.lat},${sighting.lng}`)}`;
}

function placeText(sighting: AnimalSighting) {
  const area = [sighting.city, sighting.state].filter(Boolean).join(', ');
  return sighting.placeLabel?.trim() || area || 'Ubicación en el mapa';
}

/**
 * «Lo han visto»: los avistamientos del reporte, del más reciente al más viejo. Quien atiende el
 * reporte ve además el contacto que dejaron y puede ocultar los que no sirvan (spam, otro animal).
 */
export default function SightingsSection({ animal, onChanged }: SightingsSectionProps) {
  const { user } = useUser();
  const motionPrefs = useUiMotion();
  const isOwner = canEditAnimal(user, animal);
  const sightings = animal.sightings ?? [];
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [setHidden] = useMutation<SetAnimalSightingHiddenResponse, { id: string; hidden: boolean }>(
    SET_ANIMAL_SIGHTING_HIDDEN_MUTATION,
  );

  if (sightings.length === 0) return null;

  const toggleHidden = async (sighting: AnimalSighting) => {
    setPendingId(sighting.id);
    try {
      const { data } = await setHidden({ variables: { id: sighting.id, hidden: !sighting.hidden } });
      const result = data?.setAnimalSightingHidden;
      if (!result?.success) {
        sileo.error({ title: result?.message || 'No se pudo guardar el cambio' });
        return;
      }
      sileo.success({ title: result.message });
      await onChanged?.();
    } catch (error) {
      sileo.error({ title: friendlyErrorText(error, 'No se pudo guardar el cambio') });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section
      id={SIGHTINGS_ANCHOR}
      className="mb-3 scroll-mt-24 rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised"
    >
      <div className="mb-3 flex items-center gap-2">
        <HugeiconsIcon icon={BinocularsIcon} size={18} strokeWidth={1.8} className="text-kadesh" aria-hidden />
        <h2 className="text-base font-black tracking-[-0.03em] text-[#121212] dark:text-[#eef1f6]">Lo han visto</h2>
        <span className="text-xs font-medium text-[#5a5a5a] dark:text-[#9aa3b2]">{sightings.length}</span>
      </div>
      {isOwner ? (
        <p className="mb-3 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
          Si un avistamiento te sirve, agrégalo al historial con «Agregar registro» para mover el pin del caso.
        </p>
      ) : null}

      <motion.ol
        className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
        variants={motionPrefs.list}
        initial={motionPrefs.list ? 'hidden' : false}
        animate="show"
      >
        {sightings.map((sighting) => {
          const phone = sighting.contactPhone?.replace(/\D/g, '') || '';
          return (
            <motion.li
              key={sighting.id}
              variants={motionPrefs.item}
              className={`flex flex-col gap-2 rounded-xl border border-[#ececec] p-3 dark:border-white/10 ${
                sighting.hidden ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <time dateTime={sighting.seenAt ?? undefined} className="text-xs font-semibold text-kadesh">
                  {sightingTimeLabel(sighting.seenAt)}
                </time>
                {sighting.hidden ? (
                  <span className="rounded-full bg-[#f3f5f8] px-2 py-0.5 text-[11px] font-semibold text-[#5a5a5a] dark:bg-night dark:text-[#9aa3b2]">
                    Oculto
                  </span>
                ) : null}
              </div>
              <a
                href={mapsUrl(sighting)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-1.5 text-sm font-medium text-[#121212] hover:text-kadesh hover:underline dark:text-[#eef1f6]"
              >
                <HugeiconsIcon icon={Location01Icon} size={16} strokeWidth={1.6} className="mt-0.5 shrink-0" aria-hidden />
                <span className="min-w-0 break-words">{placeText(sighting)}</span>
              </a>
              {sighting.notes ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#3a3a3a] dark:text-[#c5ccd8]">
                  {sighting.notes}
                </p>
              ) : null}

              {isOwner ? (
                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[#ececec] pt-2 dark:border-white/10">
                  {sighting.contactName || phone ? (
                    <span className="min-w-0 flex-1 truncate text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
                      {[sighting.contactName, phone].filter(Boolean).join(' · ')}
                    </span>
                  ) : (
                    <span className="min-w-0 flex-1 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">Sin contacto</span>
                  )}
                  {phone ? (
                    <>
                      <a
                        href={`https://wa.me/52${phone.slice(-10)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#5a5a5a] hover:bg-[#f3f5f8] hover:text-kadesh dark:text-[#9aa3b2] dark:hover:bg-night"
                        aria-label="Escribir por WhatsApp"
                      >
                        <HugeiconsIcon icon={WhatsappIcon} size={16} strokeWidth={1.6} />
                      </a>
                      <a
                        href={`tel:${phone}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#5a5a5a] hover:bg-[#f3f5f8] hover:text-kadesh dark:text-[#9aa3b2] dark:hover:bg-night"
                        aria-label="Llamar"
                      >
                        <HugeiconsIcon icon={Call02Icon} size={16} strokeWidth={1.6} />
                      </a>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void toggleHidden(sighting)}
                    disabled={pendingId === sighting.id}
                    className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[#5a5a5a] hover:bg-[#f3f5f8] disabled:opacity-50 dark:text-[#9aa3b2] dark:hover:bg-night"
                  >
                    <HugeiconsIcon icon={sighting.hidden ? ViewIcon : ViewOffSlashIcon} size={14} strokeWidth={1.6} />
                    {sighting.hidden ? 'Mostrar' : 'Ocultar'}
                  </button>
                </div>
              ) : null}
            </motion.li>
          );
        })}
      </motion.ol>
    </section>
  );
}
