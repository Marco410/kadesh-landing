"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { FavouriteIcon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import AuthGateModal from 'kadesh/components/auth/AuthGateModal';
import { canEditAnimal } from 'kadesh/components/animals/canEditAnimal';
import { getStatusColor } from 'kadesh/components/animals/constants';
import type { AnimalDetail } from 'kadesh/components/animals/detail';
import { DashStatusBadge } from 'kadesh/components/app-shell/ui';
import { ConfirmModal } from 'kadesh/components/shared';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { Routes } from 'kadesh/core/routes';
import { useUser } from 'kadesh/utils/UserContext';
import AdoptionApplicationModal from './AdoptionApplicationModal';
import { ADOPT_PARAM, ADOPTION_STATUS, adoptionStatusMeta, isOpenAdoptionStatus } from './constants';
import { adoptionAnimalName, adoptionApplicantCopy, adoptionErrorMessage } from './format';
import { useAdoptionActions } from './hooks/useAdoptionActions';
import { useMyAdoptionApplication } from './hooks/useMyAdoptionApplication';

const ADOPTABLE_STATUS = 'in_adoption';

const primaryButton =
  'inline-flex min-h-11 items-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:opacity-50 lg:min-h-9';
const quietButton =
  'inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-[#3a3a3a] hover:bg-[#f3f5f8] disabled:opacity-50 dark:text-[#d0d0d0] dark:hover:bg-night lg:min-h-9';

/**
 * «Quiero adoptarlo» en la ficha pública de un animal «En adopción». No lo ve quien puede editar el
 * animal (no puede adoptar el suyo) ni un reporte duplicado. Sin sesión pide cuenta y, al volver con
 * `?adoptar=1`, abre el formulario. Con una solicitud abierta muestra su estado y deja retirarla;
 * si la última se cerró (no aprobada, retirada) deja enviar otra. «Ver solicitud» abre su detalle en
 * el perfil («Adopciones»): el proceso, sus respuestas y, mientras siga «Enviada», editarla.
 */
export default function AdoptionApplyBanner({ animal, status }: { animal: AnimalDetail; status: string }) {
  const { user } = useUser();
  const motionPrefs = useUiMotion();
  const [formOpen, setFormOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const eligible = status === ADOPTABLE_STATUS && !animal.duplicateOf && !canEditAnimal(user, animal);
  const { application, loading, refetch } = useMyAdoptionApplication(animal.id, user?.id, eligible);
  const { withdraw, withdrawing } = useAdoptionActions();
  const open = application && isOpenAdoptionStatus(application.status) ? application : null;

  useEffect(() => {
    if (!eligible || !user || loading) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get(ADOPT_PARAM) !== '1') return;
    params.delete(ADOPT_PARAM);
    const query = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
    if (!open) setFormOpen(true);
  }, [eligible, user, loading, open]);

  if (!eligible) return null;

  const name = adoptionAnimalName(animal.name);
  const sentenceName = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  const female = animal.sex === 'female';
  const cta = female ? 'Quiero adoptarla' : 'Quiero adoptarlo';
  const slug = animal.slug || animal.id;
  const meta = application ? adoptionStatusMeta(application.status) : null;
  const note = application?.decisionNote?.trim();
  const showNote = Boolean(note) && application?.status !== ADOPTION_STATUS.WITHDRAWN;

  const handleWithdraw = async () => {
    if (!open) return;
    try {
      const result = await withdraw(open.id);
      if (result?.success) {
        sileo.success({ title: result.message || 'Retiraste tu solicitud' });
        setConfirmWithdraw(false);
        await refetch();
      } else {
        sileo.error({ title: 'No se pudo retirar la solicitud', description: result?.message });
      }
    } catch (error) {
      console.error('[adopcion] no se pudo retirar', error);
      sileo.error({
        title: 'No se pudo retirar la solicitud',
        description: adoptionErrorMessage(error, 'Revisa tu conexión e inténtalo de nuevo.'),
      });
    }
  };

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-2xl border border-[#ececec] bg-white px-4 py-3 dark:border-white/10 dark:bg-night-raised">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kadesh-50 text-kadesh dark:bg-kadesh/20">
        <HugeiconsIcon icon={FavouriteIcon} size={18} strokeWidth={1.6} aria-hidden />
      </span>
      <div className="min-w-0 flex-1 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
        {application && meta ? (
          <>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-[#121212] dark:text-[#eef1f6]">Tu solicitud:</span>
              <DashStatusBadge label={meta.label} tone={meta.tone} />
            </p>
            <p className="mt-1">{adoptionApplicantCopy(application.status, name)}</p>
            {showNote ? (
              <p className="mt-1 whitespace-pre-wrap text-[#5a5a5a] dark:text-[#9aa3b2]">
                <span className="font-semibold">Te dejaron un mensaje:</span> {note}
              </p>
            ) : null}
          </>
        ) : (
          <p>
            {sentenceName} busca familia. ¿Le quieres dar un hogar? Envía tu solicitud y quien {female ? 'la' : 'lo'} cuida te
            contactará.
          </p>
        )}
      </div>

      {application ? (
        <Link href={Routes.profileAdoption(application.id)} className={quietButton}>
          Ver solicitud
        </Link>
      ) : null}
      {open ? (
        <button
          type="button"
          onClick={() => setConfirmWithdraw(true)}
          disabled={withdrawing}
          className={quietButton}
        >
          Retirar solicitud
        </button>
      ) : application?.status === ADOPTION_STATUS.COMPLETED ? null : (
        <motion.button
          type="button"
          onClick={() => (user ? setFormOpen(true) : setAuthOpen(true))}
          disabled={Boolean(user) && loading}
          whileTap={motionPrefs.tap}
          className={application ? quietButton : primaryButton}
        >
          {application ? 'Enviar otra solicitud' : cta}
        </motion.button>
      )}

      {user ? (
        <AdoptionApplicationModal
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          animalId={animal.id}
          animalName={animal.name}
          animalSex={animal.sex}
          defaultPhone={user.phone}
          onSubmitted={() => {
            void refetch();
          }}
        />
      ) : null}
      <ConfirmModal
        isOpen={confirmWithdraw}
        onClose={() => setConfirmWithdraw(false)}
        onConfirm={() => void handleWithdraw()}
        isLoading={withdrawing}
        title="¿Retirar tu solicitud?"
        message={`Quien cuida a ${name} ya no la verá como pendiente. Si cambias de opinión, puedes enviar otra mientras siga en adopción.`}
        confirmText="Sí, retirarla"
        cancelText="No, mantenerla"
        confirmButtonColor="red"
      />
      <AuthGateModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        redirectTo={`${Routes.animals.detail(slug)}?${ADOPT_PARAM}=1`}
        title={`Inicia sesión para adoptar a ${name}`}
        description={`Así quien ${female ? 'la' : 'lo'} cuida sabe quién eres y puede contactarte.`}
        reasons={[
          'Llenas una solicitud corta sobre ti y tu hogar.',
          `Quien ${female ? 'la' : 'lo'} cuida revisa tu solicitud y te contacta por teléfono o WhatsApp.`,
          'Te avisamos en cada paso, hasta que llegue a casa.',
        ]}
        accentColor={getStatusColor(ADOPTABLE_STATUS)}
      />
    </div>
  );
}
