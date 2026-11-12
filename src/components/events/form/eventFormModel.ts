import { normalizeMxPhone } from 'kadesh/utils/phone';
import {
  DEFAULT_EVENT_REACH_KM,
  DEFAULT_EVENT_TIME_ZONE,
  EVENT_LIMITS,
  isEventCategory,
  knownEventSpecies,
} from '../constants';
import { eventDayKey, isoToZonedInput, zonedInputToIso } from '../format';
import { cityKey, stateFromText } from '../mexicoStates';
import { EVENT_SOCIAL_LINKS, normalizeSocialInput } from '../socialLinks';
import type { EventFormValues, EventSessionDraft, OwnPetEvent, PetEventInput } from '../types';

/**
 * Valores, validación y armado del formulario de eventos. Las mismas reglas que el backend
 * (`models/Pet/PetEvent/PetEvent.rules.ts`); el backend vuelve a validar todo.
 */

export type EventFormErrors = Partial<Record<keyof EventFormValues | 'location' | 'sessions' | 'photos', string>> & {
  /** Errores por fecha, con su `key`. */
  sessionRows?: Record<string, string>;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const PAST_TOLERANCE_MS = 10 * 60 * 1000;

let keySeed = 0;
export function newSessionKey(): string {
  keySeed += 1;
  return `s${Date.now().toString(36)}${keySeed}`;
}

export function emptySession(date = ''): EventSessionDraft {
  return { key: newSessionKey(), date, startTime: '09:00', endDate: date, endTime: '14:00' };
}

export const EMPTY_EVENT_FORM: EventFormValues = {
  title: '',
  category: '',
  species: [],
  description: '',
  requirements: '',
  organizerName: '',
  contactPhone: '',
  lat: '',
  lng: '',
  placeLabel: '',
  address: '',
  neighborhood: '',
  city: '',
  state: '',
  scope: 'city',
  reachKm: DEFAULT_EVENT_REACH_KM,
  isFree: true,
  price: '',
  priceNote: '',
  capacity: '',
  registrationUrl: '',
  registrationWhatsapp: '',
  facebookUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
  xUrl: '',
  websiteUrl: '',
  sessions: [emptySession()],
};

/** Zona horaria en la que se capturan las horas: la del estado del pin. */
export function formTimeZone(values: Pick<EventFormValues, 'state'>): string {
  return stateFromText(values.state)?.timeZone ?? DEFAULT_EVENT_TIME_ZONE;
}

/** Un evento guardado → valores del formulario (editar). */
export function eventToFormValues(event: OwnPetEvent): EventFormValues {
  const tz = event.timeZone || DEFAULT_EVENT_TIME_ZONE;
  return {
    title: event.title ?? '',
    category: event.category ?? '',
    // Sin el valor viejo `other`: ya no hay casilla para quitarlo y el backend lo descarta.
    species: knownEventSpecies(event.species),
    description: event.description ?? '',
    requirements: event.requirements ?? '',
    organizerName: event.organizerName ?? '',
    contactPhone: event.contactPhone ?? '',
    lat: String(event.lat ?? ''),
    lng: String(event.lng ?? ''),
    placeLabel: event.placeLabel ?? '',
    address: event.address ?? '',
    neighborhood: event.neighborhood ?? '',
    city: event.city ?? '',
    state: event.state ?? '',
    scope: event.scope ?? 'city',
    reachKm: event.reachKm ?? DEFAULT_EVENT_REACH_KM,
    isFree: event.isFree !== false,
    price: event.price ? String(event.price) : '',
    priceNote: event.priceNote ?? '',
    capacity: event.capacity ? String(event.capacity) : '',
    registrationUrl: event.registrationUrl ?? '',
    registrationWhatsapp: event.registrationWhatsapp ?? '',
    facebookUrl: event.facebookUrl ?? '',
    instagramUrl: event.instagramUrl ?? '',
    tiktokUrl: event.tiktokUrl ?? '',
    xUrl: event.xUrl ?? '',
    websiteUrl: event.websiteUrl ?? '',
    sessions: (event.sessions ?? []).map((session) => {
      const start = isoToZonedInput(session.startsAt, tz);
      const end = isoToZonedInput(session.endsAt, tz);
      return { key: newSessionKey(), date: start.date, startTime: start.time, endDate: end.date, endTime: end.time };
    }),
  };
}

/** Fecha del formulario → inicio y fin en UTC, o null si falta algo. */
export function sessionToIso(session: EventSessionDraft, timeZone: string): { startsAt: string; endsAt: string } | null {
  if (!session.date || !session.startTime || !session.endTime) return null;
  const startsAt = zonedInputToIso(session.date, session.startTime, timeZone);
  const endsAt = zonedInputToIso(session.endDate || session.date, session.endTime, timeZone);
  return startsAt && endsAt ? { startsAt, endsAt } : null;
}

/** "Repetir cada semana hasta…": copia la primera fecha cada 7 días (sin pasar el tope). */
export function repeatWeekly(first: EventSessionDraft, until: string, timeZone: string, max = EVENT_LIMITS.MAX_SESSIONS): EventSessionDraft[] {
  const base = sessionToIso(first, timeZone);
  if (!base || !until) return [first];
  const limit = zonedInputToIso(until, '23:59', timeZone);
  if (!limit) return [first];
  const sessions: EventSessionDraft[] = [first];
  const duration = new Date(base.endsAt).getTime() - new Date(base.startsAt).getTime();
  for (let week = 1; sessions.length < max; week += 1) {
    const start = new Date(new Date(base.startsAt).getTime() + week * 7 * DAY_MS);
    if (start.getTime() > new Date(limit).getTime()) break;
    const startInput = isoToZonedInput(start.toISOString(), timeZone);
    const endInput = isoToZonedInput(new Date(start.getTime() + duration).toISOString(), timeZone);
    sessions.push({
      key: newSessionKey(),
      date: startInput.date,
      startTime: startInput.time,
      endDate: endInput.date,
      endTime: endInput.time,
    });
  }
  return sessions;
}

/** Hoy en la zona del evento, para el `min` de los campos de fecha. */
export function todayInZone(timeZone: string): string {
  return eventDayKey(new Date().toISOString(), timeZone);
}

function validUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value) return true;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname.includes('.');
  } catch {
    return false;
  }
}

