"use client";

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Call02Icon, CheckmarkCircle02Icon, Mail01Icon, WhatsappIcon } from '@hugeicons/core-free-icons';
import { useInDash } from 'kadesh/components/app-shell/DashPortalContext';
import { DashStatusBadge, dashButtonClass } from 'kadesh/components/app-shell/ui';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { formatDate } from 'kadesh/utils/format-date';
import { ADOPTION_STATUS, adoptionStatusMeta } from './constants';
import {
  adoptionAnimalName,
  adoptionAnswerFacts,
  adoptionCommitments,
  adoptionPhoneDigits,
  adoptionWhatsAppUrl,
  formatMxPhone,
  parseAdoptionAnswers,
} from './format';
import type { AdoptionApplication } from './types';

export type AdoptionCardAction = 'in_review' | 'approved' | 'rejected' | 'complete';

/** El panel del espacio usa el kit del panel; la ficha pública, los colores del sitio. */
function cardStyles(inDash: boolean) {
  if (inDash) {
    return {
      card: 'rounded-2xl border bg-dash-surface p-4',
      cardIdle: 'border-dash-line',
      cardHighlight: 'border-kadesh-400 ring-2 ring-kadesh-400/30',
      ink: 'text-dash-ink',
      muted: 'text-dash-muted',
      box: 'rounded-xl bg-dash-surface-2 p-3',
      primary: dashButtonClass({ variant: 'primary', size: 'sm' }),
      outline: dashButtonClass({ variant: 'outline', size: 'sm' }),
      quiet: dashButtonClass({ variant: 'ghost', size: 'sm' }),
      contact: dashButtonClass({ variant: 'outline', size: 'sm' }),
      link: 'font-semibold text-dash-ink underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400 rounded',
    };
  }
  return {
    card: 'rounded-xl border bg-white p-3 sm:p-4 dark:bg-night-raised',
    cardIdle: 'border-[#ececec] dark:border-white/10',
    cardHighlight: 'border-kadesh ring-2 ring-kadesh/30',
    ink: 'text-[#121212] dark:text-[#eef1f6]',
    muted: 'text-[#5a5a5a] dark:text-[#9aa3b2]',
    box: 'rounded-xl bg-[#f7f8fa] p-3 dark:bg-night',
    primary:
      'inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:opacity-50 lg:min-h-9',
    outline:
      'inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh hover:bg-kadesh hover:text-white disabled:opacity-50 lg:min-h-9',
    quiet:
      'inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-[#3a3a3a] hover:bg-[#f3f5f8] disabled:opacity-50 dark:text-[#d0d0d0] dark:hover:bg-night lg:min-h-9',
    contact:
      'inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#d8dee8] px-3 text-sm font-semibold text-[#121212] hover:border-kadesh hover:text-kadesh dark:border-white/18 dark:text-[#eef1f6] lg:min-h-9',
    link: 'font-semibold text-kadesh hover:underline',
  };
}

interface AdoptionApplicationCardProps {
  application: AdoptionApplication;
  /** En el panel del espacio: a qué animal es la solicitud (con enlace a su ficha). */
  showAnimal?: boolean;
  highlighted?: boolean;
  /** Poner en revisión, aprobar y no aprobar. */
  canReview: boolean;
  /** Completar la adopción (el backend tiene la última palabra). */
  canComplete: boolean;
  /** Hay una acción en curso: se desactivan los botones. */
  busy: boolean;
  /** La acción en curso de esta tarjeta (para el texto «Guardando…»). */
  pendingAction?: AdoptionCardAction | null;
  onAction: (action: AdoptionCardAction, application: AdoptionApplication) => void;
}

