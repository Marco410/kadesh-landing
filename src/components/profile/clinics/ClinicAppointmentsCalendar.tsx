"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "@apollo/client";
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_BADGE,
  addMinutes,
  appointmentStatusLabel,
  dateAndHourToDate,
  formatAppointmentRange,
  graphqlErrorMessage,
  isAppointmentStatus,
  ownerAppointmentActions,
  pad2,
  type AppointmentStatus,
} from "kadesh/components/veterinaries/appointments";
import {
  CREATE_CLINIC_APPOINTMENT_MUTATION,
  GET_CLINIC_APPOINTMENTS_QUERY,
  UPDATE_PET_PLACE_APPOINTMENT_MUTATION,
  type ClinicAppointment,
  type CreateClinicAppointmentResponse,
  type CreateClinicAppointmentVariables,
  type GetClinicAppointmentsResponse,
  type GetClinicAppointmentsVariables,
  type MyPetPlace,
  type UpdatePetPlaceAppointmentResponse,
  type UpdatePetPlaceAppointmentVariables,
} from "kadesh/components/veterinaries/queries";
import ClinicAddAppointmentForm from "./ClinicAddAppointmentForm";
import ClinicPatientsList from "./ClinicPatientsList";
import { useProfileMotion } from "kadesh/components/profile/motion";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function monthBounds(month: Date): { start: Date; next: Date } {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  return { start, next };
}

