'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CalendarAdd01Icon,
  CheckmarkCircle02Icon,
  Download04Icon,
  Link04Icon,
  PencilEdit02Icon,
  Share08Icon,
  StarIcon,
  Tick02Icon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import AuthGateModal from 'kadesh/components/auth/AuthGateModal';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import { cn } from 'kadesh/utils/cn';
import { useUser } from 'kadesh/utils/UserContext';
import { EVENT_INTEREST, type EventInterestKind } from './constants';
import { eventIsPast, googleCalendarUrl, upcomingSessions, viewsText, whatsappUrl } from './format';
import { useEventViews } from './hooks/useEventViews';
import {
  EVENT_VIEWER_QUERY,
  SET_EVENT_INTEREST_MUTATION,
  type EventViewerResponse,
  type SetEventInterestResponse,
} from './queries';
import type { PetEvent } from './types';

const AUTH_COPY = {
  title: 'Guarda este evento',
  description: 'Con tu cuenta te recordamos el evento un día antes y te avisamos si cambia o se cancela.',
  reasons: [
    'Te recordamos un día antes de cada fecha.',
    'Te avisamos si cambian la fecha o el lugar, o si se cancela.',
    'Recibe avisos de otros eventos en tu zona.',
  ],
};

const primaryClass =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
/**
 * `cn` solo concatena (no resuelve conflictos de Tailwind): la forma del botón y sus colores van
 * por separado y cada estado lleva su juego completo de colores, nunca dos a la vez.
 */
const outlineShape =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh disabled:cursor-not-allowed disabled:opacity-50';
const idleColors =
  'border-[#d8dee8] bg-white text-[#121212] hover:border-kadesh dark:border-white/15 dark:bg-night dark:text-white';
const secondaryClass = `${outlineShape} ${idleColors}`;
/** «Me interesa» marcado: relleno azul de marca. */
const interestedActiveClass = `${outlineShape} border-kadesh bg-kadesh text-white hover:bg-kadesh-600`;
/** «Asistiré» marcado: relleno verde (pasa AA con texto blanco). */
const goingActiveClass = `${outlineShape} border-green-700 bg-green-700 text-white hover:bg-green-800`;

/**
 * Lo que la persona puede hacer en la ficha: «Me interesa» / «Asistiré», registrarse, guardar en
 * su calendario y compartir. Quien lo publicó ve «Editar». Sin sesión, «Me interesa» pide cuenta.
 */
