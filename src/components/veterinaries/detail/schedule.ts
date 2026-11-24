import type { PetPlaceSchedule } from "../types";

export const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;

/** Day names (English, Spanish or JS number) as they come from Google or the owner → 0 = Monday. */
const DAY_INDEX: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
  lunes: 0,
  martes: 1,
  miercoles: 2,
  jueves: 3,
  viernes: 4,
  sabado: 5,
  domingo: 6,
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
  "6": 5,
  "0": 6,
};

function dayIndex(day: string): number {
  const key = String(day)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  return DAY_INDEX[key] ?? -1;
}

function formatTime(value: string | number | null | undefined): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;
  if (/^\d{1,2}$/.test(text)) return `${text}:00`;
  return text;
}

export type WeekRow = {
  index: number;
  label: string;
  /** «9:00–20:00», several ranges joined; `null` when the day has no hours registered. */
  hours: string | null;
  isToday: boolean;
};

/** Monday-first index of today, in the visitor's clock. */
export function todayIndex(now = new Date()): number {
  return (now.getDay() + 6) % 7;
}

/** The seven days in order, each with its hours (several ranges in a day are joined). */
export function weekRows(schedules: PetPlaceSchedule[], now = new Date()): WeekRow[] {
  const today = todayIndex(now);
  const ranges = new Map<number, string[]>();
  for (const schedule of schedules) {
    const index = dayIndex(schedule.day);
    if (index < 0) continue;
    const start = formatTime(schedule.timeIni);
    const end = formatTime(schedule.timeEnd);
    if (!start && !end) continue;
    const list = ranges.get(index) ?? [];
    list.push(`${start ?? "—"}–${end ?? "—"}`);
    ranges.set(index, list);
  }
  return WEEKDAYS.map((label, index) => ({
    index,
    label,
    hours: ranges.get(index)?.join(", ") ?? null,
    isToday: index === today,
  }));
}

/** Today's hours, or `null` when there are none. */
export function todayHours(schedules: PetPlaceSchedule[], now = new Date()): string | null {
  return weekRows(schedules, now).find((row) => row.isToday)?.hours ?? null;
}
