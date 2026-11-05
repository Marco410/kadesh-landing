import { CalendarDateTime, fromDate, toZoned } from '@internationalized/date';
import { DEFAULT_EVENT_TIME_ZONE, eventCategory, type EventWhen } from './constants';
import { stateByCode } from './mexicoStates';
import type { PetEvent } from './types';

/**
 * Fechas, lugar y costo de un evento como los lee la gente. Las fechas se guardan en UTC y se
 * muestran en la zona horaria del evento (la de su estado), no la del navegador: quien en
 * Tijuana ve un evento en Mérida lo ve a la hora de Mérida.
 */

type EventLike = Pick<PetEvent, 'timeZone' | 'stateCode'>;

const TIME_ZONE_CITY: Record<string, string> = {
  'America/Tijuana': 'Tijuana',
  'America/Mazatlan': 'Mazatlán',
  'America/Hermosillo': 'Hermosillo',
  'America/Chihuahua': 'Chihuahua',
  'America/Cancun': 'Cancún',
  'America/Merida': 'Mérida',
  'America/Monterrey': 'Monterrey',
};

/** "Tijuana" si el evento no va en el horario del centro; null si sí. */
export function timeZoneCityLabel(timeZone: string): string | null {
  return timeZone === DEFAULT_EVENT_TIME_ZONE ? null : TIME_ZONE_CITY[timeZone] ?? null;
}

export function eventTimeZone(event: Partial<EventLike> | null | undefined): string {
  return event?.timeZone || stateByCode(event?.stateCode)?.timeZone || DEFAULT_EVENT_TIME_ZONE;
}

function dateParts(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    (parts.find((part) => part.type === type)?.value ?? '').replace(/\./g, '');
  return {
    weekday: get('weekday'),
    day: String(Number(get('day'))),
    month: get('month'),
    year: get('year'),
    time: `${Number(get('hour'))}:${get('minute')}`,
  };
}

function capitalize(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/** "sáb 8 nov" */
export function formatEventDayShort(iso: string, timeZone: string): string {
  const p = dateParts(iso, timeZone);
  return `${p.weekday} ${p.day} ${p.month}`;
}

/** "Sábado 8 de noviembre" (con el año si no es el actual). */
export function formatEventDayLong(iso: string, timeZone: string): string {
  const date = new Date(iso);
  const sameYear =
    new Intl.DateTimeFormat('en-CA', { year: 'numeric', timeZone }).format(date) ===
    new Intl.DateTimeFormat('en-CA', { year: 'numeric', timeZone }).format(new Date());
  return capitalize(
    new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      ...(sameYear ? {} : { year: 'numeric' }),
      timeZone,
    }).format(date),
  );
}

/** "martes 10 de noviembre de 2026" (siempre con año: para textos que se citan solos). */
export function formatEventDateWithYear(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  })
    .format(new Date(iso))
    .replace(',', '');
}

/** "9:00" */
export function formatEventTime(iso: string, timeZone: string): string {
  return dateParts(iso, timeZone).time;
}

/** Día del calendario en la zona del evento ("2026-11-08"). */
export function eventDayKey(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(iso),
  );
}

/** "Sáb 8 nov · 9:00 – 14:00" o, si dura varios días, "Sáb 8 nov, 9:00 – dom 9 nov, 14:00". */
export function formatSessionRange(startsAt: string, endsAt: string, timeZone: string): string {
  const start = dateParts(startsAt, timeZone);
  const end = dateParts(endsAt, timeZone);
  if (eventDayKey(startsAt, timeZone) === eventDayKey(endsAt, timeZone)) {
    return `${capitalize(`${start.weekday} ${start.day} ${start.month}`)} · ${start.time} – ${end.time}`;
  }
  return `${capitalize(`${start.weekday} ${start.day} ${start.month}`)}, ${start.time} – ${end.weekday} ${end.day} ${end.month}, ${end.time}`;
}

/** Para el cuadrito de calendario de la tarjeta. */
export function eventDateBadge(iso: string, timeZone: string): { month: string; day: string; weekday: string } {
  const p = dateParts(iso, timeZone);
  return { month: p.month.toUpperCase(), day: p.day, weekday: p.weekday };
}

/** "Explanada del Jardín Morelos, Morelia" o "Col. Centro, Morelia, Michoacán". */
export function eventPlaceText(
  event: Pick<PetEvent, 'placeLabel' | 'neighborhood' | 'city' | 'state'>,
  { withState = false }: { withState?: boolean } = {},
): string {
  const place = event.placeLabel?.trim() || event.neighborhood?.trim() || '';
  return [place, withState ? eventCityText(event) : event.city?.trim()].filter(Boolean).join(', ');
}

/** "Morelia, Michoacán" */
export function eventCityText(event: Pick<PetEvent, 'city' | 'state'>): string {
  const city = event.city?.trim();
  const state = event.state?.trim();
  // "Ciudad de México, Ciudad de México" → "Ciudad de México".
  if (city && state && city.localeCompare(state, 'es', { sensitivity: 'base' }) === 0) return city;
  return [city, state].filter(Boolean).join(', ');
}

