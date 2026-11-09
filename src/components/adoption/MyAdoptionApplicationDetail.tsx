"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApolloClient, useQuery } from '@apollo/client';
import { sileo } from 'sileo';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, Cancel01Icon, FavouriteIcon, PencilEdit02Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import {
  DashButton,
  DashErrorState,
  DashLoadingRows,
  DashSectionCard,
  DashStatusBadge,
  dashButtonClass,
  dashSurfaceClass,
} from 'kadesh/components/app-shell';
import { useProfileDetailCrumb } from 'kadesh/components/profile/shell/ProfileShell';
import { ConfirmModal } from 'kadesh/components/shared';
import { Routes } from 'kadesh/core/routes';
import { useUser } from 'kadesh/utils/UserContext';
import { cn } from 'kadesh/utils/cn';
import AdoptionApplicationModal from './AdoptionApplicationModal';
import { ADOPTION_STATUS, adoptionStatusMeta, isOpenAdoptionStatus } from './constants';
import {
  adoptionAnimalName,
  adoptionAnswerFacts,
  adoptionApplicantCopy,
  adoptionErrorMessage,
  adoptionPhoneDigits,
  adoptionShortDate,
  adoptionSteps,
  adoptionWasEdited,
  formatMxPhone,
  parseAdoptionAnswers,
  type AdoptionStep,
} from './format';
import { useAdoptionActions } from './hooks/useAdoptionActions';
import { MY_ADOPTION_APPLICATION_DETAIL_QUERY, type MyAdoptionApplicationDetailResponse } from './queries';

/** Lo que se vuelve a pedir al editar o retirar: el detalle, la lista y el aviso de la ficha. */
const REFETCH = ['MyAdoptionApplicationDetail', 'MyAdoptionApplications', 'MyAdoptionApplication'];

const STEP_DOT: Record<AdoptionStep['state'], string> = {
  done: 'bg-kadesh text-white',
  current: 'border-2 border-kadesh bg-dash-surface text-kadesh',
  upcoming: 'border border-dash-line-strong bg-dash-surface text-dash-faint',
  stopped: 'bg-dash-surface-3 text-dash-soft',
};

function AdoptionProgress({ steps }: { steps: AdoptionStep[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
            {!last ? (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-px',
                  step.state === 'done' ? 'bg-kadesh' : 'bg-dash-line',
                )}
              />
            ) : null}
            <span
              aria-hidden
              className={cn('relative flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', STEP_DOT[step.state])}
            >
              {step.state === 'done' ? (
                <HugeiconsIcon icon={Tick02Icon} size={15} strokeWidth={2.2} />
              ) : step.state === 'stopped' ? (
                <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
              ) : (
                index + 1
              )}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={cn('text-sm font-semibold', step.state === 'upcoming' ? 'text-dash-muted' : 'text-dash-ink')}>
                {step.title}
                {step.state === 'current' ? <span className="sr-only"> (paso actual)</span> : null}
                {step.date ? (
                  <span className="ml-2 text-xs font-normal text-dash-muted">{adoptionShortDate(step.date)}</span>
                ) : null}
              </p>
              {step.detail ? <p className="mt-0.5 text-[13px] leading-relaxed text-dash-muted">{step.detail}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-dash-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-dash-ink first-letter:uppercase">{value}</dd>
    </div>
  );
}

/**
 * Detalle de una solicitud propia («Adopciones» del perfil): cómo va el proceso, el mensaje de
 * quien cuida al animal y lo que envió. Mientras siga «Enviada» la puede editar; abierta, retirarla.
 * Al completarse la adopción enlaza a la cartilla que recibió.
 */
