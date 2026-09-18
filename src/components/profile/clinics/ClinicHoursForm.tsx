"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import {
  PET_PLACE_HOUR_OPTIONS,
  PET_PLACE_WEEKDAYS,
} from "kadesh/components/veterinaries/constants";
import {
  UPDATE_MY_PET_PLACE_MUTATION,
  type MyPetPlace,
  type UpdateMyPetPlaceResponse,
  type UpdateMyPetPlaceVariables,
} from "kadesh/components/veterinaries/queries";
import { COMPACT_SELECT_CLASS } from "./formStyles";

type DayRow = {
  open: boolean;
  timeIni: number;
  timeEnd: number;
};

function parseHour(value: number | string | null | undefined, fallback: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(23, Math.max(0, Math.trunc(numeric)));
}

function rowsFromPlace(place: MyPetPlace): Record<string, DayRow> {
  const next: Record<string, DayRow> = {};
  for (const day of PET_PLACE_WEEKDAYS) {
    next[day.value] = { open: false, timeIni: 9, timeEnd: 18 };
  }
  for (const schedule of place.pet_place_schedules ?? []) {
    const day = schedule.day;
    if (!next[day]) continue;
    next[day] = {
      open: true,
      timeIni: parseHour(schedule.timeIni, 9),
      timeEnd: parseHour(schedule.timeEnd, 18),
    };
  }
  return next;
}

export default function ClinicHoursForm({
  place,
  onSaved,
}: {
  place: MyPetPlace;
  onSaved: () => void;
}) {
  const initial = useMemo(() => rowsFromPlace(place), [place]);
  const [days, setDays] = useState<Record<string, DayRow>>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [updatePlace, { loading }] = useMutation<
    UpdateMyPetPlaceResponse,
    UpdateMyPetPlaceVariables
  >(UPDATE_MY_PET_PLACE_MUTATION);

  const setDay = (value: string, patch: Partial<DayRow>) => {
    setDays((current) => ({
      ...current,
      [value]: { ...current[value], ...patch },
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    const schedules = PET_PLACE_WEEKDAYS.flatMap((day) => {
      const row = days[day.value];
      if (!row?.open) return [];
      return [{ day: day.value, timeIni: row.timeIni, timeEnd: row.timeEnd }];
    });

    const invalid = schedules.find((row) => row.timeEnd <= row.timeIni);
    if (invalid) {
      setError(`En ${invalid.day}, la hora de cierre debe ser posterior a la de apertura.`);
      return;
    }

    try {
      const { data } = await updatePlace({
        variables: {
          input: {
            petPlaceId: place.id,
            schedules,
          },
        },
      });
      const result = data?.updateMyPetPlace;
      if (!result?.success) {
        setError(result?.message ?? "No pudimos guardar los horarios.");
        return;
      }
      setSaved(true);
      onSaved();
    } catch {
      setError("No pudimos guardar los horarios. Intenta de nuevo.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <ul className="divide-y divide-[#ececec] overflow-hidden rounded-xl border border-[#ececec] dark:divide-white/10 dark:border-white/10">
        {PET_PLACE_WEEKDAYS.map((day) => {
          const row = days[day.value] ?? { open: false, timeIni: 9, timeEnd: 18 };
          return (
            <li
              key={day.value}
              className="flex flex-wrap items-center gap-2 px-3 py-1.5"
            >
              <label className="flex min-h-11 min-w-[7.5rem] flex-1 items-center gap-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
                <input
                  type="checkbox"
                  checked={row.open}
                  onChange={(event) => setDay(day.value, { open: event.target.checked })}
                  className="h-4 w-4 rounded border-[#d8dee8] text-kadesh focus:ring-kadesh"
                />
                {day.label}
              </label>
              {row.open ? (
                <div className="flex min-w-0 flex-[2] items-center gap-1.5">
                  <select
                    aria-label={`Abre ${day.label}`}
                    className={COMPACT_SELECT_CLASS}
                    value={row.timeIni}
                    onChange={(event) =>
                      setDay(day.value, { timeIni: Number(event.target.value) })
                    }
                  >
                    {PET_PLACE_HOUR_OPTIONS.map((hour) => (
                      <option key={`ini-${hour.value}`} value={hour.value}>
                        {hour.label}
                      </option>
                    ))}
                  </select>
                  <span className="shrink-0 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                    –
                  </span>
                  <select
                    aria-label={`Cierra ${day.label}`}
                    className={COMPACT_SELECT_CLASS}
                    value={row.timeEnd}
                    onChange={(event) =>
                      setDay(day.value, { timeEnd: Number(event.target.value) })
                    }
                  >
                    {PET_PLACE_HOUR_OPTIONS.map((hour) => (
                      <option key={`end-${hour.value}`} value={hour.value}>
                        {hour.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="min-h-11 flex-1 content-center text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                  Cerrado
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          Horarios actualizados.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Guardando…" : "Guardar horarios"}
      </button>
    </form>
  );
}