/** Una solicitud para quien la revisa: quién, su mensaje, sus respuestas, contacto y acciones. */
export default function AdoptionApplicationCard({
  application,
  showAnimal = false,
  highlighted = false,
  canReview,
  canComplete,
  busy,
  pendingAction,
  onAction,
}: AdoptionApplicationCardProps) {
  const s = cardStyles(useInDash());
  const meta = adoptionStatusMeta(application.status);
  const answers = parseAdoptionAnswers(application.answers);
  const facts = adoptionAnswerFacts(answers);
  const commitments = adoptionCommitments(answers);
  const applicant = application.applicantName?.trim() || 'Alguien';
  const animal = application.animal;
  const animalName = adoptionAnimalName(animal?.name);
  const digits = adoptionPhoneDigits(application.phone);
  const email = application.applicantEmail?.trim();
  const note = application.decisionNote?.trim();
  const status = application.status;

  const actions: Array<{ action: AdoptionCardAction; label: string; style: string }> = [];
  if (canReview && status === ADOPTION_STATUS.SUBMITTED) {
    actions.push({ action: 'in_review', label: 'Poner en revisión', style: s.outline });
    actions.push({ action: 'approved', label: 'Aprobar', style: s.primary });
    actions.push({ action: 'rejected', label: 'No aprobar', style: s.quiet });
  } else if (canReview && status === ADOPTION_STATUS.IN_REVIEW) {
    actions.push({ action: 'approved', label: 'Aprobar', style: s.primary });
    actions.push({ action: 'rejected', label: 'No aprobar', style: s.quiet });
  } else if (canReview && status === ADOPTION_STATUS.APPROVED) {
    if (canComplete) actions.push({ action: 'complete', label: 'Completar adopción', style: s.primary });
    actions.push({ action: 'rejected', label: 'No aprobar', style: s.quiet });
  }

  return (
    <article
      id={`solicitud-${application.id}`}
      aria-label={`Solicitud de ${applicant}`}
      className={cn(s.card, 'scroll-mt-24', highlighted ? s.cardHighlight : s.cardIdle)}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <p className={cn('font-semibold [overflow-wrap:anywhere]', s.ink)}>{applicant}</p>
          <p className={cn('text-xs', s.muted)}>
            {formatDate(application.createdAt)}
            {showAnimal && animal ? (
              <>
                {' · Quiere adoptar a '}
                <Link href={Routes.animals.detail(animal.slug || animal.id)} className={s.link}>
                  {animalName}
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <DashStatusBadge label={meta.label} tone={meta.tone} />
      </header>

      {application.message?.trim() ? (
        <p className={cn('mt-2 whitespace-pre-wrap text-sm leading-relaxed [overflow-wrap:anywhere]', s.ink)}>
          {application.message.trim()}
        </p>
      ) : null}

      <dl className="mt-3 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.label} className="min-w-0">
            <dt className={cn('inline', s.muted)}>{fact.label}: </dt>
            <dd className={cn('inline', s.ink)}>{fact.value}</dd>
          </div>
        ))}
        <div className="min-w-0 sm:col-span-2">
          <dt className={cn('inline', s.muted)}>Otros animales: </dt>
          <dd className={cn('inline whitespace-pre-wrap [overflow-wrap:anywhere]', answers.otherPets?.trim() ? s.ink : s.muted)}>
            {answers.otherPets?.trim() || 'no mencionó'}
          </dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className={cn('inline', s.muted)}>Experiencia: </dt>
          <dd className={cn('inline whitespace-pre-wrap [overflow-wrap:anywhere]', answers.experience?.trim() ? s.ink : s.muted)}>
            {answers.experience?.trim() || 'no mencionó'}
          </dd>
        </div>
      </dl>

      {commitments.length ? (
        <ul className="mt-2 space-y-1 text-sm">
          {commitments.map((item) => (
            <li key={item} className={cn('flex items-start gap-1.5', s.ink)}>
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                size={16}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {note ? (
        <div className={cn('mt-3 text-sm', s.box)}>
          <p className={cn('text-xs font-semibold', s.muted)}>Mensaje que recibió</p>
          <p className={cn('mt-0.5 whitespace-pre-wrap [overflow-wrap:anywhere]', s.ink)}>{note}</p>
        </div>
      ) : null}

      {digits || email ? (
        <div className="mt-3">
          <p className={cn('text-xs [overflow-wrap:anywhere]', s.muted)}>
            {[digits ? formatMxPhone(digits) : null, email].filter(Boolean).join(' · ')}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {digits ? (
              <a href={`tel:+52${digits}`} className={s.contact} aria-label={`Llamar a ${applicant}`}>
                <HugeiconsIcon icon={Call02Icon} size={16} strokeWidth={1.5} aria-hidden />
                Llamar
              </a>
            ) : null}
            {digits ? (
              <a
                href={adoptionWhatsAppUrl(digits, applicant, animal?.name)}
                target="_blank"
                rel="noopener noreferrer"
                className={s.contact}
                aria-label={`Escribir por WhatsApp a ${applicant}`}
              >
                <HugeiconsIcon icon={WhatsappIcon} size={16} strokeWidth={1.5} aria-hidden />
                WhatsApp
              </a>
            ) : null}
            {email ? (
              <a href={`mailto:${email}`} className={s.contact} aria-label={`Escribir un correo a ${applicant}`}>
                <HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={1.5} aria-hidden />
                Correo
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {actions.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((item) => (
            <button
              key={item.action}
              type="button"
              onClick={() => onAction(item.action, application)}
              disabled={busy}
              className={item.style}
            >
              {pendingAction === item.action ? 'Guardando…' : item.label}
            </button>
          ))}
        </div>
      ) : null}

      {canReview && !canComplete && status === ADOPTION_STATUS.APPROVED ? (
        <p className={cn('mt-2 text-xs', s.muted)}>
          Coordinación o administración del espacio completan la adopción cuando {animalName} se vaya a su nuevo hogar.
        </p>
      ) : null}
    </article>
  );
}
