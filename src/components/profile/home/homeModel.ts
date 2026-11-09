import type { IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  Calendar03Icon,
  Call02Icon,
  CharityIcon,
  InjectionIcon,
  RadarIcon,
  Stethoscope02Icon,
  UserSearch01Icon,
} from "@hugeicons/core-free-icons";
import type { ColumnPoint, DashStatDelta } from "kadesh/components/app-shell";
import { isAnimalReportStatus } from "kadesh/components/animals/constants";
import { PET_PLACE_CLAIM_STATUS } from "kadesh/components/veterinaries/constants";
import { Routes } from "kadesh/core/routes";
import {
  addDays,
  calendarDay,
  dayDiff,
  parseCalendarDay,
  startOfDay,
  startOfHour,
  startOfWeek,
} from "kadesh/components/profile/shell/dates";
import type {
  HomeAppointment,
  HomePetPlace,
  HomeRescueOrg,
  HomeReminder,
  ProfileClinicHomeResponse,
  ProfileClinicHomeVariables,
  ProfileHomeResponse,
  ProfileHomeVariables,
} from "./queries";

/*
 * Reglas del Inicio del perfil, sin React (las comparte el prompt de móvil). Todo lo que se cuenta
 * sale de datos reales: si no hay historial, no hay pastilla ni sparkline.
 */

export const WEEKS = 8;
const WEEK_KEYS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

/** Recordatorios abiertos: pendiente o ya avisado (no hecho ni cancelado). */
export const OPEN_REMINDER_STATUSES = ["pending", "sent"] as const;
/** Citas que siguen en pie. */
export const UPCOMING_APPOINTMENT_STATUSES = ["pending", "confirmed"] as const;
/** Días hacia adelante que cuentan como "pronto" para los recordatorios. */
export const REMINDER_WINDOW_DAYS = 7;

export function buildHomeVariables(userId: string, now: Date): ProfileHomeVariables {
  const hour = startOfHour(now);
  const vars: Record<string, unknown> = {
    userId,
    reminderWhere: {
      pet: { owners: { some: { user: { id: { equals: userId } } } } },
      status: { in: [...OPEN_REMINDER_STATUSES] },
      dueDate: { lte: calendarDay(addDays(now, REMINDER_WINDOW_DAYS)) },
    },
    upcomingWhere: {
      customer: { id: { equals: userId } },
      status: { in: [...UPCOMING_APPOINTMENT_STATUSES] },
      startsAt: { gte: hour.toISOString() },
    },
  };
  // Ventanas de 7 días hacia atrás desde la hora actual (n0 = últimos 7 días).
  for (const i of WEEK_KEYS) {
    vars[`n${i}`] = {
      product: { equals: "pet" },
      createdAt: { gte: addDays(hour, -7 * (i + 1)).toISOString(), lt: addDays(hour, -7 * i).toISOString() },
    };
  }
  return vars as ProfileHomeVariables;
}

export function buildClinicVariables(userId: string, placeIds: string[], now: Date): ProfileClinicHomeVariables {
  const place = { pet_place: { user: { id: { equals: userId } }, verified: { equals: true } } };
  const today = startOfDay(now);
  const week = startOfWeek(now);
  const vars: Record<string, unknown> = {
    placeIds,
    todayWhere: {
      ...place,
      status: { notIn: ["cancelled"] },
      startsAt: { gte: today.toISOString(), lt: addDays(today, 1).toISOString() },
    },
    pendingWhere: { ...place, status: { equals: "pending" }, startsAt: { gte: startOfHour(now).toISOString() } },
  };
  // Semanas de calendario (lunes a domingo); c0 = la semana en curso.
  for (const i of WEEK_KEYS) {
    vars[`c${i}`] = {
      ...place,
      status: { notIn: ["cancelled"] },
      startsAt: { gte: addDays(week, -7 * i).toISOString(), lt: addDays(week, -7 * (i - 1)).toISOString() },
    };
  }
  return vars as ProfileClinicHomeVariables;
}

/** Se puede administrar: verificada (o con el reclamo ya verificado). Misma regla que la vista Clínicas. */
export function isManageablePlace(place: HomePetPlace): boolean {
  return Boolean(place.verified) || place.claimStatus === PET_PLACE_CLAIM_STATUS.VERIFIED;
}

/** Último estado de un reporte (logs ordenados por fecha, el más reciente primero). Activo si sigue abierto. */
export function isActiveReport(latestStatus: string | null | undefined): boolean {
  return isAnimalReportStatus(latestStatus);
}

