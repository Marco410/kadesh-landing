'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Delete02Icon, RepeatIcon } from '@hugeicons/core-free-icons';
import { cn } from 'kadesh/utils/cn';
import { EVENT_LIMITS } from '../constants';
import type { EventSessionDraft } from '../types';
import { emptySession, newSessionKey, repeatWeekly, todayInZone } from './eventFormModel';
import { fieldClass, labelClass } from './styles';

const DAY_MS = 24 * 60 * 60 * 1000;

/** "2026-11-08" + n días. */
function addDays(date: string, days: number): string {
  if (!date) return '';
  const [year, month, day] = date.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day) + days * DAY_MS);
  return next.toISOString().slice(0, 10);
}

/**
 * Fechas del evento: día, hora de inicio y de fin (en la hora del lugar). Una fecha puede durar
 * varios días; «Repetir cada semana» genera las siguientes a partir de la primera.
 */
export default function SessionsEditor({
  sessions,
  onChange,
  timeZone,
  timeZoneLabel,
  rowErrors,
  error,
}: {
  sessions: EventSessionDraft[];
  onChange: (sessions: EventSessionDraft[]) => void;
  timeZone: string;
  timeZoneLabel: string | null;
  rowErrors?: Record<string, string>;
  error?: string;
}) {
  const [repeatUntil, setRepeatUntil] = useState('');
  const [showRepeat, setShowRepeat] = useState(false);
  const today = todayInZone(timeZone);
  const atLimit = sessions.length >= EVENT_LIMITS.MAX_SESSIONS;

  const update = (key: string, patch: Partial<EventSessionDraft>) => {
    onChange(
      sessions.map((session) => {
        if (session.key !== key) return session;
        const next = { ...session, ...patch };
        // Si no dura varios días, el fin va el mismo día.
        if ('date' in patch && (session.endDate === session.date || !session.endDate)) next.endDate = patch.date ?? '';
        return next;
      }),
    );
  };

  const add = () => {
    const last = sessions[sessions.length - 1];
    const date = last?.date ? addDays(last.date, 7) : '';
    onChange([
      ...sessions,
      last
        ? { ...last, key: newSessionKey(), date, endDate: addDays(last.endDate || last.date, 7) }
        : emptySession(),
    ]);
  };

  const remove = (key: string) => onChange(sessions.filter((session) => session.key !== key));

  const generate = () => {
    const first = sessions[0];
    if (!first || !repeatUntil) return;
    onChange(repeatWeekly(first, repeatUntil, timeZone));
    setShowRepeat(false);
  };

  return (
    <div className="space-y-3">
      {timeZoneLabel ? (
        <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">Las horas van en el horario de {timeZoneLabel}.</p>
      ) : null}
      <ol className="space-y-3">
        {sessions.map((session, index) => {
          const multiDay = Boolean(session.endDate && session.endDate !== session.date);
          const rowError = rowErrors?.[session.key];
          return (
            <li
              key={session.key}
              className={cn(
                'rounded-2xl border bg-white p-4 dark:bg-night',
                rowError ? 'border-red-300 dark:border-red-800' : 'border-[#e3e7ee] dark:border-white/12',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-[#121212] dark:text-white">Fecha {index + 1}</p>
                {sessions.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => remove(session.key)}
                    className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} aria-hidden />
                    Quitar
                  </button>
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1.3fr_1fr_1fr]">
                <label className={labelClass}>
                  {multiDay ? 'Empieza el' : 'Día'}
                  <input
                    type="date"
                    className={fieldClass}
                    value={session.date}
                    min={today}
                    onChange={(event) => update(session.key, { date: event.target.value })}
                    required
                  />
                </label>
                <label className={labelClass}>
                  De
                  <input
                    type="time"
                    className={fieldClass}
                    value={session.startTime}
                    onChange={(event) => update(session.key, { startTime: event.target.value })}
                    required
                  />
                </label>
                <label className={labelClass}>
                  A
                  <input
                    type="time"
                    className={fieldClass}
                    value={session.endTime}
                    onChange={(event) => update(session.key, { endTime: event.target.value })}
                    required
                  />
                </label>
              </div>
              <label className="mt-3 inline-flex items-center gap-2 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
                <input
                  type="checkbox"
                  className="size-4 accent-kadesh"
                  checked={multiDay}
                  onChange={(event) =>
                    update(session.key, {
                      endDate: event.target.checked ? addDays(session.date, 1) : session.date,
                    })
                  }
                  disabled={!session.date}
                />
                Dura varios días
              </label>
              {multiDay ? (
                <label className={cn(labelClass, 'mt-3 sm:max-w-xs')}>
                  Termina el
                  <input
                    type="date"
                    className={fieldClass}
                    value={session.endDate}
                    min={session.date || today}
                    max={addDays(session.date, EVENT_LIMITS.MAX_SESSION_DAYS)}
                    onChange={(event) => update(session.key, { endDate: event.target.value })}
                  />
                </label>
              ) : null}
              {rowError ? (
                <p role="alert" className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                  {rowError}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={add}
          disabled={atLimit}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#d8dee8] bg-white px-4 text-sm font-semibold text-[#121212] hover:border-kadesh disabled:opacity-50 dark:border-white/15 dark:bg-night dark:text-white"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} aria-hidden />
          Agregar otra fecha
        </button>
        <button
          type="button"
          onClick={() => setShowRepeat((value) => !value)}
          disabled={!sessions[0]?.date}
          aria-expanded={showRepeat}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#d8dee8] bg-white px-4 text-sm font-semibold text-[#121212] hover:border-kadesh disabled:opacity-50 dark:border-white/15 dark:bg-night dark:text-white"
        >
          <HugeiconsIcon icon={RepeatIcon} size={16} aria-hidden />
          Repetir cada semana
        </button>
      </div>
      {showRepeat ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-kadesh-200 bg-kadesh-50 p-4 dark:border-white/10 dark:bg-kadesh/10 sm:flex-row sm:items-end">
          <label className={cn(labelClass, 'flex-1')}>
            Repetir la fecha 1 cada semana hasta el
            <input
              type="date"
              className={fieldClass}
              value={repeatUntil}
              min={addDays(sessions[0]?.date ?? today, 7)}
              onChange={(event) => setRepeatUntil(event.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={generate}
            disabled={!repeatUntil}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:opacity-50"
          >
            Generar fechas
          </button>
        </div>
      ) : null}
      <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
        Hasta {EVENT_LIMITS.MAX_SESSIONS} fechas. «Repetir» reemplaza las demás fechas por las semanales.
      </p>
    </div>
  );
}
