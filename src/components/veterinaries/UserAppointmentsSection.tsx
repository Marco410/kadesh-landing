"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar02Icon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import {
  APPOINTMENT_STATUS_BADGE,
  appointmentStatusLabel,
  canCancelAppointment,
  formatAppointmentRange,
  graphqlErrorMessage,
  isAppointmentStatus,
} from "./appointments";
import { veterinaryDetailHref } from "./petPlaceSlug";
import {
  CANCEL_PET_PLACE_APPOINTMENT_MUTATION,
  GET_MY_APPOINTMENTS_QUERY,
  type CancelPetPlaceAppointmentResponse,
  type CancelPetPlaceAppointmentVariables,
  type GetMyAppointmentsResponse,
  type MyAppointment,
} from "./queries";

function CancelAppointmentModal({
  appointment,
  reason,
  error,
  loading,
  onReasonChange,
  onClose,
  onConfirm,
}: {
  appointment: MyAppointment;
  reason: string;
  error: string | null;
  loading: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const placeName = appointment.pet_place?.name || "el negocio";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={loading ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-appointment-title"
        className="w-full max-w-lg rounded-2xl border border-[#e0e0e0] bg-white p-5 shadow-2xl dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h3
          id="cancel-appointment-title"
          className="text-xl font-bold text-[#212121] dark:text-white"
        >
          ¿Cancelar esta cita?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
          Se cancelará la cita en {placeName}. El negocio recibirá el aviso.
        </p>
        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium text-[#212121] dark:text-white">
            Motivo (opcional)
          </span>
          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            rows={3}
            disabled={loading}
            placeholder="Si quieres, di por qué cancelas"
            className="w-full min-h-[5.5rem] rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh disabled:opacity-60 dark:border-white/18 dark:bg-night dark:text-white"
          />
        </label>
        {error ? (
          <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-500 px-4 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Cancelando…" : "Sí, cancelar"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-[#e0e0e0] px-4 text-sm font-semibold text-[#212121] hover:bg-[#f5f5f5] disabled:opacity-60 dark:border-[#3a3a3a] dark:text-white dark:hover:bg-[#2a2a2a]"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserAppointmentsSection() {
  const { data, loading, error: loadError, refetch } = useQuery<GetMyAppointmentsResponse>(
    GET_MY_APPOINTMENTS_QUERY,
    { fetchPolicy: "cache-and-network" },
  );
  const [cancelAppointment, { loading: cancelling }] = useMutation<
    CancelPetPlaceAppointmentResponse,
    CancelPetPlaceAppointmentVariables
  >(CANCEL_PET_PLACE_APPOINTMENT_MUTATION);

  const [target, setTarget] = useState<MyAppointment | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const appointments = data?.authenticatedItem?.my_appointments ?? [];

  const closeCancel = () => {
    if (cancelling) return;
    setTarget(null);
    setReason("");
    setError(null);
  };

  useEffect(() => {
    if (!target) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [target, cancelling]);

  const handleCancel = async () => {
    if (!target) return;
    setError(null);
    const trimmed = reason.trim();
    try {
      await cancelAppointment({
        variables: {
          id: target.id,
          data: {
            status: "cancelled",
            ...(trimmed ? { cancelReason: trimmed } : {}),
          },
        },
      });
      await refetch();
      setTarget(null);
      setReason("");
    } catch (err) {
      setError(graphqlErrorMessage(err, "No se pudo cancelar la cita."));
    }
  };

  if (loadError) {
    return (
      <div className="rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised">
        <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
          No se pudieron cargar tus citas. Intenta de nuevo más tarde.
        </p>
      </div>
    );
  }

  if (loading && appointments.length === 0) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-2xl bg-[#e6e9ef] dark:bg-white/10"
          />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised">
        <p className="font-semibold text-[#121212] dark:text-[#eef1f6]">
          Aún no tienes citas
        </p>
        <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
          Reserva en la ficha de una veterinaria, refugio, hotel o groomer. La
          solicitud queda pendiente hasta que el negocio la confirme.
        </p>
        <Link
          href={Routes.veterinaries.index}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
        >
          <HugeiconsIcon
            icon={Calendar02Icon}
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          Ver directorio
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-2">
        {appointments.map((appointment) => {
          const status = appointment.status ?? "";
          const badgeClass = isAppointmentStatus(status)
            ? APPOINTMENT_STATUS_BADGE[status]
            : "bg-[#ececec] text-[#5a5a5a] dark:bg-white/10 dark:text-[#b0b0b0]";
          const place = appointment.pet_place;
          const petLine = [appointment.petName, appointment.petSpecies]
            .filter(Boolean)
            .join(" · ");

          return (
            <li
              key={appointment.id}
              className="rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {place ? (
                      <Link
                        href={veterinaryDetailHref(place)}
                        className="min-w-0 break-words font-semibold text-[#121212] hover:text-kadesh dark:text-[#eef1f6]"
                      >
                        {place.name || "Negocio"}
                      </Link>
                    ) : (
                      <p className="font-semibold text-[#121212] dark:text-[#eef1f6]">
                        Negocio
                      </p>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeClass}`}
                    >
                      {appointmentStatusLabel(status)}
                    </span>
                  </div>
                  <p className="mt-1 break-words text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
                    {formatAppointmentRange(
                      appointment.startsAt,
                      appointment.endsAt,
                    )}
                  </p>
                  {petLine ? (
                    <p className="mt-0.5 break-words text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
                      {petLine}
                    </p>
                  ) : null}
                </div>
                {canCancelAppointment(status) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setReason("");
                      setTarget(appointment);
                    }}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-[#d8dee8] px-4 text-sm font-semibold text-[#3a3a3a] hover:border-red-300 hover:text-red-700 dark:border-white/18 dark:text-[#e8edf4] dark:hover:border-red-400/40 dark:hover:text-red-300"
                  >
                    Cancelar
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {target ? (
        <CancelAppointmentModal
          appointment={target}
          reason={reason}
          error={error}
          loading={cancelling}
          onReasonChange={setReason}
          onClose={closeCancel}
          onConfirm={handleCancel}
        />
      ) : null}
    </div>
  );
}