/**
 * Cambio entre las dos ventanas más recientes. `null` si no hay con qué comparar: sin historial no
 * se inventa un porcentaje.
 */
export function weekDelta(current: number, previous: number): DashStatDelta | null {
  if (current === 0 && previous === 0) return null;
  const label = "frente a los 7 días anteriores";
  if (previous === 0) return { value: null, label: "nuevas esta semana" };
  return { value: Math.round(((current - previous) / previous) * 100), label };
}

const shortDate = (date: Date) =>
  date.toLocaleDateString("es-MX", { day: "numeric", month: "short" }).replace(".", "");

/** Barras de citas por semana: de la más vieja a la actual (rayada, va a medias). */
export function clinicWeekPoints(data: ProfileClinicHomeResponse | undefined, now: Date): ColumnPoint[] {
  const week = startOfWeek(now);
  return [...WEEK_KEYS].reverse().map((i) => {
    const start = addDays(week, -7 * i);
    const value = data?.[`c${i}`] ?? 0;
    return {
      key: `c${i}`,
      label: shortDate(start),
      value,
      current: i === 0,
      title: `Semana del ${shortDate(start)}${i === 0 ? " (en curso)" : ""}: ${value} ${value === 1 ? "cita" : "citas"}`,
    };
  });
}

/** Notificaciones recibidas por ventana de 7 días, de la más vieja a la actual. */
export function notificationSeries(data: ProfileHomeResponse | undefined): number[] {
  return [...WEEK_KEYS].reverse().map((i) => data?.[`n${i}`] ?? 0);
}

// ─── Requiere atención ──────────────────────────────────────────────────────────────────────

export type AttentionSeverity = "danger" | "warning" | "info" | "tip";

export type AttentionItem = {
  id: string;
  severity: AttentionSeverity;
  title: string;
  detail?: string;
  href: string;
  icon: IconSvgElement;
};

const SEVERITY_ORDER: Record<AttentionSeverity, number> = { danger: 0, warning: 1, info: 2, tip: 3 };

function reminderWhen(dueDate: string, now: Date): { text: string; overdue: boolean } {
  const days = dayDiff(now, parseCalendarDay(dueDate));
  const date = parseCalendarDay(dueDate);
  if (days < 0) return { text: `Venció el ${shortDate(date)}`, overdue: true };
  if (days === 0) return { text: "Vence hoy", overdue: false };
  if (days === 1) return { text: "Vence mañana", overdue: false };
  return {
    text: `Vence el ${date.toLocaleDateString("es-MX", { weekday: "long" })} ${shortDate(date)}`,
    overdue: false,
  };
}

/** "hoy a las 10:30", "mañana a las 9:00", "el jueves 6 nov a las 17:00". */
export function appointmentWhen(startsAt: string, now: Date): string {
  const date = new Date(startsAt);
  const time = date.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" });
  const days = dayDiff(now, date);
  if (days === 0) return `hoy a las ${time}`;
  if (days === 1) return `mañana a las ${time}`;
  return `el ${date.toLocaleDateString("es-MX", { weekday: "long" })} ${shortDate(date)} a las ${time}`;
}

export type AttentionInput = {
  now: Date;
  reminders: HomeReminder[];
  /** Total de recordatorios abiertos en la ventana (la lista trae solo los primeros 5). */
  remindersCount: number;
  nextAppointment: HomeAppointment | null;
  pendingClaims: number;
  places: HomePetPlace[];
  clinicPending: number;
  /** Espacios de rescate de la persona; solo avisa a sus administradores. */
  rescueOrgs?: HomeRescueOrg[];
  hasPhone: boolean;
  alertsEnabled: boolean | null;
};

/**
 * Lo que necesita atención, de lo más urgente a lo menos:
 * 1. Recordatorio vencido (rojo) o que vence en los próximos 7 días (ámbar).
 * 2. Citas por confirmar en sus clínicas verificadas.
 * 3. Su próxima cita, si es en menos de 48 h.
 * 4. Reclamos de sus reportes que Kadesh está revisando.
 * 5. Clínicas en revisión (aún no las puede administrar) y espacios de rescate en revisión o
 *    rechazados (solo a sus administradores).
 * 6. Sin teléfono en el perfil.
 * 7. Alertas de zona apagadas (sugerencia: no cuenta como "pendiente").
 */
