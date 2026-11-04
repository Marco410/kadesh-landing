"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar02Icon } from "@hugeicons/core-free-icons";
import {
  DashButton,
  DashModal,
  dashLabelClass,
  dashTextareaClass,
  useLatched,
} from "kadesh/components/app-shell";
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
  appointment: MyAppointment | null;
  reason: string;
  error: string | null;
  loading: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  // Mientras sale, sigue mostrando la cita que tenía (al cerrar `appointment` ya es null).
  const shown = useLatched(appointment);
  const placeName = shown?.pet_place?.name || "el negocio";

  return (
    <DashModal
      open={Boolean(appointment)}
      onClose={onClose}
      busy={loading}
      title="¿Cancelar esta cita?"
      subtitle={`Se cancelará la cita en ${placeName}. El negocio recibirá el aviso.`}
      footer={
        <>
          <DashButton variant="ghost" onClick={onClose} disabled={loading}>
            No
          </DashButton>
          <DashButton variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Cancelando…" : "Sí, cancelar"}
          </DashButton>
        </>
      }
    >
      <label className="block">
        <span className={dashLabelClass}>Motivo (opcional)</span>
        <textarea
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          rows={3}
          disabled={loading}
          placeholder="Si quieres, di por qué cancelas"
          className={dashTextareaClass}
        />
      </label>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </DashModal>
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
      <div className="rounded-3xl border border-dash-line bg-dash-surface p-5 shadow-dash">
        <p className="text-sm text-dash-muted">
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
            className="h-24 dash-shimmer rounded-3xl"
          />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-3xl border border-dash-line bg-dash-surface p-5 shadow-dash">
        <p className="font-semibold text-dash-ink">
          Aún no tienes citas
        </p>
        <p className="text-sm text-dash-muted">
          Reserva en la ficha de una veterinaria, refugio, hotel o groomer. La
          solicitud queda pendiente hasta que el negocio la confirme.
        </p>
        <Link
          href={Routes.veterinaries.index}
          className="inline-flex min-h-11 items-center gap-1.5 px-4 text-sm font-semibold text-white rounded-full dash-grad-accent shadow-dash-accent transition-[transform,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash-accent-lift"
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
            : "bg-dash-surface-3 text-dash-muted";
          const place = appointment.pet_place;
          const petLine = [appointment.petName, appointment.petSpecies]
            .filter(Boolean)
            .join(" · ");

          return (
            <li
              key={appointment.id}
              className="rounded-3xl border border-dash-line bg-dash-surface p-4 shadow-dash"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {place ? (
                      <Link
                        href={veterinaryDetailHref(place)}
                        className="min-w-0 break-words font-semibold text-dash-ink hover:text-kadesh"
                      >
                        {place.name || "Negocio"}
                      </Link>
                    ) : (
                      <p className="font-semibold text-dash-ink">
                        Negocio
                      </p>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeClass}`}
                    >
                      {appointmentStatusLabel(status)}
                    </span>
                  </div>
                  <p className="mt-1 break-words text-sm text-dash-soft">
                    {formatAppointmentRange(
                      appointment.startsAt,
                      appointment.endsAt,
                    )}
                  </p>
                  {petLine ? (
                    <p className="mt-0.5 break-words text-xs text-dash-muted">
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
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-dash-line-strong px-4 text-sm font-semibold text-dash-soft hover:border-red-300 hover:text-red-700 dark:hover:border-red-400/40 dark:hover:text-red-300"
                  >
                    Cancelar
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <CancelAppointmentModal
        appointment={target}
        reason={reason}
        error={error}
        loading={cancelling}
        onReasonChange={setReason}
        onClose={closeCancel}
        onConfirm={handleCancel}
      />
    </div>
  );
}
