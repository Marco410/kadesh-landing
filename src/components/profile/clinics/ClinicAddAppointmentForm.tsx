"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import {
  DEFAULT_SLOT_MINUTES,
  SLOT_DURATION_OPTIONS,
  addMinutes,
  dateAndHourToDate,
  formatTimeOnly,
} from "kadesh/components/veterinaries/appointments";
import { PET_PLACE_HOUR_OPTIONS } from "kadesh/components/veterinaries/constants";
import type { ClinicPatient } from "kadesh/components/veterinaries/queries";
import { CHIP_CLASS, INPUT_CLASS, chipTone } from "./formStyles";

const FIELD_LABEL =
  "mb-1.5 text-sm font-medium text-[#121212] dark:text-white";

const WEEKDAY_FROM_JS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

const FALLBACK_HOUR_START = 8;
const FALLBACK_HOUR_END = 20;

function parseHour(
  value: number | string | null | undefined,
  fallback: number,
): number {
  if (typeof value === "string" && value.includes(":")) {
    return parseHour(value.split(":")[0], fallback);
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(23, Math.max(0, Math.trunc(numeric)));
}

function patientLabel(patient: ClinicPatient): string {
  return [patient.name, patient.lastName].filter(Boolean).join(" ") || "Paciente";
}

function hoursForDate(
  dateKey: string,
  schedules:
    | Array<{
        day: string;
        timeIni: number | string | null;
        timeEnd: number | string | null;
      }>
    | null
    | undefined,
): number[] {
  const date = new Date(`${dateKey}T12:00:00`);
  const weekday = WEEKDAY_FROM_JS[date.getDay()];
  const schedule = (schedules ?? []).find((row) => row.day === weekday);
  const start = schedule
    ? parseHour(schedule.timeIni, FALLBACK_HOUR_START)
    : FALLBACK_HOUR_START;
  const end = schedule
    ? parseHour(schedule.timeEnd, FALLBACK_HOUR_END)
    : FALLBACK_HOUR_END;
  const from = Math.min(start, end);
  const to = Math.max(start, end);
  return PET_PLACE_HOUR_OPTIONS.filter(
    (option) => option.value >= from && option.value <= to,
  ).map((option) => option.value);
}

export default function ClinicAddAppointmentForm({
  dateKey,
  patients,
  schedules,
  initialHour,
  creating,
  error,
  onSubmit,
}: {
  dateKey: string;
  patients: ClinicPatient[];
  schedules:
    | Array<{
        day: string;
        timeIni: number | string | null;
        timeEnd: number | string | null;
      }>
    | null
    | undefined;
  initialHour: number;
  creating: boolean;
  error: string | null;
  onSubmit: (input: {
    patientId: string;
    hour: number;
    duration: number;
    petName: string;
    notes: string;
  }) => Promise<void>;
}) {
  const hours = useMemo(
    () => hoursForDate(dateKey, schedules),
    [dateKey, schedules],
  );
  const todayKey = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }, []);
  const minHour = dateKey === todayKey ? new Date().getHours() + 1 : 0;
  const availableHours = hours.filter((hour) => hour >= minHour);

  const [patientId, setPatientId] = useState(
    () => (patients.length === 1 ? patients[0].id : ""),
  );
  const [hour, setHour] = useState(() => {
    if (availableHours.includes(initialHour)) return initialHour;
    return availableHours[0] ?? hours[0] ?? initialHour;
  });
  const [duration, setDuration] = useState(DEFAULT_SLOT_MINUTES);
  const [petName, setPetName] = useState("");
  const [notes, setNotes] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [patientError, setPatientError] = useState<string | null>(null);

  const visiblePatients = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return patients;
    return patients.filter((patient) =>
      patientLabel(patient).toLowerCase().includes(needle),
    );
  }, [patients, query]);

  const selectedPatient = patients.find((patient) => patient.id === patientId);
  const startsAt = dateAndHourToDate(dateKey, hour);
  const endsAt = addMinutes(startsAt, duration);
  const showSearch = patients.length > 6;
  const hasDetails = Boolean(petName.trim() || notes.trim());

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!patientId) {
      setPatientError("Elige un paciente.");
      return;
    }
    setPatientError(null);
    await onSubmit({
      patientId,
      hour,
      duration,
      petName,
      notes,
    });
  };

  if (patients.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-[#5a5a5a] dark:text-[#9aa3b2]">
        Primero da de alta un paciente abajo. Con el correo podemos avisarle de
        la cita.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p
          role="alert"
          tabIndex={-1}
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}

      <fieldset>
        <legend className={FIELD_LABEL}>Paciente</legend>
        {showSearch ? (
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar paciente"
            className={`${INPUT_CLASS} mb-2`}
          />
        ) : null}
        <div
          role="radiogroup"
          aria-label="Paciente"
          aria-describedby={patientError ? "clinic-appt-patient-error" : undefined}
          className="flex flex-wrap gap-1.5"
        >
          {visiblePatients.length === 0 ? (
            <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
              Nadie coincide.
            </p>
          ) : (
            visiblePatients.map((patient) => {
              const selected = patient.id === patientId;
              return (
                <button
                  key={patient.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setPatientId(patient.id);
                    setPatientError(null);
                  }}
                  className={`${CHIP_CLASS} max-w-full break-words ${chipTone(selected)}`}
                >
                  {patientLabel(patient)}
                </button>
              );
            })
          )}
        </div>
        {patientError ? (
          <p
            id="clinic-appt-patient-error"
            role="alert"
            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
          >
            {patientError}
          </p>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className={FIELD_LABEL}>Hora</legend>
        {availableHours.length === 0 ? (
          <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            Ya no hay horas libres hoy. Elige otro día.
          </p>
        ) : (
          <div
            role="radiogroup"
            aria-label="Hora"
            className="flex flex-wrap gap-1.5"
          >
            {availableHours.map((option) => {
              const selected = option === hour;
              const label = PET_PLACE_HOUR_OPTIONS.find(
                (item) => item.value === option,
              )?.label;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setHour(option)}
                  className={`${CHIP_CLASS} min-w-14 tabular-nums ${chipTone(selected)}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className={FIELD_LABEL}>Duración</legend>
        <div
          role="radiogroup"
          aria-label="Duración"
          className="flex flex-wrap gap-1.5"
        >
          {SLOT_DURATION_OPTIONS.map((option) => {
            const selected = option.minutes === duration;
            return (
              <button
                key={option.minutes}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setDuration(option.minutes)}
                className={`${CHIP_CLASS} ${chipTone(selected)}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
          {selectedPatient ? `${patientLabel(selectedPatient)} · ` : null}
          {formatTimeOnly(startsAt.toISOString())}–
          {formatTimeOnly(endsAt.toISOString())}
        </p>
      </fieldset>

      <div>
        <button
          type="button"
          aria-expanded={detailsOpen}
          onClick={() => setDetailsOpen((open) => !open)}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-kadesh hover:underline"
        >
          {detailsOpen ? "Ocultar mascota y notas" : "Mascota y notas"}
          <HugeiconsIcon
            icon={detailsOpen ? ArrowUp01Icon : ArrowDown01Icon}
            size={16}
            strokeWidth={1.5}
            aria-hidden
          />
        </button>
        {detailsOpen ? (
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className={FIELD_LABEL}>Mascota</span>
              <input
                value={petName}
                onChange={(event) => setPetName(event.target.value)}
                className={INPUT_CLASS}
              />
            </label>
            <label className="block">
              <span className={FIELD_LABEL}>Notas</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                className={INPUT_CLASS}
              />
            </label>
          </div>
        ) : hasDetails ? (
          <p className="mt-1 break-words text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            {[petName.trim(), notes.trim()].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={creating || availableHours.length === 0}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:opacity-60 lg:w-auto"
      >
        {creating ? "Agendando…" : "Agendar"}
      </button>
    </form>
  );
}