export function buildAttention(input: AttentionInput): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const reminder of input.reminders) {
    const when = reminderWhen(reminder.dueDate, input.now);
    items.push({
      id: `reminder-${reminder.id}`,
      severity: when.overdue ? "danger" : "warning",
      title: reminder.pet?.name ? `${reminder.title} de ${reminder.pet.name}` : reminder.title,
      detail: when.text,
      href: reminder.pet?.id ? Routes.profilePet(reminder.pet.id) : Routes.profileTab("pets"),
      icon: InjectionIcon,
    });
  }

  const extraReminders = input.remindersCount - input.reminders.length;
  if (extraReminders > 0) {
    items.push({
      id: "reminders-more",
      severity: "warning",
      title: `${extraReminders} ${extraReminders === 1 ? "recordatorio más" : "recordatorios más"}`,
      detail: "Vencidos o de los próximos 7 días.",
      href: Routes.profileTab("pets"),
      icon: InjectionIcon,
    });
  }

  const manageable = input.places.filter(isManageablePlace);
  if (input.clinicPending > 0) {
    const single = manageable.length === 1 ? manageable[0] : null;
    items.push({
      id: "clinic-pending",
      severity: "warning",
      title: `${input.clinicPending} ${input.clinicPending === 1 ? "cita por confirmar" : "citas por confirmar"}`,
      detail: single ? `En ${single.name}` : "En tus clínicas",
      href: single ? Routes.profileClinic(single.id, "citas") : Routes.profileTab("clinics"),
      icon: Stethoscope02Icon,
    });
  }

  const next = input.nextAppointment;
  if (next && new Date(next.startsAt).getTime() - input.now.getTime() <= 48 * 3_600_000) {
    items.push({
      id: `appointment-${next.id}`,
      severity: "info",
      title: `Tu cita es ${appointmentWhen(next.startsAt, input.now)}`,
      detail: [next.pet_place?.name, next.petName].filter(Boolean).join(" · ") || undefined,
      href: Routes.profileTab("appointments"),
      icon: Calendar03Icon,
    });
  }

  if (input.pendingClaims > 0) {
    items.push({
      id: "claims",
      severity: "info",
      title:
        input.pendingClaims === 1
          ? "Alguien reclamó uno de tus reportes"
          : `${input.pendingClaims} reclamos en tus reportes`,
      detail: "Kadesh lo está revisando; te avisamos al resolverlo.",
      href: Routes.profileTab("animals"),
      icon: UserSearch01Icon,
    });
  }

  for (const place of input.places.filter((p) => !isManageablePlace(p))) {
    items.push({
      id: `place-${place.id}`,
      severity: "info",
      title: `${place.name} está en revisión`,
      detail: "Valídala por WhatsApp para administrarla.",
      href: Routes.profileTab("clinics"),
      icon: Alert02Icon,
    });
  }

  for (const org of (input.rescueOrgs ?? []).filter((item) => item.viewerRole === "admin")) {
    if (org.status === "pending") {
      items.push({
        id: `rescue-${org.id}`,
        severity: "info",
        title: `${org.name} está en revisión`,
        detail: "Escríbenos por WhatsApp para que tu perfil sea público.",
        href: Routes.profileRescue(org.id),
        icon: CharityIcon,
      });
    } else if (org.status === "rejected" || org.status === "suspended") {
      items.push({
        id: `rescue-${org.id}`,
        severity: "warning",
        title: org.status === "suspended" ? `${org.name} está suspendido` : `No pudimos verificar ${org.name}`,
        detail: "Revisa el motivo en tu espacio de rescate.",
        href: Routes.profileRescue(org.id),
        icon: CharityIcon,
      });
    }
  }

  if (!input.hasPhone) {
    items.push({
      id: "phone",
      severity: "info",
      title: "Agrega tu teléfono",
      detail: "Así te pueden contactar si alguien encuentra a tu mascota.",
      href: Routes.profileTab("profile"),
      icon: Call02Icon,
    });
  }

  if (input.alertsEnabled === false) {
    items.push({
      id: "alerts",
      severity: "tip",
      title: "Activa las alertas de zona",
      detail: "Te avisamos cuando reporten un animal perdido cerca de ti.",
      href: Routes.notifications.alerts,
      icon: RadarIcon,
    });
  }

  return items.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

/** Cuántas cosas cuentan como pendientes en la frase del saludo (las sugerencias no). */
export function pendingCount(items: AttentionItem[]): number {
  return items.filter((item) => item.severity !== "tip").length;
}