/**
 * Errores del formulario (vacío = se puede enviar). `originalSessions` son las fechas guardadas
 * (editar): esas sí pueden haber pasado.
 */
export function validateEventForm(
  values: EventFormValues,
  { originalSessions = [], isAdmin = false, now = new Date() }: { originalSessions?: Array<{ startsAt: string; endsAt: string }>; isAdmin?: boolean; now?: Date } = {},
): EventFormErrors {
  const errors: EventFormErrors = {};
  const title = values.title.trim();
  if (title.length < EVENT_LIMITS.TITLE_MIN) errors.title = 'Escribe un título de al menos 5 letras.';
  if (!isEventCategory(values.category)) errors.category = 'Elige el tipo de evento.';
  if (values.description.trim().length < EVENT_LIMITS.DESCRIPTION_MIN) {
    errors.description = 'Cuenta un poco más del evento (al menos 20 letras).';
  }

  const lat = Number(values.lat);
  const lng = Number(values.lng);
  if (!values.lat || !values.lng || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    errors.location = 'Marca en el mapa dónde será el evento.';
  }
  if (values.scope === 'national' && !isAdmin) errors.scope = 'Elige estado, municipio o zona.';
  if (values.scope === 'city' && values.lat && !cityKey(values.city)) {
    errors.scope = 'No reconocimos el municipio del pin. Elige «El estado» o «Una zona».';
  }

  // Fechas
  const tz = formTimeZone(values);
  const original = new Set(originalSessions.map((session) => `${session.startsAt}|${session.endsAt}`));
  const rows: Record<string, string> = {};
  const starts = new Set<string>();
  const maxStart = new Date(now);
  maxStart.setMonth(maxStart.getMonth() + EVENT_LIMITS.MAX_MONTHS_AHEAD);
  let anyFuture = false;
  if (values.sessions.length === 0) errors.sessions = 'Agrega al menos una fecha.';
  if (values.sessions.length > EVENT_LIMITS.MAX_SESSIONS) {
    errors.sessions = `Un evento puede tener hasta ${EVENT_LIMITS.MAX_SESSIONS} fechas.`;
  }
  for (const session of values.sessions) {
    const iso = sessionToIso(session, tz);
    if (!iso) {
      rows[session.key] = 'Pon el día y las horas.';
      continue;
    }
    const start = new Date(iso.startsAt).getTime();
    const end = new Date(iso.endsAt).getTime();
    if (end <= start) rows[session.key] = 'Debe terminar después de empezar.';
    else if (end - start > EVENT_LIMITS.MAX_SESSION_DAYS * DAY_MS) {
      rows[session.key] = `Hasta ${EVENT_LIMITS.MAX_SESSION_DAYS} días. Si dura más, agrega otra fecha.`;
    } else if (start < now.getTime() - PAST_TOLERANCE_MS && !original.has(`${iso.startsAt}|${iso.endsAt}`)) {
      rows[session.key] = 'Esta fecha ya pasó.';
    } else if (start > maxStart.getTime()) {
      rows[session.key] = `Debe ser dentro de los próximos ${EVENT_LIMITS.MAX_MONTHS_AHEAD} meses.`;
    } else if (starts.has(iso.startsAt)) {
      rows[session.key] = 'Hay otra fecha que empieza a la misma hora.';
    }
    starts.add(iso.startsAt);
    if (end > now.getTime()) anyFuture = true;
  }
  if (Object.keys(rows).length > 0) errors.sessionRows = rows;
  else if (values.sessions.length > 0 && !anyFuture) errors.sessions = 'Todas las fechas ya pasaron. Agrega una próxima.';

  // Costo, cupo y registro
  if (!values.isFree) {
    const price = values.price.trim() ? Number(values.price) : null;
    if (price !== null && (!Number.isInteger(price) || price < 1)) errors.price = 'Escribe el costo en pesos, sin centavos.';
    if (price === null && !values.priceNote.trim()) errors.price = 'Escribe el costo o explica la cuota.';
  }
  if (values.capacity.trim()) {
    const capacity = Number(values.capacity);
    if (!Number.isInteger(capacity) || capacity < 1) errors.capacity = 'El cupo debe ser un número de lugares.';
  }
  if (!validUrl(values.registrationUrl)) errors.registrationUrl = 'Revisa el link: debe empezar con https://';
  if (values.registrationWhatsapp.trim()) {
    const phone = normalizeMxPhone(values.registrationWhatsapp);
    if (!phone.ok) errors.registrationWhatsapp = phone.reason;
  }
  if (values.contactPhone.trim()) {
    const phone = normalizeMxPhone(values.contactPhone);
    if (!phone.ok) errors.contactPhone = phone.reason;
  }
  for (const social of EVENT_SOCIAL_LINKS) {
    const result = normalizeSocialInput(social, values[social.field]);
    if (!result.ok) errors[social.field] = result.message;
  }
  return errors;
}

