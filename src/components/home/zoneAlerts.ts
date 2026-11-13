import { ANIMAL_TYPE_LABELS } from 'kadesh/components/animals/constants';
import { knownAnimalName } from 'kadesh/components/animals/animalName';

/**
 * Lo que comparte la sección «Alertas de zona» de la portada entre el servidor (lista inicial,
 * la que indexan los buscadores) y el navegador (lista de la zona de quien la ve).
 */

/** Estados que mandan alerta a la zona (kadesh-back `utils/notifications/nearbyAnimalAlerts.ts`). */
export type ZoneAlertStatus = 'lost' | 'found';

/** Cuántas alertas muestra la portada. */
export const ZONE_ALERTS_LIMIT = 5;

/** Las fechas van en hora de México, igual en el servidor (UTC) que en el navegador. */
const ALERT_TIME_ZONE = 'America/Mexico_City';

export type ZoneAlert = {
  /** Id del animal. */
  id: string;
  href: string;
  status: ZoneAlertStatus;
  title: string;
  /** «Perro». Null si es igual al título o no se sabe. */
  typeLabel: string | null;
  place: string | null;
  /** ISO, para `<time dateTime>`. */
  dateTime: string | null;
  /** «4 nov». Es lo que llega en el HTML: no depende de la hora en que se generó la página. */
  dateLabel: string | null;
  imageUrl: string | null;
  /** Solo en la lista de la zona. */
  distanceKm: number | null;
};

export function isZoneAlertStatus(status: string | null | undefined): status is ZoneAlertStatus {
  return status === 'lost' || status === 'found';
}

/** Nombres que la gente escribe cuando no sabe cómo se llama: el título es el tipo de animal. */
export function alertTitle(
  name: string | null | undefined,
  typeName: string | null | undefined,
): { title: string; typeLabel: string | null } {
  const typeLabel = ANIMAL_TYPE_LABELS[(typeName ?? '').toLowerCase()] ?? null;
  const cleanName = name?.trim() ?? '';
  const title = knownAnimalName(cleanName) || typeLabel || 'Mascota';
  return { title, typeLabel: typeLabel && typeLabel !== title ? typeLabel : null };
}

/**
 * «Manantiales Poniente, Morelia»: los dos primeros datos distintos entre colonia, ciudad y estado.
 * Sin ninguno, la dirección.
 */
export function formatAlertPlace(
  parts: Array<string | null | undefined>,
  fallback?: string | null,
): string | null {
  const unique: string[] = [];
  for (const part of parts) {
    const clean = part?.trim();
    if (clean && !unique.some((seen) => seen.toLowerCase() === clean.toLowerCase())) unique.push(clean);
  }
  return unique.slice(0, 2).join(', ') || fallback?.trim() || null;
}

/** El mismo animal reportado dos veces (aún sin unir) se muestra una sola vez. */
export function dedupeAlerts(alerts: ZoneAlert[]): ZoneAlert[] {
  const seen = new Set<string>();
  return alerts.filter((alert) => {
    const key = `${alert.status}|${alert.title}|${alert.place ?? ''}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * `getNearbyAnimals` devuelve `createdAt` como «MM/DD/YYYY, hh:mm:ss AM/PM», sin zona: lo arma con
 * la hora del servidor del back, que corre en UTC. Leerlo como hora local lo corre 6 h en México.
 */
const NEARBY_DATE = /^(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2}) (AM|PM)$/;

/** ISO de una fecha del API (ISO o el formato de `getNearbyAnimals`); null si no se entiende. */
export function toIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = NEARBY_DATE.exec(value);
  let date: Date;
  if (match) {
    const [, month, day, year, hours, minutes, seconds, meridiem] = match;
    const hour12 = Number(hours) % 12;
    date = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        meridiem === 'PM' ? hour12 + 12 : hour12,
        Number(minutes),
        Number(seconds),
      ),
    );
  } else {
    date = new Date(value);
  }
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const dayFormatter = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  timeZone: ALERT_TIME_ZONE,
});

/** «4 nov». */
export function formatAlertDay(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : dayFormatter.format(date).replace('.', '');
}

/**
 * «Hace 20 min», «Hace 3 h», «Hace 2 días»; pasada una semana, el día. Solo en el navegador:
 * depende de la hora actual y la página se sirve desde caché.
 */
export function formatAlertAgo(iso: string | null, now: number): string | null {
  if (!iso) return null;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return null;
  const minutes = Math.max(0, Math.round((now - time) / 60_000));
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return days === 1 ? 'Hace 1 día' : `Hace ${days} días`;
  return formatAlertDay(iso);
}

export function formatAlertDistance(km: number | null): string | null {
  if (km == null) return null;
  return km < 1 ? `a ${Math.round(km * 1000)} m` : `a ${km.toFixed(1)} km`;
}