function appointmentDateKeys(appointment: ClinicAppointment): string[] {
  const start = new Date(appointment.startsAt);
  const end = new Date(appointment.endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  const keys: string[] = [];
  const cursor = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor <= last) {
    keys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

function customerName(appointment: ClinicAppointment): string {
  const name = [appointment.customer?.name, appointment.customer?.lastName]
    .filter(Boolean)
    .join(" ");
  return name || "Cliente";
}

function defaultHourForDate(dateKey: string): number {
  const todayKey = toDateKey(new Date());
  if (dateKey === todayKey) {
    return Math.min(23, new Date().getHours() + 1);
  }
  return 10;
}

const ACTION_CLASS: Record<"primary" | "danger" | "neutral", string> = {
  primary: "bg-kadesh text-white hover:bg-kadesh-600",
  danger:
    "border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-400/40 dark:text-red-300 dark:hover:bg-red-500/10",
  neutral:
    "border border-[#d8dee8] text-[#3a3a3a] hover:bg-[#f3f5f8] dark:border-white/18 dark:text-[#e8edf4] dark:hover:bg-white/10",
};

export default function ClinicAppointmentsCalendar({
  place,
  onSaved,
}: {
  place: MyPetPlace;
  onSaved: () => void;
}) {
  const todayKey = toDateKey(new Date());
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(
    todayKey,
  );
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ClinicAppointment | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [created, setCreated] = useState(false);
  const motionPrefs = useProfileMotion();

  const { start, next } = monthBounds(currentMonth);
  const patients = place.patients ?? [];

  const { data, loading, refetch } = useQuery<
    GetClinicAppointmentsResponse,
    GetClinicAppointmentsVariables
  >(GET_CLINIC_APPOINTMENTS_QUERY, {
    variables: {
      where: {
        AND: [
          { pet_place: { id: { equals: place.id } } },
          { startsAt: { lt: next.toISOString() } },
          { endsAt: { gte: start.toISOString() } },
        ],
      },
      orderBy: [{ startsAt: "asc" }],
    },
    fetchPolicy: "cache-and-network",
  });

  const [updateAppointment, { loading: saving }] = useMutation<
    UpdatePetPlaceAppointmentResponse,
    UpdatePetPlaceAppointmentVariables
  >(UPDATE_PET_PLACE_APPOINTMENT_MUTATION);

  const [createAppointment, { loading: creating }] = useMutation<
    CreateClinicAppointmentResponse,
    CreateClinicAppointmentVariables
  >(CREATE_CLINIC_APPOINTMENT_MUTATION);

  const appointments = data?.petPlaceAppointments ?? [];

  const byDate = useMemo(() => {
    const map = new Map<string, ClinicAppointment[]>();
    for (const appointment of appointments) {
      for (const key of appointmentDateKeys(appointment)) {
        const list = map.get(key) ?? [];
        list.push(appointment);
        map.set(key, list);
      }
    }
    return map;
  }, [appointments]);

  const calendarGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ day: number | null; dateKey: string | null }> = [];
    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push({ day: null, dateKey: null });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        day,
        dateKey: `${year}-${pad2(month + 1)}-${pad2(day)}`,
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, dateKey: null });
    }
    return cells;
  }, [currentMonth]);

  const selectedAppointments = selectedDateKey
    ? (byDate.get(selectedDateKey) ?? [])
    : [];
  const canAddOnSelected =
    selectedDateKey !== null && selectedDateKey >= todayKey;

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateKey(todayKey);
    setOpenedId(null);
    setAdding(false);
  };

  const selectDay = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    setOpenedId(null);
    setAdding(false);
    setCreated(false);
  };

  const applyStatus = async (
    appointment: ClinicAppointment,
    status: AppointmentStatus,
    reason?: string,
  ) => {
    setError(null);
    try {
      await updateAppointment({
        variables: {
          id: appointment.id,
          data: {
            status,
            ...(status === APPOINTMENT_STATUS.CANCELLED && reason
              ? { cancelReason: reason }
              : {}),
          },
        },
      });
      await refetch();
      setCancelTarget(null);
      setCancelReason("");
    } catch (err) {
      setError(graphqlErrorMessage(err, "No se pudo actualizar la cita."));
    }
  };

  const handleAction = (
    appointment: ClinicAppointment,
    status: AppointmentStatus,
  ) => {
    if (status === APPOINTMENT_STATUS.CANCELLED) {
      setCancelReason("");
      setCancelTarget(appointment);
      return;
    }
    void applyStatus(appointment, status);
  };

  const handleCreate = async (input: {
    patientId: string;
    hour: number;
    duration: number;
    petName: string;
    notes: string;
  }) => {
    if (!selectedDateKey) return;
    setError(null);
    setCreated(false);
    const startsAt = dateAndHourToDate(selectedDateKey, input.hour);
    const endsAt = addMinutes(startsAt, input.duration);
    try {
      const { data: resultData } = await createAppointment({
        variables: {
          input: {
            petPlaceId: place.id,
            customerId: input.patientId,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
            petName: input.petName.trim() || undefined,
            notes: input.notes.trim() || undefined,
          },
        },
      });
      const result = resultData?.createClinicAppointment;
      if (!result?.success) {
        setError(result?.message ?? "No pudimos agendar la cita.");
        return;
      }
      setAdding(false);
      setCreated(true);
      await refetch();
    } catch (err) {
      setError(graphqlErrorMessage(err, "No pudimos agendar la cita."));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-2 lg:flex-1">
          <button
            type="button"
            onClick={() => {
              setCurrentMonth(
                (date) => new Date(date.getFullYear(), date.getMonth() - 1, 1),
              );
              setSelectedDateKey(null);
              setOpenedId(null);
              setAdding(false);
            }}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[#d8dee8] text-[#121212] dark:border-white/18 dark:text-white"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <p className="text-center text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </p>
          <button
            type="button"
            onClick={() => {
              setCurrentMonth(
                (date) => new Date(date.getFullYear(), date.getMonth() + 1, 1),
              );
              setSelectedDateKey(null);
              setOpenedId(null);
              setAdding(false);
            }}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[#d8dee8] text-[#121212] dark:border-white/18 dark:text-white"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>
        <button
          type="button"
          onClick={goToToday}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-kadesh px-3 text-sm font-semibold text-kadesh hover:bg-kadesh hover:text-white"
        >
          Ir a hoy
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-[11px] font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]"
          >
            {label}
          </div>
        ))}
        {calendarGrid.map((cell, index) => {
          const count = cell.dateKey
            ? (byDate.get(cell.dateKey)?.length ?? 0)
            : 0;
          const selected = cell.dateKey === selectedDateKey;
          const isToday = cell.dateKey === todayKey;
          return (
            <motion.button
              key={index}
              type="button"
              disabled={!cell.dateKey}
              onClick={() => {
                if (!cell.dateKey) return;
                selectDay(cell.dateKey);
              }}
              whileTap={cell.dateKey ? motionPrefs.tapDay : undefined}
              className={`flex min-h-11 flex-col items-center justify-center rounded-lg text-sm ${
                !cell.dateKey
                  ? "opacity-0"
                  : selected && isToday
                    ? "bg-kadesh font-bold text-white ring-2 ring-amber-400 ring-offset-1 ring-offset-white dark:ring-offset-night-raised"
                    : selected
                      ? "bg-kadesh text-white"
                      : isToday
                        ? "border-2 border-amber-400 bg-amber-50 font-bold text-amber-900 dark:border-amber-300 dark:bg-amber-500/15 dark:text-amber-100"
                        : "bg-[#f3f5f8] text-[#121212] hover:bg-kadesh-50 dark:bg-night dark:text-[#eef1f6] dark:hover:bg-kadesh/20"
              }`}
            >
              {cell.day}
              {count > 0 ? (
                <span
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                    selected
                      ? "bg-white"
                      : isToday
                        ? "bg-amber-600"
                        : "bg-kadesh"
                  }`}
                />
              ) : null}
            </motion.button>
          );
        })}
      </div>

      <div className="rounded-xl border border-[#ececec] p-3 dark:border-white/10">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h4
              className={`text-sm font-bold text-[#121212] dark:text-[#eef1f6] ${
                adding ? "" : "capitalize"
              }`}
            >
              {adding
                ? "Nueva cita"
                : selectedDateKey
                  ? new Date(`${selectedDateKey}T12:00:00`).toLocaleDateString(
                      "es-MX",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      },
                    )
                  : "Elige un día"}
            </h4>
            {adding && selectedDateKey ? (
              <p className="mt-0.5 text-sm capitalize text-[#5a5a5a] dark:text-[#9aa3b2]">
                {new Date(`${selectedDateKey}T12:00:00`).toLocaleDateString(
                  "es-MX",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  },
                )}
              </p>
            ) : null}
          </div>
          {canAddOnSelected ? (
            <motion.button
              type="button"
              onClick={() => {
                setAdding((value) => !value);
                setError(null);
                setCreated(false);
              }}
              whileTap={motionPrefs.tap}
              className={
                adding
                  ? "inline-flex min-h-11 items-center justify-center self-start px-2 text-sm font-semibold text-[#5a5a5a] hover:text-[#121212] dark:text-[#9aa3b2] dark:hover:text-white"
                  : "inline-flex min-h-11 items-center justify-center self-start rounded-xl bg-kadesh px-3 text-sm font-semibold text-white hover:bg-kadesh-600"
              }
            >
              {adding ? "Cerrar" : "Agregar cita"}
            </motion.button>
          ) : null}
        </div>

        <AnimatePresence initial={false}>
          {adding && selectedDateKey ? (
            <motion.div
              key="add-appointment"
              variants={motionPrefs.expand}
              initial={motionPrefs.reduce ? false : "hidden"}
              animate="show"
              exit="exit"
              className="mt-3 overflow-hidden border-t border-[#ececec] pt-4 dark:border-white/10"
            >
              <ClinicAddAppointmentForm
                dateKey={selectedDateKey}
                patients={patients}
                schedules={place.pet_place_schedules}
                initialHour={defaultHourForDate(selectedDateKey)}
                creating={creating}
                error={error}
                onSubmit={handleCreate}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {created ? (
          <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-400">
            Cita agendada.
          </p>
        ) : null}

        {loading && appointments.length === 0 ? (
          <p className="mt-2 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            Cargando citas…
          </p>
        ) : selectedAppointments.length === 0 && !adding ? (
          <p className="mt-2 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            Sin citas este día.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {selectedAppointments.map((appointment) => {
              const status = appointment.status ?? "";
              const badgeClass = isAppointmentStatus(status)
                ? APPOINTMENT_STATUS_BADGE[status]
                : "bg-[#ececec] text-[#5a5a5a] dark:bg-white/10 dark:text-[#b0b0b0]";
              const expanded = openedId === appointment.id;
              return (
                <li
                  key={appointment.id}
                  className="rounded-xl border border-[#ececec] bg-white p-3 dark:border-white/10 dark:bg-night"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenedId(expanded ? null : appointment.id)
                    }
                    className="flex w-full flex-col items-start gap-1 text-left"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#121212] dark:text-[#eef1f6]">
                        {customerName(appointment)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeClass}`}
                      >
                        {appointmentStatusLabel(status)}
                      </span>
                    </span>
                    <span className="text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
                      {formatAppointmentRange(
                        appointment.startsAt,
                        appointment.endsAt,
                      )}
                    </span>
                  </button>
                  {expanded ? (
                    <AppointmentDetail
                      appointment={appointment}
                      saving={saving}
                      error={error}
                      onAction={handleAction}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && !cancelTarget && !adding ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <ClinicPatientsList place={place} onSaved={onSaved} />

      {cancelTarget ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={saving ? undefined : () => setCancelTarget(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clinic-cancel-title"
            className="w-full max-w-lg rounded-2xl border border-[#e0e0e0] bg-white p-5 shadow-2xl dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
            onClick={(event) => event.stopPropagation()}
          >
            <h3
              id="clinic-cancel-title"
              className="text-xl font-bold text-[#212121] dark:text-white"
            >
              ¿Cancelar esta cita?
            </h3>
            <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
              Se avisará a {customerName(cancelTarget)}.
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium text-[#212121] dark:text-white">
                Motivo (opcional)
              </span>
              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                rows={3}
                disabled={saving}
                className="w-full min-h-[5.5rem] rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm dark:border-white/18 dark:bg-night dark:text-white"
              />
            </label>
            {error ? (
              <p
                role="alert"
                className="mt-2 text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </p>
            ) : null}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  void applyStatus(
                    cancelTarget,
                    APPOINTMENT_STATUS.CANCELLED,
                    cancelReason.trim(),
                  )
                }
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-500 px-4 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {saving ? "Cancelando…" : "Sí, cancelar"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => setCancelTarget(null)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-[#e0e0e0] px-4 text-sm font-semibold dark:border-[#3a3a3a] dark:text-white"
              >
                No
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AppointmentDetail({
  appointment,
  saving,
  error,
  onAction,
}: {
  appointment: ClinicAppointment;
  saving: boolean;
  error: string | null;
  onAction: (appointment: ClinicAppointment, status: AppointmentStatus) => void;
}) {
  const petLine = [appointment.petName, appointment.petSpecies]
    .filter(Boolean)
    .join(" · ");
  const actions = ownerAppointmentActions(appointment.status);

  return (
    <div className="mt-3 space-y-2 border-t border-[#ececec] pt-3 text-sm dark:border-white/10">
      {appointment.service?.name ? (
        <p className="text-[#3a3a3a] dark:text-[#d0d0d0]">
          Servicio: {appointment.service.name}
        </p>
      ) : null}
      {petLine ? (
        <p className="text-[#3a3a3a] dark:text-[#d0d0d0]">Mascota: {petLine}</p>
      ) : null}
      {appointment.customer?.phone ? (
        <p className="break-words text-[#3a3a3a] dark:text-[#d0d0d0]">
          Tel. {appointment.customer.phone}
        </p>
      ) : null}
      {appointment.customer?.email ? (
        <p className="break-words text-[#3a3a3a] dark:text-[#d0d0d0]">
          {appointment.customer.email}
        </p>
      ) : null}
      {appointment.notes ? (
        <p className="break-words text-[#3a3a3a] dark:text-[#d0d0d0]">
          Notas: {appointment.notes}
        </p>
      ) : null}
      {appointment.cancelReason ? (
        <p className="break-words text-[#5a5a5a] dark:text-[#9aa3b2]">
          Motivo de cancelación: {appointment.cancelReason}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
      {actions.length > 0 ? (
        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
          {actions.map((action) => (
            <button
              key={action.status}
              type="button"
              disabled={saving}
              onClick={() => onAction(appointment, action.status)}
              className={`inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold disabled:opacity-60 ${ACTION_CLASS[action.tone]}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