/** "Gratis", "$150", "$150 · Cuota de recuperación" o solo la nota. */
export function eventPriceText(event: Pick<PetEvent, 'isFree' | 'price' | 'priceNote'>): string {
  if (event.isFree) return 'Gratis';
  const price = event.price ? `$${event.price.toLocaleString('es-MX')}` : '';
  return [price, event.priceNote?.trim()].filter(Boolean).join(' · ') || 'Con costo';
}

/** A quién va dirigido: "Zona de 10 km", "Todo Morelia", "Todo Michoacán", "Todo México". */
export function eventScopeText(event: Pick<PetEvent, 'scope' | 'reachKm' | 'city' | 'state'>): string {
  switch (event.scope) {
    case 'city':
      return event.city ? `Todo ${event.city}` : 'Todo el municipio';
    case 'state':
      return event.state ? `Todo ${event.state}` : 'Todo el estado';
    case 'national':
      return 'Todo México';
    default:
      return `Zona de ${event.reachKm ?? 10} km`;
  }
}

/** "Campaña de esterilización · Morelia" para títulos y metadatos. */
export function eventKindTitle(event: Pick<PetEvent, 'category'>): string {
  return eventCategory(event.category).title;
}

export function formatDistanceKm(km: number | null | undefined): string | null {
  if (km === null || km === undefined || !Number.isFinite(km)) return null;
  return km < 1 ? `a ${Math.round(km * 1000)} m` : `a ${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

/** ¿Ya terminaron todas sus fechas? */
export function eventIsPast(event: Pick<PetEvent, 'lastEndsAt'>, now = new Date()): boolean {
  return Boolean(event.lastEndsAt && new Date(event.lastEndsAt).getTime() < now.getTime());
}

/** Fechas que no han terminado, ordenadas. */
export function upcomingSessions<T extends { startsAt: string; endsAt: string }>(sessions: T[], now = new Date()): T[] {
  return sessions
    .filter((session) => new Date(session.endsAt).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

/** Día ("2026-11-08") y hora ("09:00") del formulario, en la zona del evento → ISO en UTC. */
export function zonedInputToIso(date: string, time: string, timeZone: string): string | null {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  try {
    return toZoned(new CalendarDateTime(year, month, day, hour, minute), timeZone).toDate().toISOString();
  } catch {
    return null;
  }
}

/** ISO en UTC → día y hora del formulario en la zona del evento. */
export function isoToZonedInput(iso: string, timeZone: string): { date: string; time: string } {
  const zoned = fromDate(new Date(iso), timeZone);
  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    date: `${zoned.year}-${pad(zoned.month)}-${pad(zoned.day)}`,
    time: `${pad(zoned.hour)}:${pad(zoned.minute)}`,
  };
}

/** "20261108T150000Z" para Google Calendar y .ics. */
export function toCalendarStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Link para agregar una fecha del evento a Google Calendar. */
export function googleCalendarUrl(
  event: Pick<PetEvent, 'title' | 'placeLabel' | 'address' | 'neighborhood' | 'city' | 'state' | 'timeZone' | 'stateCode'>,
  session: { startsAt: string; endsAt: string },
  details: string,
): string {
  const location = [event.placeLabel, event.address, event.neighborhood, event.city, event.state]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toCalendarStamp(session.startsAt)}/${toCalendarStamp(session.endsAt)}`,
    details,
    location,
    ctz: eventTimeZone(event),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Teléfono de 10 dígitos legible: "443 521 5638". */
export function formatPhone(digits: string | null | undefined): string {
  const value = (digits ?? '').replace(/\D/g, '');
  if (value.length !== 10) return value;
  return `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`;
}

/** Link de WhatsApp para un número mexicano de 10 dígitos. */
export function whatsappUrl(digits: string | null | undefined, text?: string): string | null {
  const value = (digits ?? '').replace(/\D/g, '');
  if (value.length !== 10) return null;
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/52${value}${query}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Fin de «esta semana» (domingo) o «este mes» en hora de CDMX, como día completo: así la llave de
 * la caché no cambia en todo el día.
 */
export function whenUntil(when: EventWhen | null | undefined, now = new Date()): string | null {
  if (!when || when === 'proximos') return null;
  const [year, month, day] = new Intl.DateTimeFormat('en-CA', {
    timeZone: DEFAULT_EVENT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(now)
    .split('-')
    .map(Number);
  const today = new Date(Date.UTC(year, month - 1, day));
  let end: Date;
  if (when === 'semana') {
    const weekday = today.getUTCDay(); // 0 = domingo
    end = new Date(today.getTime() + ((7 - weekday) % 7) * DAY_MS);
  } else {
    end = new Date(Date.UTC(year, month, 0));
  }
  const pad = (value: number) => String(value).padStart(2, '0');
  const key = `${end.getUTCFullYear()}-${pad(end.getUTCMonth() + 1)}-${pad(end.getUTCDate())}`;
  return zonedInputToIso(key, '23:59', DEFAULT_EVENT_TIME_ZONE);
}
