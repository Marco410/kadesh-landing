'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import {
  DashModal,
  DashStatusBadge,
  dashButtonClass,
  dashTextareaClass,
  type DashTone,
} from 'kadesh/components/app-shell';
import { Routes } from 'kadesh/core/routes';
import { EVENT_STATUS_LABEL, eventCategory } from './constants';
import { eventCityText, eventIsPast, eventTimeZone, formatSessionRange, viewsText } from './format';
import {
  CANCEL_EVENT_MUTATION,
  MY_EVENTS_QUERY,
  type CancelEventResponse,
  type MyEventsResponse,
} from './queries';
import type { PetEvent } from './types';

type MyEvent = MyEventsResponse['petEvents'][number];

const STATUS_TONE: Record<string, DashTone> = {
  pending: 'warning',
  approved: 'ok',
  rejected: 'danger',
  cancelled: 'neutral',
};

function statusFor(event: MyEvent): { label: string; tone: DashTone } {
  if (event.status === 'approved' && eventIsPast(event)) return { label: 'Terminó', tone: 'neutral' };
  return { label: EVENT_STATUS_LABEL[event.status] ?? event.status, tone: STATUS_TONE[event.status] ?? 'neutral' };
}

function EventRow({ event, onCancel }: { event: MyEvent; onCancel: (event: MyEvent) => void }) {
  const tz = eventTimeZone(event);
  const startsAt = event.nextStartsAt ?? event.firstStartsAt;
  const endsAt = event.nextEndsAt ?? event.lastEndsAt;
  const cover = event.multimedia?.[0]?.image?.url;
  const status = statusFor(event);
  const past = eventIsPast(event);
  const slug = event.slug ?? event.id;
  const canEdit = event.status !== 'cancelled' && !past;

  return (
    <li className="rounded-[20px] border border-dash-line bg-dash-surface p-3 shadow-dash">
      <div className="flex items-start gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-dash-surface-2">
          {cover ? (
            <Image src={cover} alt="" fill className="object-cover" sizes="64px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-dash-faint">
              <HugeiconsIcon icon={eventCategory(event.category).icon} size={22} strokeWidth={1.5} />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={Routes.events.detail(slug)} className="truncate font-semibold text-dash-ink hover:underline">
              {event.title}
            </Link>
            <DashStatusBadge tone={status.tone} label={status.label} />
          </div>
          <p className="mt-0.5 truncate text-xs text-dash-muted">
            {[
              eventCategory(event.category).label,
              startsAt && endsAt ? formatSessionRange(startsAt, endsAt, tz) : null,
              eventCityText(event),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {event.status === 'approved' ? (
            <p className="mt-1 text-xs text-dash-soft">
              {viewsText(event.viewsCount ?? 0)} · {event.goingCount ?? 0} asistirán · {event.interestedCount ?? 0} les
              interesa
              {event.capacity ? ` · cupo de ${event.capacity}` : ''}
            </p>
          ) : event.status === 'cancelled' && (event.viewsCount ?? 0) > 0 ? (
            <p className="mt-1 text-xs text-dash-soft">{viewsText(event.viewsCount ?? 0)}</p>
          ) : null}
          {event.status === 'rejected' && event.reviewNote ? (
            <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
              <strong>Qué cambiar:</strong> {event.reviewNote}
            </p>
          ) : null}
          {event.status === 'pending' ? (
            <p className="mt-1 text-xs text-dash-muted">Lo estamos revisando. Te avisamos en cuanto se publique.</p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Link href={Routes.events.detail(slug)} className={dashButtonClass({ variant: 'ghost', size: 'sm' })}>
          Ver
        </Link>
        {canEdit ? (
          <Link href={Routes.events.edit(slug)} className={dashButtonClass({ variant: 'outline', size: 'sm' })}>
            {event.status === 'rejected' ? 'Corregir' : 'Editar'}
          </Link>
        ) : null}
        {canEdit ? (
          <button
            type="button"
            onClick={() => onCancel(event)}
            className={dashButtonClass({ variant: 'danger-ghost', size: 'sm' })}
          >
            Cancelar evento
          </button>
        ) : null}
      </div>
    </li>
  );
}

/** «Mis eventos» en el panel: estado de revisión, vistas, asistentes y acciones. */
export default function MyEventsSection({ userId }: { userId: string }) {
  const { data, loading, refetch } = useQuery<MyEventsResponse>(MY_EVENTS_QUERY, {
    variables: { userId },
    fetchPolicy: 'cache-and-network',
  });
  const [cancelEvent, { loading: cancelling }] = useMutation<CancelEventResponse>(CANCEL_EVENT_MUTATION);
  const [toCancel, setToCancel] = useState<PetEvent | null>(null);
  const [reason, setReason] = useState('');
  const events = data?.petEvents ?? [];

  const confirmCancel = async () => {
    if (!toCancel) return;
    try {
      const { data: result } = await cancelEvent({ variables: { id: toCancel.id, reason: reason.trim() || null } });
      const outcome = result?.cancelPetEvent;
      if (!outcome?.success) {
        sileo.error({ title: 'No se pudo cancelar', description: outcome?.message ?? 'Intenta de nuevo.' });
        return;
      }
      sileo.success({ title: 'Evento cancelado', description: 'Avisamos a quienes les interesaba.' });
      setToCancel(null);
      setReason('');
      await refetch();
    } catch {
      sileo.error({ title: 'No se pudo cancelar', description: 'Intenta de nuevo en un momento.' });
    }
  };

  const newButton = (
    <Link
      href={Routes.events.new}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-white dash-grad-accent shadow-dash-accent transition-[transform,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash-accent-lift"
    >
      <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} aria-hidden="true" />
      Publicar evento
    </Link>
  );

  if (loading && events.length === 0) {
    return (
      <div className="space-y-2" aria-busy="true">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-24 dash-shimmer rounded-3xl" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-3xl border border-dash-line bg-dash-surface p-5 shadow-dash">
        <p className="font-semibold text-dash-ink">Aún no has publicado un evento</p>
        <p className="text-sm text-dash-muted">
          Campañas de esterilización, vacunación, ferias de adopción, colectas… Lo revisamos, lo publicamos y avisamos a
          la gente de la zona.
        </p>
        {newButton}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">{newButton}</div>
      <ul className="space-y-2">
        {events.map((event) => (
          <EventRow key={event.id} event={event} onCancel={setToCancel} />
        ))}
      </ul>

      <DashModal
        open={Boolean(toCancel)}
        onClose={() => setToCancel(null)}
        busy={cancelling}
        title="¿Cancelar este evento?"
        subtitle={toCancel?.title}
        footer={
          <>
            <button
              type="button"
              onClick={() => setToCancel(null)}
              disabled={cancelling}
              className={dashButtonClass({ variant: 'ghost' })}
            >
              No, volver
            </button>
            <button
              type="button"
              onClick={() => void confirmCancel()}
              disabled={cancelling}
              className={dashButtonClass({ variant: 'danger' })}
            >
              {cancelling ? 'Cancelando…' : 'Sí, cancelar'}
            </button>
          </>
        }
      >
        <p className="text-sm text-dash-muted">
          La ficha seguirá visible con el aviso de cancelado y les avisaremos a quienes marcaron «Me interesa» o
          «Asistiré». No se puede deshacer.
        </p>
        <label className="mt-4 block text-sm font-semibold text-dash-ink">
          Motivo (opcional, lo verán los interesados)
          <textarea
            className={`${dashTextareaClass} mt-1`}
            value={reason}
            maxLength={500}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Por lluvia lo cambiamos al próximo sábado…"
          />
        </label>
      </DashModal>
    </div>
  );
}
