import { eventDayKey, eventPlaceText, eventTimeZone, formatEventTime } from "kadesh/components/events/format";
import { Routes } from "kadesh/core/routes";
import { addDays, calendarDay, startOfDay } from "kadesh/components/profile/shell/dates";
import { UPCOMING_APPOINTMENT_STATUSES } from "./homeModel";
import type { ProfileWeekResponse, ProfileWeekVariables, WeekEvent } from "./queries";

/*
 * "Los próximos 7 días" del Inicio, sin React (lo comparte el prompt de móvil). Junta en cada día
 * las citas de la persona, los eventos que sigue u organiza y los eventos próximos de su zona.
 */

export const WEEK_DAYS = 7;
/** Eventos de la zona que se piden para la semana. */
export const WEEK_FEED_TAKE = 30;
/** Radio para "cerca de ti" cuando hay centro (km). */
export const WEEK_NEAR_RADIUS_KM = 50;

export type WeekItemKind = "appointment" | "organizer" | "going" | "interested" | "nearby" | "upcoming";

export const WEEK_KIND_LABEL: Record<WeekItemKind, string> = {
  appointment: "Cita",
  organizer: "Organizas",
  going: "Asistirás",
  interested: "Te interesa",
  nearby: "Cerca de ti",
  upcoming: "Evento",
};

/** Grupo del puntito del día: tus cosas, tus citas o eventos para descubrir. */
export type WeekDotGroup = "appointment" | "mine" | "discover";

export function weekDotGroup(kind: WeekItemKind): WeekDotGroup {
  if (kind === "appointment") return "appointment";
  if (kind === "nearby" || kind === "upcoming") return "discover";
  return "mine";
}

export type WeekItem = {
  /** Único por fecha: una cita o una fecha de un evento. */
  id: string;
  kind: WeekItemKind;
  title: string;
  detail: string;
  href: string;
  startsAt: string;
  endsAt: string;
  /** Zona del evento; null = la del navegador (citas). */
  timeZone: string | null;
};

export type WeekDay = {
  key: string;
  date: Date;
  /** "HOY", "VIE", "SÁB"… */
  label: string;
  day: string;
  /** Para lectores de pantalla y el encabezado de la lista: "hoy", "el sábado 7". */
  spoken: string;
  items: WeekItem[];
};

export function buildWeekVariables(userId: string, now: Date): ProfileWeekVariables {
  const from = startOfDay(now).toISOString();
  const to = addDays(startOfDay(now), WEEK_DAYS).toISOString();
  const window = {
    status: { equals: "approved" },
    firstStartsAt: { lt: to },
    lastEndsAt: { gt: from },
  };
  return {
    userId,
    from,
    to,
    appointmentWhere: {
      customer: { id: { equals: userId } },
      status: { in: [...UPCOMING_APPOINTMENT_STATUSES] },
      startsAt: { gte: from, lt: to },
    },
    interestWhere: { user: { id: { equals: userId } }, event: window },
    myEventsWhere: { user: { id: { equals: userId } }, ...window },
  };
}

/** Hoy y los 6 días siguientes, en la hora del navegador. */
export function buildWeekDays(now: Date): Omit<WeekDay, "items">[] {
  const today = startOfDay(now);
  return Array.from({ length: WEEK_DAYS }, (_, index) => {
    const date = addDays(today, index);
    const weekday = date.toLocaleDateString("es-MX", { weekday: "short" }).replace(".", "");
    const longWeekday = date.toLocaleDateString("es-MX", { weekday: "long" });
    return {
      key: calendarDay(date),
      date,
      label: index === 0 ? "HOY" : weekday.toUpperCase(),
      day: String(date.getDate()),
      spoken: index === 0 ? "hoy" : index === 1 ? "mañana" : `el ${longWeekday} ${date.getDate()}`,
    };
  });
}

