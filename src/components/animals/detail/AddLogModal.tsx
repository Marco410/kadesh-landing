"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon } from '@hugeicons/core-free-icons';
import { Sheet } from 'kadesh/components/shared';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { friendlyErrorText } from 'kadesh/utils/errorText';
import ChoiceChip from '../nuevo/ChoiceChip';
import LocationPicker from '../nuevo/LocationPicker';
import { OPEN_CASE_STATUSES, getStatusColor, getStatusLabel } from '../constants';
import { useCreateLog } from './hooks/useCreateLog';

/** Último registro del caso: de ahí salen el estado actual y «Mismo lugar». */
export interface AddLogPreviousLog {
  status?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  placeLabel?: string | null;
}

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (logId?: string) => void | Promise<void>;
  animalId: string;
  /** Para el título («Novedades de Luna» / «Novedades de esta perra»). */
  animalName: string;
  previousLog?: AddLogPreviousLog | null;
}

type DateMode = 'today' | 'yesterday' | 'other';
type PlaceMode = 'same' | 'other';

const fieldClass =
  'w-full rounded-xl border border-[#d8dee8] bg-white px-3 py-2.5 text-sm text-[#121212] focus:border-kadesh focus:outline-none focus:ring-2 focus:ring-kadesh/30 dark:border-white/15 dark:bg-night dark:text-[#eef1f6] dark:[color-scheme:dark]';
const labelClass = 'mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]';

/** Ejemplo de nota según el estado: lo que suele servirle a quien ve la ficha. */
const NOTE_PLACEHOLDER: Record<string, string> = {
  lost: 'Ej. Una vecina lo vio cerca del mercado a las 7 pm.',
  found: 'Ej. Sigue conmigo; ya lo revisó un veterinario.',
  rescued: 'Ej. Ya está en hogar temporal y comiendo bien.',
  abandoned: 'Ej. Sigue en la misma esquina; alguien le dejó agua.',
  in_adoption: 'Ej. Ya está vacunado y esterilizado.',
};

function dayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Fecha del registro: hoy (ahora), ayer (mediodía) u otro día con hora opcional. Nunca en el futuro. */
function buildDate(mode: DateMode, otherDate: string, otherTime: string): { ok: true; iso: string } | { ok: false; reason: string } {
  const now = new Date();
  if (mode === 'today') return { ok: true, iso: now.toISOString() };
  if (mode === 'yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);
    return { ok: true, iso: yesterday.toISOString() };
  }
  if (!otherDate) return { ok: false, reason: 'Elige el día.' };
  const [year, month, day] = otherDate.split('-').map(Number);
  let hours = 12;
  let minutes = 0;
  if (otherTime) {
    const [hh, mm] = otherTime.split(':').map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return { ok: false, reason: 'La hora no es válida.' };
    hours = hh;
    minutes = mm;
  } else if (otherDate === dayKey(now)) {
    hours = now.getHours();
    minutes = now.getMinutes();
  }
  const chosen = new Date(year, (month || 1) - 1, day || 1, hours, minutes, 0, 0);
  if (Number.isNaN(chosen.getTime())) return { ok: false, reason: 'La fecha no es válida.' };
  if (chosen.getTime() > now.getTime()) return { ok: false, reason: 'La fecha no puede ser posterior a ahora.' };
  return { ok: true, iso: chosen.toISOString() };
}

function hasPoint(log: AddLogPreviousLog | null | undefined) {
  if (!log || log.lat == null || log.lng == null || log.lat === '' || log.lng === '') return false;
  return Number.isFinite(Number(log.lat)) && Number.isFinite(Number(log.lng));
}

function placeText(log: AddLogPreviousLog) {
  return log.placeLabel?.trim() || [log.city, log.state].filter(Boolean).join(', ') || log.address?.trim() || 'el lugar anterior';
}

/**
 * «Agregar registro»: una novedad del caso. Lo más común es contar qué pasó sin cambiar nada más,
 * así que el orden es: qué hay de nuevo → cuándo (Hoy / Ayer / Otra fecha) → dónde (mismo lugar
 * que el registro anterior, o el mapa) → estado (sigue igual salvo que se cambie). Cerrar el caso
 * va por «Cerrar caso».
 */