export function hasErrors(errors: EventFormErrors): boolean {
  return Object.entries(errors).some(([key, value]) =>
    key === 'sessionRows' ? Object.keys(value ?? {}).length > 0 : Boolean(value),
  );
}

function orNull(value: string): string | null {
  const clean = value.trim();
  return clean ? clean : null;
}

/** Redes como links completos (vacío → null). */
function socialInput(values: EventFormValues): Pick<PetEventInput, (typeof EVENT_SOCIAL_LINKS)[number]['field']> {
  const out = {} as Pick<PetEventInput, (typeof EVENT_SOCIAL_LINKS)[number]['field']>;
  for (const social of EVENT_SOCIAL_LINKS) {
    const result = normalizeSocialInput(social, values[social.field]);
    out[social.field] = result.ok && result.url ? result.url : null;
  }
  return out;
}

/** Valores ya validados → `PetEventInput` del backend. */
export function buildEventInput(values: EventFormValues, petPlaceId: string | null): PetEventInput {
  const tz = formTimeZone(values);
  const phone = normalizeMxPhone(values.contactPhone);
  const whatsapp = normalizeMxPhone(values.registrationWhatsapp);
  return {
    title: values.title.trim(),
    category: values.category,
    species: values.species,
    description: values.description.trim(),
    requirements: orNull(values.requirements),
    organizerName: orNull(values.organizerName),
    contactPhone: phone.ok ? phone.digits : null,
    petPlaceId,
    lat: Number(values.lat),
    lng: Number(values.lng),
    placeLabel: orNull(values.placeLabel),
    address: orNull(values.address),
    neighborhood: orNull(values.neighborhood),
    city: orNull(values.city),
    state: orNull(values.state),
    scope: values.scope,
    reachKm: values.scope === 'zone' ? values.reachKm : null,
    isFree: values.isFree,
    price: !values.isFree && values.price.trim() ? Number(values.price) : null,
    priceNote: values.isFree ? null : orNull(values.priceNote),
    capacity: values.capacity.trim() ? Number(values.capacity) : null,
    registrationUrl: orNull(values.registrationUrl),
    registrationWhatsapp: whatsapp.ok ? whatsapp.digits : null,
    ...socialInput(values),
    sessions: values.sessions
      .map((session) => sessionToIso(session, tz))
      .filter((session): session is { startsAt: string; endsAt: string } => Boolean(session))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  };
}
