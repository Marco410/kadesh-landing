"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Call02Icon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import { ConfirmModal } from 'kadesh/components/shared';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { useAnimalClaims } from 'kadesh/components/animals/claim';
import { canEditAnimal } from 'kadesh/components/animals/canEditAnimal';
import type { AnimalClaim } from 'kadesh/components/animals/queries';
import { formatDate } from 'kadesh/utils/format-date';
import { useUser } from 'kadesh/utils/UserContext';
import type { AnimalDetail } from './hooks/useAnimalDetail';

/** El link de la notificación trae `?reclamo=<id>`: esa solicitud se resalta. */
const CLAIM_ID_PARAM = 'reclamo';

interface AnimalClaimsPanelProps {
  animal: AnimalDetail;
  /** Después de aprobar: el reporte cambió de dueño y hay que recargarlo. */
  onResolved: () => void;
}

/** Solicitudes pendientes para quedarse con el reporte. Solo las ve quien lo atiende (o un admin). */
export default function AnimalClaimsPanel({ animal, onResolved }: AnimalClaimsPanelProps) {
  const { user } = useUser();
  const motionPrefs = useUiMotion();
  const canManage = canEditAnimal(user, animal);
  const { claims, resolveClaim, resolving } = useAnimalClaims(animal.id, canManage);
  const [confirm, setConfirm] = useState<{ claim: AnimalClaim; approve: boolean } | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const pending = claims.filter((claim) => claim.status === 'pending' && claim.claimant?.id !== user?.id);

  useEffect(() => {
    setHighlightId(new URLSearchParams(window.location.search).get(CLAIM_ID_PARAM));
  }, []);

  useEffect(() => {
    if (highlightId && pending.some((claim) => claim.id === highlightId)) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Solo cuando llegan las solicitudes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightId, pending.length]);

  if (!canManage || pending.length === 0) return null;

  const respond = async () => {
    if (!confirm) return;
    const { claim, approve } = confirm;
    try {
      const result = await resolveClaim(claim.id, approve);
      if (result?.success) {
        sileo.success({ title: result.message });
        if (approve) onResolved();
      } else {
        sileo.error({ title: result?.message || 'No se pudo responder la solicitud' });
      }
    } catch (error) {
      console.error('[claim] no se pudo responder', error);
      sileo.error({ title: 'No se pudo responder la solicitud' });
    } finally {
      setConfirm(null);
    }
  };

  const nameOf = (claim: AnimalClaim) => claim.claimantName?.trim() || 'Alguien';

  return (
    <section
      ref={panelRef}
      aria-label="Solicitudes para quedarse con el reporte"
      className="shrink-0 scroll-mt-24 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 dark:border-amber-700/60 dark:bg-amber-950/30"
    >
      <h2 className="text-base font-black tracking-[-0.02em] text-[#121212] dark:text-[#eef1f6]">
        {pending.length === 1 ? 'Alguien dice que es su mascota' : `${pending.length} personas dicen que es su mascota`}
      </h2>
      <p className="mt-1 text-sm text-[#5a5a5a] dark:text-[#c3cad6]">
        Llámale antes de decidir. Si apruebas, el reporte pasa a su nombre, su teléfono queda como
        contacto principal y tú ya no podrás editarlo.
      </p>

      <ul className="mt-3 space-y-3">
        {pending.map((claim) => (
          <li
            key={claim.id}
            className={`rounded-xl border bg-white p-3 dark:bg-night-raised ${
              claim.id === highlightId
                ? 'border-kadesh ring-2 ring-kadesh/30'
                : 'border-[#ececec] dark:border-white/10'
            }`}
          >
            <div className="flex gap-3">
              {claim.evidence?.url ? (
                <a
                  href={claim.evidence.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg"
                  aria-label="Ver foto completa"
                >
                  <Image src={claim.evidence.url} alt={`Foto de ${nameOf(claim)}`} fill sizes="80px" className="object-cover" />
                </a>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#121212] dark:text-[#eef1f6]">{nameOf(claim)}</p>
                <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">{formatDate(claim.createdAt)}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#121212] dark:text-[#eef1f6]">
                  {claim.message}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {claim.phone ? (
                <a
                  href={`tel:${claim.phone}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh hover:bg-kadesh hover:text-white"
                >
                  <HugeiconsIcon icon={Call02Icon} size={16} strokeWidth={1.5} />
                  Llamar
                </a>
              ) : null}
              <motion.button
                type="button"
                onClick={() => setConfirm({ claim, approve: true })}
                disabled={resolving}
                whileTap={motionPrefs.tap}
                className="inline-flex min-h-11 items-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:opacity-50"
              >
                Aprobar
              </motion.button>
              <button
                type="button"
                onClick={() => setConfirm({ claim, approve: false })}
                disabled={resolving}
                className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-[#3a3a3a] hover:bg-[#f3f5f8] disabled:opacity-50 dark:text-[#d0d0d0] dark:hover:bg-night"
              >
                Rechazar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmModal
        isOpen={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => void respond()}
        isLoading={resolving}
        title={
          confirm?.approve
            ? `¿Pasar el reporte a ${confirm ? nameOf(confirm.claim) : ''}?`
            : '¿Rechazar la solicitud?'
        }
        message={
          confirm?.approve
            ? 'Su teléfono quedará como contacto principal y podrá actualizar el reporte. Tú ya no podrás editarlo. Las demás solicitudes se rechazan.'
            : 'Le avisaremos que no aceptaste. Puede seguir dejando comentarios en el reporte.'
        }
        confirmText={confirm?.approve ? 'Sí, pasarlo' : 'Rechazar'}
        confirmButtonColor={confirm?.approve ? 'blue' : 'red'}
      />
    </section>
  );
}