export default function AddLogModal({ isOpen, onClose, onSuccess, animalId, animalName, previousLog }: AddLogModalProps) {
  const motionPrefs = useUiMotion();
  const currentStatus =
    previousLog?.status && OPEN_CASE_STATUSES.includes(previousLog.status) ? previousLog.status : 'lost';
  const canReusePlace = hasPoint(previousLog);

  const [notes, setNotes] = useState('');
  const [dateMode, setDateMode] = useState<DateMode>('today');
  const [otherDate, setOtherDate] = useState('');
  const [otherTime, setOtherTime] = useState('');
  const [placeMode, setPlaceMode] = useState<PlaceMode>(canReusePlace ? 'same' : 'other');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);
  const [lastSeen, setLastSeen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [changingStatus, setChangingStatus] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Cada vez que se abre arranca limpio, con el estado y el lugar del último registro.
  useEffect(() => {
    if (!isOpen) return;
    setNotes('');
    setDateMode('today');
    setOtherDate('');
    setOtherTime('');
    setPlaceMode(canReusePlace ? 'same' : 'other');
    setLat('');
    setLng('');
    setAddress('');
    setCity('');
    setState('');
    setCountry('');
    setLastSeen(false);
    setStatus(currentStatus);
    setChangingStatus(false);
    setErrors({});
    const focus = window.setTimeout(() => notesRef.current?.focus(), 150);
    return () => window.clearTimeout(focus);
  }, [isOpen, canReusePlace, currentStatus]);

  const { createLog, isCreating } = useCreateLog({
    onSuccess: async (logId) => {
      await onSuccess(logId);
      onClose();
    },
    onError: (error) => {
      setErrors({ submit: friendlyErrorText(error, 'No se pudo guardar el registro. Intenta de nuevo.') });
    },
  });

  const handleLocationChange = useCallback((newLat: string, newLng: string) => {
    setLat(newLat);
    setLng(newLng);
  }, []);

  const handleAddressChange = useCallback((a: string, c: string, s: string, co: string) => {
    setAddress(a);
    setCity(c);
    setState(s);
    setCountry(co);
  }, []);

  const handleSubmit = async () => {
    if (isCreating) return;
    const next: Record<string, string> = {};
    if (!notes.trim()) next.notes = 'Cuenta qué hay de nuevo, aunque sea en una línea.';
    const date = buildDate(dateMode, otherDate, otherTime);
    if (!date.ok) next.date = date.reason;
    if (placeMode === 'other') {
      const latN = Number.parseFloat(lat);
      const lngN = Number.parseFloat(lng);
      if (!Number.isFinite(latN) || !Number.isFinite(lngN)) {
        next.location = 'Fija el pin en el mapa o usa «Usar mi ubicación actual».';
      } else if (isResolvingPlace) {
        next.location = 'Estamos ubicando el lugar. Espera un momento.';
      }
    }
    setErrors(next);
    if (Object.keys(next).length || !date.ok) return;

    // «Mismo lugar»: el pin no se mueve. La ciudad la completa el backend si falta.
    const place =
      placeMode === 'same' && previousLog
        ? {
            lat: String(previousLog.lat ?? ''),
            lng: String(previousLog.lng ?? ''),
            address: previousLog.address ?? '',
            city: previousLog.city ?? '',
            state: previousLog.state ?? '',
            country: previousLog.country ?? '',
          }
        : { lat, lng, address, city, state, country };

    try {
      await createLog({
        animalId,
        status,
        notes,
        ...place,
        lastSeen: placeMode === 'other' && status === 'lost' && lastSeen,
        dateStatus: date.iso,
      });
    } catch {
      // El error se muestra con `onError`.
    }
  };

  const statusOptions = OPEN_CASE_STATUSES;

  return (
    <Sheet
      isOpen={isOpen}
      title={`Novedades de ${animalName}`}
      onClose={onClose}
      busy={isCreating}
      footer={
        <div className="flex gap-3">
          <motion.button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            whileTap={motionPrefs.tap}
            className="min-h-11 flex-1 rounded-xl bg-[#f3f5f8] px-4 text-sm font-semibold text-[#121212] hover:bg-[#e6e9ef] disabled:opacity-50 dark:bg-night dark:text-[#eef1f6] dark:hover:bg-white/10"
          >
            Cancelar
          </motion.button>
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating}
            whileTap={isCreating ? undefined : motionPrefs.tap}
            className="min-h-11 flex-1 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? 'Guardando…' : 'Guardar registro'}
          </motion.button>
        </div>
      }
    >
      <div className="space-y-6">
        {errors.submit ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {errors.submit}
          </div>
        ) : null}

        <div>
          <label htmlFor="add-log-notes" className={labelClass}>
            ¿Qué hay de nuevo?
          </label>
          <textarea
            id="add-log-notes"
            ref={notesRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={`${fieldClass} resize-none ${errors.notes ? 'ring-1 ring-red-500' : ''}`}
            placeholder={NOTE_PLACEHOLDER[status] ?? 'Cuenta qué pasó.'}
          />
          {errors.notes ? <p className="mt-1 text-xs text-red-600">{errors.notes}</p> : null}
        </div>

        <fieldset>
          <legend className={labelClass}>¿Cuándo?</legend>
          <div className="flex flex-wrap gap-2">
            <ChoiceChip label="Hoy" selected={dateMode === 'today'} onSelect={() => setDateMode('today')} />
            <ChoiceChip label="Ayer" selected={dateMode === 'yesterday'} onSelect={() => setDateMode('yesterday')} />
            <ChoiceChip label="Otra fecha" selected={dateMode === 'other'} onSelect={() => setDateMode('other')} />
          </div>
          <AnimatePresence initial={false}>
            {dateMode === 'other' ? (
              <motion.div
                variants={motionPrefs.expand}
                initial={motionPrefs.expand ? 'hidden' : false}
                animate="show"
                exit="hidden"
                className="mt-3 grid gap-3 sm:grid-cols-2"
              >
                <div>
                  <label htmlFor="add-log-date" className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
                    Día
                  </label>
                  <input
                    id="add-log-date"
                    type="date"
                    max={dayKey()}
                    value={otherDate}
                    onChange={(e) => setOtherDate(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="add-log-time" className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
                    Hora, si la sabes
                  </label>
                  <input
                    id="add-log-time"
                    type="time"
                    value={otherTime}
                    onChange={(e) => setOtherTime(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          {errors.date ? <p className="mt-1 text-xs text-red-600">{errors.date}</p> : null}
        </fieldset>

        <fieldset>
          <legend className={labelClass}>¿Dónde?</legend>
          {canReusePlace ? (
            <div className="flex flex-wrap gap-2">
              <ChoiceChip label="Mismo lugar" selected={placeMode === 'same'} onSelect={() => setPlaceMode('same')} />
              <ChoiceChip label="Otro lugar" selected={placeMode === 'other'} onSelect={() => setPlaceMode('other')} />
            </div>
          ) : null}
          {placeMode === 'same' && previousLog ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
              <HugeiconsIcon icon={Location01Icon} size={16} strokeWidth={1.8} aria-hidden />
              {placeText(previousLog)}
            </p>
          ) : (
            <div className={canReusePlace ? 'mt-3' : ''}>
              <div className={errors.location ? 'rounded-xl ring-1 ring-red-500 ring-offset-2 dark:ring-offset-night-raised' : ''}>
                <LocationPicker
                  lat={lat}
                  lng={lng}
                  address={address}
                  city={city}
                  state={state}
                  country={country}
                  isVisible={isOpen && placeMode === 'other'}
                  compact
                  onLocationChange={handleLocationChange}
                  onAddressChange={handleAddressChange}
                  onResolvingChange={setIsResolvingPlace}
                />
              </div>
              {errors.location ? <p className="mt-1 text-xs text-red-600">{errors.location}</p> : null}
              {status === 'lost' ? (
                <label className="mt-3 flex min-h-11 items-center gap-2 text-sm font-medium text-[#121212] dark:text-[#eef1f6]">
                  <input
                    type="checkbox"
                    checked={lastSeen}
                    onChange={(e) => setLastSeen(e.target.checked)}
                    className="h-4 w-4 rounded border-[#d8dee8] text-kadesh focus:ring-kadesh"
                  />
                  Aquí lo vieron por última vez
                </label>
              ) : null}
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className={labelClass}>Estado</legend>
          {changingStatus ? (
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((value) => (
                <ChoiceChip
                  key={value}
                  label={getStatusLabel(value)}
                  selected={status === value}
                  onSelect={() => setStatus(value)}
                  dotColor={getStatusColor(value)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
              Sigue como
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: getStatusColor(status) }}
              >
                {getStatusLabel(status)}
              </span>
              <button
                type="button"
                onClick={() => setChangingStatus(true)}
                className="min-h-11 px-1 font-semibold text-kadesh hover:underline"
              >
                Cambiar
              </button>
            </div>
          )}
          <p className="mt-2 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            ¿Ya volvió a casa o fue adoptado? Usa «Cerrar caso» en la ficha.
          </p>
        </fieldset>
      </div>
    </Sheet>
  );
}
