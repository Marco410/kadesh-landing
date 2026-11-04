/** `YYYY-MM-DD` en la zona del navegador (el `CalendarDay` de Keystone no lleva hora). */
export function calendarDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Inicio de la hora actual: las variables de las consultas no cambian a cada render. */
export function startOfHour(date: Date): Date {
  const next = new Date(date);
  next.setMinutes(0, 0, 0);
  return next;
}

/** Lunes 00:00 (hora local) de la semana de `date`. */
export function startOfWeek(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = (next.getDay() + 6) % 7; // lunes = 0
  next.setDate(next.getDate() - day);
  return next;
}

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

/** `YYYY-MM-DD` → fecha local a las 00:00 (sin el corrimiento de zona de `new Date("YYYY-MM-DD")`). */
export function parseCalendarDay(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Días completos entre dos fechas locales (b − a), ignorando la hora. */
export function dayDiff(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000);
}