export default function MyAdoptionApplicationDetail({ applicationId, userId }: { applicationId: string; userId: string }) {
  const client = useApolloClient();
  const { user } = useUser();
  const [editing, setEditing] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const { withdraw, withdrawing } = useAdoptionActions();
  const { data, loading, error } = useQuery<MyAdoptionApplicationDetailResponse>(MY_ADOPTION_APPLICATION_DETAIL_QUERY, {
    variables: { id: applicationId },
    fetchPolicy: 'cache-and-network',
  });
  const application = data?.adoptionApplication ?? null;
  const animal = application?.animal ?? null;
  const name = adoptionAnimalName(animal?.name);
  const title = name === 'este animal' ? 'Sin nombre' : name;
  useProfileDetailCrumb(application ? title : null);

  const backLink = (
    <Link
      href={Routes.profileAdoptions}
      className="mb-3 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-dash-soft hover:bg-dash-hover"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={1.6} aria-hidden />
      Mis solicitudes
    </Link>
  );

  if (loading && !data) {
    return (
      <div>
        {backLink}
        <DashLoadingRows rows={4} label="Cargando tu solicitud" />
      </div>
    );
  }

  if (!application || application.applicant?.id !== userId) {
    return (
      <div>
        {backLink}
        {error && !data ? (
          <DashErrorState message={adoptionErrorMessage(error, 'No pudimos cargar tu solicitud. Intenta de nuevo.')} />
        ) : (
          <div className={cn(dashSurfaceClass, 'p-5')}>
            <p className="font-semibold text-dash-ink">No encontramos esta solicitud</p>
            <p className="mt-1 text-sm text-dash-muted">
              Aquí solo ves las solicitudes que tú enviaste. Si cuidas a este animal, las revisas desde su ficha.
            </p>
          </div>
        )}
      </div>
    );
  }

  const status = application.status;
  const meta = adoptionStatusMeta(status);
  const open = isOpenAdoptionStatus(status);
  const editable = status === ADOPTION_STATUS.SUBMITTED;
  const female = animal?.sex === 'female';
  const photo = animal?.multimedia?.[0]?.image?.url ?? null;
  const caretaker = animal?.organization?.name ?? null;
  const animalHref = animal ? Routes.animals.detail(animal.slug || animal.id) : null;
  const note = application.decisionNote?.trim();
  const showNote = Boolean(note) && status !== ADOPTION_STATUS.WITHDRAWN;
  const answers = parseAdoptionAnswers(application.answers);
  const phone = adoptionPhoneDigits(application.phone);
  const edited = editable && adoptionWasEdited(application.createdAt, application.updatedAt);

  const refresh = () => client.refetchQueries({ include: REFETCH });

  const handleWithdraw = async () => {
    try {
      const result = await withdraw(application.id);
      if (result?.success) {
        sileo.success({ title: result.message || 'Retiraste tu solicitud' });
        setConfirmWithdraw(false);
        await refresh();
      } else {
        sileo.error({ title: 'No se pudo retirar la solicitud', description: result?.message });
      }
    } catch (withdrawError) {
      console.error('[adopcion] no se pudo retirar', withdrawError);
      sileo.error({
        title: 'No se pudo retirar la solicitud',
        description: adoptionErrorMessage(withdrawError, 'Revisa tu conexión e inténtalo de nuevo.'),
      });
    }
  };

  return (
    <div>
      {backLink}

      <div className="space-y-4">
        <section className={cn(dashSurfaceClass, 'p-5 md:p-6')}>
          <div className="flex items-start gap-4">
            <span className="relative size-[72px] shrink-0 overflow-hidden rounded-2xl bg-dash-surface-2">
              {photo ? (
                <Image src={photo} alt="" fill className="object-cover" sizes="72px" />
              ) : (
                <span className="flex size-full items-center justify-center text-dash-faint">
                  <HugeiconsIcon icon={FavouriteIcon} size={26} strokeWidth={1.5} aria-hidden />
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-dash-ink">{title}</h2>
                <DashStatusBadge label={meta.label} tone={meta.tone} />
              </div>
              <p className="mt-1 text-[13px] text-dash-muted">
                {[
                  `Enviada el ${adoptionShortDate(application.createdAt)}`,
                  edited ? `editada el ${adoptionShortDate(application.updatedAt)}` : null,
                  caretaker ? `${female ? 'La' : 'Lo'} cuida ${caretaker}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-dash-soft">{adoptionApplicantCopy(status, name)}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {status === ADOPTION_STATUS.COMPLETED && application.pet?.id ? (
              <Link href={Routes.profilePet(application.pet.id)} className={dashButtonClass({ variant: 'primary', size: 'sm' })}>
                Ver su cartilla
              </Link>
            ) : null}
            {editable ? (
              <DashButton variant="primary" size="sm" icon={PencilEdit02Icon} onClick={() => setEditing(true)}>
                Editar solicitud
              </DashButton>
            ) : null}
            {animalHref ? (
              <Link href={animalHref} className={dashButtonClass({ variant: 'outline', size: 'sm' })}>
                {title === 'Sin nombre' ? 'Ver su ficha' : `Ver ficha de ${title}`}
              </Link>
            ) : null}
            {open ? (
              <DashButton variant="danger-ghost" size="sm" onClick={() => setConfirmWithdraw(true)} disabled={withdrawing}>
                Retirar solicitud
              </DashButton>
            ) : null}
          </div>
        </section>

        {showNote ? (
          <DashSectionCard title={`Mensaje de quien ${female ? 'la' : 'lo'} cuida`} index={1}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-dash-ink">{note}</p>
            {application.decidedAt ? (
              <p className="mt-2 text-xs text-dash-muted">{adoptionShortDate(application.decidedAt)}</p>
            ) : null}
          </DashSectionCard>
        ) : null}

        <DashSectionCard title="Cómo va" description="Te avisamos en la campana en cada paso." index={2}>
          <AdoptionProgress steps={adoptionSteps(application, name)} />
        </DashSectionCard>

        <DashSectionCard
          title="Lo que enviaste"
          description={
            editable
              ? `La puedes editar mientras quien ${female ? 'la' : 'lo'} cuida no la ponga en revisión.`
              : open
                ? 'Ya la están revisando, así que ya no se puede editar. Si algo cambió, cuéntaselo cuando te contacten.'
                : undefined
          }
          index={3}
        >
          <div className="space-y-5">
            {application.message?.trim() ? (
              <div>
                <p className="text-xs text-dash-muted">Por qué quieres adoptar{female ? 'la' : 'lo'}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-dash-ink">{application.message.trim()}</p>
              </div>
            ) : null}
            <dl className="grid gap-4 sm:grid-cols-2">
              {adoptionAnswerFacts(answers).map((fact) => (
                <Fact key={fact.label} label={fact.label} value={fact.value} />
              ))}
              {answers.otherPets?.trim() ? <Fact label="Otros animales" value={answers.otherPets.trim()} /> : null}
              {answers.experience?.trim() ? <Fact label="Experiencia" value={answers.experience.trim()} /> : null}
              {phone ? <Fact label="Tu teléfono" value={formatMxPhone(phone)} /> : null}
            </dl>
            <div>
              <p className="text-xs text-dash-muted">Tus compromisos</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-dash-ink">
                <li>Esterilizar{female ? 'la' : 'lo'} si aún no lo está.</li>
                <li>Aceptar que te contacten para dar seguimiento después de la adopción.</li>
              </ul>
            </div>
          </div>
        </DashSectionCard>
      </div>

      {editable && animal ? (
        <AdoptionApplicationModal
          key={`${application.id}-${application.updatedAt ?? ''}`}
          isOpen={editing}
          onClose={() => setEditing(false)}
          animalId={animal.id}
          animalName={animal.name}
          animalSex={animal.sex}
          defaultPhone={user?.phone}
          application={{
            id: application.id,
            phone: application.phone,
            message: application.message,
            answers: application.answers,
          }}
          onSubmitted={() => {
            void refresh();
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
    </div>
  );
}