export default function EventActions({ event }: { event: PetEvent }) {
  const { user } = useUser();
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const [kind, setKind] = useState<EventInterestKind | null>(null);
  const [counts, setCounts] = useState({
    interested: event.interestedCount ?? 0,
    going: event.goingCount ?? 0,
    isFull: Boolean(event.isFull),
  });

  const { data: viewer } = useQuery<EventViewerResponse>(EVENT_VIEWER_QUERY, {
    variables: { id: event.id },
    skip: !user?.id,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const row = viewer?.petEvent;
    if (!row) return;
    setKind(row.myInterest ?? null);
    setCounts({ interested: row.interestedCount ?? 0, going: row.goingCount ?? 0, isFull: Boolean(row.isFull) });
  }, [viewer]);

  const [setInterest, { loading: saving }] = useMutation<SetEventInterestResponse>(SET_EVENT_INTEREST_MUTATION);
  const viewsCount = useEventViews(event.id);

  const isOwner = Boolean(user?.id && (viewer?.petEvent?.user?.id ?? null) === user.id);
  const past = eventIsPast(event);
  const closed = event.status !== 'approved' || past;
  const next = upcomingSessions(event.sessions ?? [])[0] ?? null;
  const url = `${SITE_URL}${Routes.events.detail(event.slug ?? event.id)}`;
  const registrationWhatsapp = whatsappUrl(
    event.registrationWhatsapp,
    `Hola, quiero registrarme en «${event.title}». Lo vi en Kadesh Pet: ${url}`,
  );

  const toggle = async (target: EventInterestKind) => {
    if (!user?.id) {
      setAuthOpen(true);
      return;
    }
    const nextKind = kind === target ? null : target;
    try {
      const { data } = await setInterest({ variables: { eventId: event.id, kind: nextKind } });
      const result = data?.setPetEventInterest;
      if (!result) throw new Error();
      setCounts({ interested: result.interestedCount, going: result.goingCount, isFull: result.isFull });
      if (!result.success) {
        sileo.error({ title: 'No se pudo guardar', description: result.message });
        setKind(result.kind ?? null);
        return;
      }
      setKind(result.kind ?? null);
      if (result.kind) sileo.success({ title: result.message });
    } catch {
      sileo.error({ title: 'No se pudo guardar', description: 'Intenta de nuevo en un momento.' });
    }
  };

  const share = async () => {
    const data = { title: event.title, text: `${event.title} — Kadesh Pet`, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      sileo.success({ title: 'Link copiado', description: 'Pégalo donde quieras compartirlo.' });
    } catch {
      // La persona cerró el menú de compartir.
    }
  };

  const goingFullForMe = counts.isFull && kind !== EVENT_INTEREST.GOING;
  const hasInterest = counts.interested + counts.going > 0;
  const stats = [
    viewsCount ? viewsText(viewsCount) : null,
    counts.going > 0 ? `${counts.going} ${counts.going === 1 ? 'asistirá' : 'asistirán'}` : null,
    counts.interested > 0
      ? `${counts.interested} ${counts.interested === 1 ? 'persona interesada' : 'personas interesadas'}`
      : null,
    event.capacity && hasInterest ? `${Math.max(event.capacity - counts.going, 0)} lugares libres` : null,
    event.capacity && !hasInterest && !closed ? `${event.capacity} lugares` : null,
  ].filter((part): part is string => Boolean(part));

  return (
    <div className="space-y-3">
      {event.registrationUrl ? (
        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(primaryClass, 'bg-kadesh hover:bg-kadesh-600 focus-visible:outline-kadesh', closed && 'pointer-events-none opacity-50')}
          aria-disabled={closed}
        >
          <HugeiconsIcon icon={Link04Icon} size={18} aria-hidden="true" />
          Regístrate
        </a>
      ) : null}
      {registrationWhatsapp ? (
        <a
          href={registrationWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            primaryClass,
            'bg-green-700 hover:bg-green-800 focus-visible:outline-green-700',
            closed && 'pointer-events-none opacity-50',
          )}
          aria-disabled={closed}
        >
          <HugeiconsIcon icon={WhatsappIcon} size={18} aria-hidden="true" />
          Regístrate por WhatsApp
        </a>
      ) : null}

      {!closed ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={kind === EVENT_INTEREST.INTERESTED}
            disabled={saving}
            onClick={() => void toggle(EVENT_INTEREST.INTERESTED)}
            className={kind === EVENT_INTEREST.INTERESTED ? interestedActiveClass : secondaryClass}
          >
            <HugeiconsIcon
              icon={kind === EVENT_INTEREST.INTERESTED ? Tick02Icon : StarIcon}
              size={18}
              strokeWidth={kind === EVENT_INTEREST.INTERESTED ? 2.2 : 1.5}
              aria-hidden="true"
            />
            Me interesa
          </button>
          <button
            type="button"
            aria-pressed={kind === EVENT_INTEREST.GOING}
            disabled={saving || goingFullForMe}
            onClick={() => void toggle(EVENT_INTEREST.GOING)}
            className={kind === EVENT_INTEREST.GOING ? goingActiveClass : secondaryClass}
          >
            <HugeiconsIcon
              icon={kind === EVENT_INTEREST.GOING ? Tick02Icon : CheckmarkCircle02Icon}
              size={18}
              strokeWidth={kind === EVENT_INTEREST.GOING ? 2.2 : 1.5}
              aria-hidden="true"
            />
            {goingFullForMe ? 'Cupo lleno' : 'Asistiré'}
          </button>
        </div>
      ) : null}
      {kind && !closed ? (
        <p role="status" className="text-center text-sm font-medium text-[#3a3a3a] dark:text-[#d0d0d0]">
          {kind === EVENT_INTEREST.GOING ? 'Vas a ir.' : 'Lo estás siguiendo.'} Te recordamos un día antes.{' '}
          <span className="font-normal text-[#5a5a5a] dark:text-[#9aa3b2]">Tócalo otra vez para quitarlo.</span>
        </p>
      ) : null}
      {stats.length > 0 ? (
        <p className="text-center text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">{stats.join(' · ')}</p>
      ) : null}

      {next && !closed ? (
        <div className="grid grid-cols-2 gap-2">
          <a
            href={googleCalendarUrl(event, next, `${event.description.slice(0, 500)}\n\n${url}`)}
            target="_blank"
            rel="noopener noreferrer"
            className={secondaryClass}
          >
            <HugeiconsIcon icon={CalendarAdd01Icon} size={18} aria-hidden="true" />
            Google Calendar
          </a>
          <a href={Routes.events.calendar(event.slug ?? event.id)} download className={secondaryClass}>
            <HugeiconsIcon icon={Download04Icon} size={18} aria-hidden="true" />
            Calendario (.ics)
          </a>
        </div>
      ) : null}

      <button type="button" onClick={() => void share()} className={secondaryClass}>
        <HugeiconsIcon icon={Share08Icon} size={18} aria-hidden="true" />
        Compartir
      </button>

      {isOwner && event.slug ? (
        <Link href={Routes.events.edit(event.slug)} className={secondaryClass}>
          <HugeiconsIcon icon={PencilEdit02Icon} size={18} aria-hidden="true" />
          Editar evento
        </Link>
      ) : null}

      <AuthGateModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        redirectTo={pathname || Routes.events.index}
        {...AUTH_COPY}
      />
    </div>
  );
}
