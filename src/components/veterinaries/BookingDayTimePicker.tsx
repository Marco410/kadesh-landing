"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar02Icon,
} from "@hugeicons/core-free-icons";
import {
  nextHourDate,
  pad2,
  toDateInputValue,
  toDateTimeLocalValue,
} from "./appointments";

const WEEKDAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const CALENDAR_WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
const STRIP_DAYS = 7;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseDateInput(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dayChipLabel(date: Date, today: Date): string {
  if (isSameDay(date, today)) return "Hoy";
  if (isSameDay(date, addDays(today, 1))) return "Mañana";
  return WEEKDAY_SHORT[date.getDay()];
}

function monthLabel(date: Date): string {
  const label = date.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function mondayIndex(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

function monthCells(view: Date): Array<Date | null> {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const leading = mondayIndex(first.getDay());
  const total = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < leading; i += 1) cells.push(null);
  for (let day = 1; day <= total; day += 1) {
    cells.push(new Date(view.getFullYear(), view.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const CHIP_CLASS =
  "flex min-h-11 min-w-[4.5rem] flex-1 flex-col items-center justify-center rounded-xl border px-2 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh";

interface BookingDayTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function BookingDayTimePicker({
  value,
  onChange,
}: BookingDayTimePickerProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const minDate = toDateInputValue(today);
  const selected = value ? dateTimeLocalToParts(value) : null;
  const selectedDate = selected ? parseDateInput(selected.date) : today;
  const time =
    selected?.time ?? toDateTimeLocalValue(nextHourDate()).slice(11, 16);

  const strip = useMemo(
    () =>
      Array.from({ length: STRIP_DAYS }, (_, index) => addDays(today, index)),
    [today],
  );
  const selectedInStrip = strip.some((day) => isSameDay(day, selectedDate));

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!calendarOpen) return;
    const focus = selected?.date ? parseDateInput(selected.date) : today;
    setViewMonth(new Date(focus.getFullYear(), focus.getMonth(), 1));
    calendarRef.current?.scrollIntoView({ block: "nearest" });
  }, [calendarOpen, selected?.date, today]);

  const setDate = (nextDate: string) => {
    let nextTime = time;
    if (nextDate === minDate) {
      const soonest = toDateTimeLocalValue(nextHourDate()).slice(11, 16);
      if (nextTime < soonest) nextTime = soonest;
    }
    onChange(`${nextDate}T${nextTime}`);
    setCalendarOpen(false);
  };

  const setTime = (nextTime: string) => {
    const date = selected?.date ?? minDate;
    onChange(`${date}T${nextTime}`);
  };

  const canGoPrevMonth =
    viewMonth.getFullYear() > today.getFullYear() ||
    (viewMonth.getFullYear() === today.getFullYear() &&
      viewMonth.getMonth() > today.getMonth());

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-sm font-medium text-[#121212] dark:text-white">
          Día <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {strip.map((day) => {
            const key = toDateInputValue(day);
            const selectedDay = isSameDay(day, selectedDate);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selectedDay}
                onClick={() => setDate(key)}
                className={`${CHIP_CLASS} ${
                  selectedDay
                    ? "border-kadesh bg-kadesh text-white"
                    : "border-[#d8dee8] text-[#3a3a3a] hover:border-kadesh/50 hover:bg-kadesh-50 dark:border-white/18 dark:text-[#e8edf4] dark:hover:bg-kadesh/15"
                }`}
              >
                <span className="text-[11px] font-semibold leading-none">
                  {dayChipLabel(day, today)}
                </span>
                <span className="mt-1 text-sm font-bold tabular-nums leading-none">
                  {day.getDate()}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            aria-expanded={calendarOpen}
            aria-controls="booking-calendar"
            onClick={() => setCalendarOpen((open) => !open)}
            className={`${CHIP_CLASS} ${
              calendarOpen || !selectedInStrip
                ? "border-kadesh bg-kadesh text-white"
                : "border-[#d8dee8] text-kadesh hover:border-kadesh/50 hover:bg-kadesh-50 dark:border-white/18 dark:hover:bg-kadesh/15"
            }`}
          >
            <HugeiconsIcon
              icon={Calendar02Icon}
              size={16}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span className="mt-1 text-[11px] font-semibold leading-none">
              {selectedInStrip
                ? calendarOpen
                  ? "Cerrar"
                  : "Otra"
                : selectedDate.toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                  })}
            </span>
          </button>
        </div>

        {calendarOpen ? (
          <div
            ref={calendarRef}
            id="booking-calendar"
            className="mt-3 rounded-2xl border border-[#ececec] p-3 dark:border-white/10"
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() =>
                  setViewMonth(
                    new Date(
                      viewMonth.getFullYear(),
                      viewMonth.getMonth() - 1,
                      1,
                    ),
                  )
                }
                disabled={!canGoPrevMonth}
                aria-label="Mes anterior"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-[#3a3a3a] hover:bg-kadesh-50 disabled:opacity-30 dark:text-[#e8edf4] dark:hover:bg-kadesh/15"
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  size={18}
                  strokeWidth={1.5}
                />
              </button>
              <p className="min-w-0 text-center text-sm font-semibold text-[#121212] dark:text-white">
                {monthLabel(viewMonth)}
              </p>
              <button
                type="button"
                onClick={() =>
                  setViewMonth(
                    new Date(
                      viewMonth.getFullYear(),
                      viewMonth.getMonth() + 1,
                      1,
                    ),
                  )
                }
                aria-label="Mes siguiente"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-[#3a3a3a] hover:bg-kadesh-50 dark:text-[#e8edf4] dark:hover:bg-kadesh/15"
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={18}
                  strokeWidth={1.5}
                />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {CALENDAR_WEEKDAYS.map((label) => (
                <span
                  key={label}
                  className="py-1 text-center text-[11px] font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]"
                >
                  {label}
                </span>
              ))}
              {monthCells(viewMonth).map((day, index) => {
                if (!day) {
                  return <span key={`empty-${index}`} className="min-h-11" />;
                }
                const key = toDateInputValue(day);
                const isPast = day.getTime() < today.getTime();
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, today);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isPast}
                    aria-pressed={isSelected}
                    onClick={() => setDate(key)}
                    className={`min-h-11 rounded-xl text-sm font-semibold tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh disabled:cursor-not-allowed disabled:opacity-30 ${
                      isSelected
                        ? "bg-kadesh text-white"
                        : isToday
                          ? "text-kadesh ring-1 ring-kadesh/40"
                          : "text-[#121212] hover:bg-kadesh-50 dark:text-white dark:hover:bg-kadesh/15"
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-[#121212] dark:text-white">
          Hora <span className="text-red-500">*</span>
        </span>
        <input
          type="time"
          required
          step={300}
          min={
            selected?.date === minDate
              ? toDateTimeLocalValue(nextHourDate()).slice(11, 16)
              : undefined
          }
          value={time}
          onChange={(event) => setTime(event.target.value)}
          className="w-full min-h-11 rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-base tabular-nums text-[#121212] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-white"
        />
      </label>
    </div>
  );
}

function dateTimeLocalToParts(value: string): { date: string; time: string } {
  const [date, time = "00:00"] = value.split("T");
  const hhmm = time.slice(0, 5);
  return { date, time: hhmm.length === 5 ? hhmm : `${pad2(0)}:${pad2(0)}` };
}
