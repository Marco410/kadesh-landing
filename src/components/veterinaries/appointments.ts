import type { PetPlaceType } from "./types";

export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
} as const;

export type AppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
  no_show: "No se presentó",
};

export function isAppointmentStatus(value: string): value is AppointmentStatus {
  return value in APPOINTMENT_STATUS_LABELS;
}

export function appointmentStatusLabel(status: string | null | undefined): string {
  if (status && isAppointmentStatus(status)) return APPOINTMENT_STATUS_LABELS[status];
  return status?.trim() || "Desconocido";
}

export function canCancelAppointment(status: string | null | undefined): boolean {
  return (
    status === APPOINTMENT_STATUS.PENDING ||
    status === APPOINTMENT_STATUS.CONFIRMED
  );
}

export type OwnerAppointmentAction = {
  status: AppointmentStatus;
  label: string;
  tone: "primary" | "danger" | "neutral";
};

export function ownerAppointmentActions(
  status: string | null | undefined,
): OwnerAppointmentAction[] {
  if (status === APPOINTMENT_STATUS.PENDING) {
    return [
      { status: APPOINTMENT_STATUS.CONFIRMED, label: "Confirmar", tone: "primary" },
      { status: APPOINTMENT_STATUS.CANCELLED, label: "Cancelar", tone: "danger" },
    ];
  }
  if (status === APPOINTMENT_STATUS.CONFIRMED) {
    return [
      {
        status: APPOINTMENT_STATUS.COMPLETED,
        label: "Completada",
        tone: "primary",
      },
      { status: APPOINTMENT_STATUS.NO_SHOW, label: "No se presentó", tone: "neutral" },
      { status: APPOINTMENT_STATUS.CANCELLED, label: "Cancelar", tone: "danger" },
    ];
  }
  return [];
}

export const APPOINTMENT_STATUS_BADGE: Record<AppointmentStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
  confirmed:
    "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200",
  cancelled: "bg-[#ececec] text-[#5a5a5a] dark:bg-white/10 dark:text-[#b0b0b0]",
  completed:
    "bg-kadesh-50 text-kadesh-700 dark:bg-kadesh/20 dark:text-kadesh-200",
  no_show: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200",
};

const SLOT_TYPE_VALUES = new Set([
  "veterinary",
  "pet_shelter",
  "pet_park",
  "other",
]);

export type BookingMode = "slot" | "stay";

export function getPetPlaceBookingMode(
  types: Array<Pick<PetPlaceType, "value"> | null> | null | undefined,
): BookingMode | null {
  const values = (types ?? [])
    .map((type) => type?.value)
    .filter((value): value is string => Boolean(value));

  const hasSlot = values.some((value) => SLOT_TYPE_VALUES.has(value));
  const hasStay = values.some((value) => value === "pet_boarding");

  if (hasSlot) return "slot";
  if (hasStay) return "stay";
  return null;
}

export const SLOT_DURATION_OPTIONS = [
  { minutes: 30, label: "30 min" },
  { minutes: 60, label: "1 hora" },
  { minutes: 90, label: "1 h 30" },
  { minutes: 120, label: "2 horas" },
] as const;

export const DEFAULT_SLOT_MINUTES = 60;
export const STAY_CHECK_IN_HOUR = 14;
export const STAY_CHECK_OUT_HOUR = 12;

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function toDateTimeLocalValue(date: Date): string {
  return `${toDateInputValue(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function nextHourDate(from = new Date()): Date {
  const next = new Date(from);
  next.setSeconds(0, 0);
  next.setMinutes(0);
  next.setHours(next.getHours() + 1);
  return next;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function addDaysToDateInput(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function dateAndHourToDate(isoDate: string, hour: number): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day, hour, 0, 0, 0);
}

export function dateTimeLocalToDate(value: string): Date {
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  return new Date(withSeconds);
}

export function defaultStayDates(from = new Date()): {
  checkIn: string;
  checkOut: string;
} {
  const checkIn = new Date(from);
  if (from.getHours() >= STAY_CHECK_IN_HOUR) {
    checkIn.setDate(checkIn.getDate() + 1);
  }
  const checkInValue = toDateInputValue(checkIn);
  return {
    checkIn: checkInValue,
    checkOut: addDaysToDateInput(checkInValue, 1),
  };
}

export function formatAppointmentRange(
  startsAt: string,
  endsAt: string,
): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";

  const sameDay = start.toDateString() === end.toDateString();
  const datePart = start.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (sameDay) {
    const timeOpts: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return `${datePart}, ${start.toLocaleTimeString("es-MX", timeOpts)} – ${end.toLocaleTimeString("es-MX", timeOpts)}`;
  }

  const endDate = end.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${datePart} – ${endDate}`;
}

export function formatTimeOnly(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const BOOKING_PAST_ERROR = "No puedes agendar una cita en el pasado.";
export const BOOKING_RANGE_ERROR =
  "La fecha de fin debe ser posterior a la de inicio.";
export const BOOKING_AUTH_ERROR = "Inicia sesión para reservar una cita.";

export function graphqlErrorMessage(
  error: unknown,
  fallback = "No se pudo completar la solicitud.",
): string {
  if (error && typeof error === "object" && "graphQLErrors" in error) {
    const first = (error as { graphQLErrors?: { message?: string }[] })
      .graphQLErrors?.[0]?.message;
    if (first) return first.split("\n")[0];
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
