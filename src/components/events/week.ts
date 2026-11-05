import { eventDayKey, eventTimeZone } from './format';
import type { EventFeedItem, EventSession, PetEvent } from './types';

/**
 * Tira de «los próximos 7 días» de la portada. Los días son fechas de calendario ("2026-11-08"):
 * la ficha de cada día se arma desde la fecha, sin depender de la zona del navegador ni del
 * servidor, así el HTML en caché y la página ya hidratada dicen lo mismo.
 */

export type WeekDayTile = {
  key: string;
  /** "HOY", "VIE", "SÁB"… */
  label: string;
  day: string;
  /** "hoy", "mañana", "el sábado 7". */
  spoken: string;
};

export type WeekOccurrence = { event: PetEvent; session: EventSession };

function keyToUtcDate(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Los `count` días desde `todayKey`. */
export function weekTiles(todayKey: string, count = 7): WeekDayTile[] {
  const start = keyToUtcDate(todayKey);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start.getTime() + index * 24 * 60 * 60 * 1000);
    const short = new Intl.DateTimeFormat('es-MX', { weekday: 'short', timeZone: 'UTC' }).format(date).replace('.', '');
    const long = new Intl.DateTimeFormat('es-MX', { weekday: 'long', timeZone: 'UTC' }).format(date);
    const day = String(date.getUTCDate());
    return {
      key: date.toISOString().slice(0, 10),
      label: index === 0 ? 'HOY' : short.toUpperCase(),
      day,
      spoken: index === 0 ? 'hoy' : index === 1 ? 'mañana' : `el ${long} ${day}`,
    };
  });
}

/** Fecha de hoy en el navegador ("2026-11-05"). */
export function localTodayKey(now = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Cada fecha de cada evento en los días que toca, en la zona del evento (una fecha de varios días
 * sale en cada uno; un fin a las 00:00 no ocupa el día siguiente). Ordenadas por hora de inicio.
 */
export function occurrencesByDay(items: EventFeedItem[], tiles: WeekDayTile[]): Map<string, WeekOccurrence[]> {
  const byDay = new Map<string, WeekOccurrence[]>(tiles.map((tile) => [tile.key, []]));
  for (const { event } of items) {
    const tz = eventTimeZone(event);
    for (const session of event.sessions ?? []) {
      const start = eventDayKey(session.startsAt, tz);
      const end = eventDayKey(new Date(new Date(session.endsAt).getTime() - 1).toISOString(), tz);
      for (const tile of tiles) {
        if (start <= tile.key && tile.key <= end) byDay.get(tile.key)?.push({ event, session });
      }
    }
  }
  for (const list of byDay.values()) list.sort((a, b) => a.session.startsAt.localeCompare(b.session.startsAt));
  return byDay;
}
