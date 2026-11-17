/** Cuándo lo vieron: «Ahora», «Hoy» (con hora opcional), «Ayer» u otro día de los últimos 30. */
export type SightingWhen = 'now' | 'today' | 'yesterday' | 'other';

/** Mismo tope que kadesh-back (`SIGHTING_MAX_AGE_DAYS`). */
export const SIGHTING_MAX_AGE_DAYS = 30;

export function dayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function oldestSightingDay(now = new Date()) {
  const oldest = new Date(now);
  oldest.setDate(oldest.getDate() - SIGHTING_MAX_AGE_DAYS);
  return dayKey(oldest);
}

function parseTime(value: string): [number, number] | null {
  const [hh, mm] = value.split(':').map(Number);
  if (!Number.isInteger(hh) || !Number.isInteger(mm)) return null;
  return [hh, mm];
}

/**
 * Hora del avistamiento. «Ahora» = ahora; «Hoy» sin hora = ahora; «Ayer» u otro día sin hora =
 * mediodía. Nunca en el futuro ni antes de 30 días.
 */
export function buildSightingDate(
  when: SightingWhen,
  otherDay: string,
  time: string,
  now = new Date(),
): { ok: true; iso: string } | { ok: false; reason: string } {
  if (when === 'now' || (when === 'today' && !time)) return { ok: true, iso: now.toISOString() };

  const base = new Date(now);
  if (when === 'yesterday') base.setDate(base.getDate() - 1);
  if (when === 'other') {
    if (!otherDay) return { ok: false, reason: 'Elige el día.' };
    const [year, month, day] = otherDay.split('-').map(Number);
    base.setFullYear(year, (month || 1) - 1, day || 1);
  }
  let hours = 12;
  let minutes = 0;
  if (time) {
    const parsed = parseTime(time);
    if (!parsed) return { ok: false, reason: 'La hora no es válida.' };
    [hours, minutes] = parsed;
  }
  base.setHours(hours, minutes, 0, 0);
  if (Number.isNaN(base.getTime())) return { ok: false, reason: 'La fecha no es válida.' };
  if (base.getTime() > now.getTime()) return { ok: false, reason: 'La hora no puede ser posterior a ahora.' };
  if (dayKey(base) < oldestSightingDay(now)) {
    return { ok: false, reason: `Solo se pueden avisar avistamientos de los últimos ${SIGHTING_MAX_AGE_DAYS} días.` };
  }
  return { ok: true, iso: base.toISOString() };
}

/** «Hace 5 min», «Hace 2 h», «Hoy, 7:40 p.m.», «Ayer, 9:00 a.m.» o «3 nov., 6:15 p.m.». */
export function sightingTimeLabel(iso: string | null | undefined, now = new Date()): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const minutes = Math.round((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (minutes < 6 * 60) return `Hace ${Math.round(minutes / 60)} h`;
  const time = date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dayKey(date) === dayKey(now)) return `Hoy, ${time}`;
  if (dayKey(date) === dayKey(yesterday)) return `Ayer, ${time}`;
  return `${date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}, ${time}`;
}