function eventItems(event: WeekEvent, kind: WeekItemKind): WeekItem[] {
  const tz = eventTimeZone(event);
  const href = Routes.events.detail(event.slug ?? event.id);
  const detail = eventPlaceText(event) || [event.city, event.state].filter(Boolean).join(", ");
  return (event.sessions ?? []).map((session) => ({
    id: `${event.id}:${session.id}`,
    kind,
    title: event.title,
    detail,
    href,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    timeZone: tz,
  }));
}

/** Orden de prioridad cuando el mismo evento llega por varios lados. */
const KIND_RANK: Record<WeekItemKind, number> = {
  appointment: 0,
  organizer: 1,
  going: 2,
  interested: 3,
  nearby: 4,
  upcoming: 5,
};

/**
 * Todo lo de la semana, sin repetir: si sigues un evento que además está cerca, sale como tuyo.
 * `discover`: eventos del feed (cerca de la zona o de todo México).
 */
export function collectWeekItems(
  data: ProfileWeekResponse | undefined,
  discover: { events: WeekEvent[]; near: boolean },
): WeekItem[] {
  const items: WeekItem[] = [];
  for (const appointment of data?.weekAppointments ?? []) {
    const startsAt = appointment.startsAt;
    const endsAt = appointment.endsAt || new Date(new Date(startsAt).getTime() + 30 * 60 * 1000).toISOString();
    items.push({
      id: `cita:${appointment.id}`,
      kind: "appointment",
      title: appointment.pet_place?.name ? `Cita en ${appointment.pet_place.name}` : "Cita veterinaria",
      detail: appointment.petName ? `Para ${appointment.petName}` : "",
      href: Routes.profileTab("appointments"),
      startsAt,
      endsAt,
      timeZone: null,
    });
  }
  for (const event of data?.weekMyEvents ?? []) items.push(...eventItems(event, "organizer"));
  for (const interest of data?.weekInterests ?? []) {
    if (!interest.event) continue;
    items.push(...eventItems(interest.event, interest.kind === "going" ? "going" : "interested"));
  }
  for (const event of discover.events) items.push(...eventItems(event, discover.near ? "nearby" : "upcoming"));

  const best = new Map<string, WeekItem>();
  for (const item of items) {
    const current = best.get(item.id);
    if (!current || KIND_RANK[item.kind] < KIND_RANK[current.kind]) best.set(item.id, item);
  }
  return [...best.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt) || KIND_RANK[a.kind] - KIND_RANK[b.kind]);
}

function dayKeyOf(iso: string, timeZone: string | null): string {
  return timeZone ? eventDayKey(iso, timeZone) : calendarDay(new Date(iso));
}

/** Reparte cada cosa en los días que toca (una fecha de varios días sale en cada uno). */
export function bucketWeek(days: Omit<WeekDay, "items">[], items: WeekItem[]): WeekDay[] {
  return days.map((day) => ({
    ...day,
    items: items.filter((item) => {
      const start = dayKeyOf(item.startsAt, item.timeZone);
      // Un fin a medianoche no ocupa el día siguiente.
      const end = dayKeyOf(new Date(new Date(item.endsAt).getTime() - 1).toISOString(), item.timeZone);
      return start <= day.key && day.key <= end;
    }),
  }));
}

/** "9:00 – 14:00", "Desde 9:00", "Hasta 14:00" o "Todo el día", según el día que se ve. */
export function weekItemTime(item: WeekItem, dayKey: string): string {
  const start = dayKeyOf(item.startsAt, item.timeZone);
  const end = dayKeyOf(new Date(new Date(item.endsAt).getTime() - 1).toISOString(), item.timeZone);
  const time = (iso: string) =>
    item.timeZone
      ? formatEventTime(iso, item.timeZone)
      : new Date(iso).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", hourCycle: "h23" });
  if (item.kind === "appointment") return time(item.startsAt);
  if (start === end) return `${time(item.startsAt)} – ${time(item.endsAt)}`;
  if (dayKey === start) return `Desde ${time(item.startsAt)}`;
  if (dayKey === end) return `Hasta ${time(item.endsAt)}`;
  return "Todo el día";
}
