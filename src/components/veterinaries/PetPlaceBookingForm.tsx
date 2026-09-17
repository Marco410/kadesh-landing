"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import AnimalNameInput from "kadesh/components/animals/nuevo/AnimalNameInput";
import AnimalTypeSelector from "kadesh/components/animals/nuevo/AnimalTypeSelector";
import AnimalBreedPicker from "kadesh/components/animals/nuevo/AnimalBreedPicker";
import { ANIMAL_TYPE_LABELS } from "kadesh/components/animals/constants";
import { GET_ANIMAL_TYPES_QUERY } from "kadesh/components/animals/queries";
import {
  BOOKING_AUTH_ERROR,
  BOOKING_PAST_ERROR,
  BOOKING_RANGE_ERROR,
  DEFAULT_SLOT_MINUTES,
  SLOT_DURATION_OPTIONS,
  STAY_CHECK_IN_HOUR,
  STAY_CHECK_OUT_HOUR,
  addDaysToDateInput,
  addMinutes,
  appointmentStatusLabel,
  dateAndHourToDate,
  dateTimeLocalToDate,
  defaultStayDates,
  formatTimeOnly,
  getPetPlaceBookingMode,
  graphqlErrorMessage,
  nextHourDate,
  toDateTimeLocalValue,
} from "./appointments";
import BookingDayTimePicker from "./BookingDayTimePicker";
import { veterinaryBookHref } from "./petPlaceSlug";
import {
  CREATE_PET_PLACE_APPOINTMENT_MUTATION,
  GET_MY_APPOINTMENTS_QUERY,
  type CreatePetPlaceAppointmentResponse,
  type CreatePetPlaceAppointmentVariables,
  type CreatedPetPlaceAppointment,
  type PetPlaceAppointmentCreateInput,
} from "./queries";
import type { PetPlaceDetail } from "./types";

const FIELD_CLASS =
  "w-full min-h-11 rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-white dark:placeholder:text-[#9aa3b2]";

const LABEL_CLASS =
  "mb-1 block text-sm font-medium text-[#121212] dark:text-white";

function formatPetSpecies(typeName: string, breedName: string): string {
  const key = typeName.toLowerCase();
  const typeLabel = typeName ? ANIMAL_TYPE_LABELS[key] || typeName : "";
  if (typeLabel && breedName) return `${typeLabel} — ${breedName}`;
  return typeLabel || breedName;
}

interface PetPlaceBookingFormProps {
  place: PetPlaceDetail;
  onClose?: () => void;
}

export default function PetPlaceBookingForm({
  place,
  onClose,
}: PetPlaceBookingFormProps) {
  const { user } = useUser();
  const mode = getPetPlaceBookingMode(place.types);
  const services = (place.services ?? []).filter(
    (service) => service.active !== false && Boolean(service.name?.trim()),
  );

  const initialStart = useMemo(() => nextHourDate(), []);
  const stayDefaults = useMemo(() => defaultStayDates(), []);

  const [startLocal, setStartLocal] = useState(
    toDateTimeLocalValue(initialStart),
  );
  const [durationMin, setDurationMin] = useState(DEFAULT_SLOT_MINUTES);
  const [checkIn, setCheckIn] = useState(stayDefaults.checkIn);
  const [checkOut, setCheckOut] = useState(stayDefaults.checkOut);
  const [serviceId, setServiceId] = useState("");
  const [petName, setPetName] = useState("");
  const [animalTypeId, setAnimalTypeId] = useState("");
  const [animalBreedId, setAnimalBreedId] = useState("");
  const [animalBreedName, setAnimalBreedName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedPetPlaceAppointment | null>(
    null,
  );

  const { data: typesData } = useQuery(GET_ANIMAL_TYPES_QUERY, {
    variables: { orderBy: [{ order: "asc" }] },
    fetchPolicy: "cache-and-network",
  });

  const [createAppointment, { loading }] = useMutation<
    CreatePetPlaceAppointmentResponse,
    CreatePetPlaceAppointmentVariables
  >(CREATE_PET_PLACE_APPOINTMENT_MUTATION);

  const slotStart = dateTimeLocalToDate(startLocal);
  const slotEnd = addMinutes(slotStart, durationMin);
  const stayStart = dateAndHourToDate(checkIn, STAY_CHECK_IN_HOUR);
  const stayEnd = dateAndHourToDate(checkOut, STAY_CHECK_OUT_HOUR);
  const startsAt = mode === "stay" ? stayStart : slotStart;
  const endsAt = mode === "stay" ? stayEnd : slotEnd;

  const loginHref = `${Routes.auth.login}?redirect=${encodeURIComponent(
    veterinaryBookHref(place),
  )}`;

  const selectedTypeName =
    (
      typesData?.animalTypes as Array<{ id: string; name: string }> | undefined
    )?.find((type) => type.id === animalTypeId)?.name ?? "";

  if (!mode) {
    return (
      <div>
        <p className="font-semibold text-[#121212] dark:text-white">
          Este lugar no recibe citas por aquí
        </p>
        <p className="mt-1 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
          Puedes llamar o escribir si aparece el contacto en la ficha.
        </p>
      </div>
    );
  }

  if (created) {
    return (
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-kadesh-50 text-kadesh dark:bg-kadesh/20">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={28}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <h3 className="mt-4 text-xl font-black tracking-[-0.03em] text-[#121212] dark:text-white">
          Cita solicitada
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#5a5a5a] dark:text-[#9aa3b2]">
          Tu solicitud quedó{" "}
          <span className="font-semibold text-[#121212] dark:text-white">
            {appointmentStatusLabel(created.status)}
          </span>
          . El negocio debe confirmarla; todavía no está confirmada. Te
          avisaremos por correo cuando la acepten o la cancelen.
        </p>
        {created.petName ? (
          <p className="mt-3 text-sm text-[#121212] dark:text-white">
            {created.petName}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href={`${Routes.profile}?tab=appointments`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
          >
            Ver mis citas
          </Link>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh hover:bg-kadesh hover:text-white"
            >
              Cerrar
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  const handleCheckInChange = (value: string) => {
    setCheckIn(value);
    if (value && checkOut <= value) {
      setCheckOut(addDaysToDateInput(value, 1));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!user?.id) {
      setError(BOOKING_AUTH_ERROR);
      return;
    }

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      setError(BOOKING_RANGE_ERROR);
      return;
    }

    if (endsAt.getTime() <= startsAt.getTime()) {
      setError(BOOKING_RANGE_ERROR);
      return;
    }

    if (startsAt.getTime() < Date.now()) {
      setError(BOOKING_PAST_ERROR);
      return;
    }

    const data: PetPlaceAppointmentCreateInput = {
      pet_place: { connect: { id: place.id } },
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    };
    const name = petName.trim();
    const species = formatPetSpecies(selectedTypeName, animalBreedName.trim());
    const note = notes.trim();
    if (name) data.petName = name;
    if (species) data.petSpecies = species;
    if (note) data.notes = note;
    if (serviceId) data.service = { connect: { id: serviceId } };

    try {
      const result = await createAppointment({
        variables: { data },
        refetchQueries: [{ query: GET_MY_APPOINTMENTS_QUERY }],
      });
      const appointment = result.data?.createPetPlaceAppointment;
      if (!appointment) {
        setError("No se pudo solicitar la cita. Intenta de nuevo.");
        return;
      }
      setCreated(appointment);
    } catch (err) {
      setError(graphqlErrorMessage(err, "No se pudo solicitar la cita."));
    }
  };

  const isAuthError = error === BOOKING_AUTH_ERROR;

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
        {mode === "stay"
          ? "Elige las fechas de entrada y salida. La estancia queda pendiente hasta que el negocio la confirme."
          : "Elige día y hora. La cita queda pendiente hasta que el negocio la confirme."}
      </p>

      <fieldset className="mt-5 space-y-4">
        <legend className="sr-only">Fecha y horario</legend>

        {mode === "stay" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className={LABEL_CLASS}>
                Entrada <span className="text-red-500">*</span>
              </span>
              <input
                type="date"
                required
                min={toDateTimeLocalValue(new Date()).slice(0, 10)}
                value={checkIn}
                onChange={(event) => handleCheckInChange(event.target.value)}
                className={FIELD_CLASS}
              />
              <span className="mt-1 block text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
                A las {String(STAY_CHECK_IN_HOUR).padStart(2, "0")}:00
              </span>
            </label>
            <label className="block min-w-0">
              <span className={LABEL_CLASS}>
                Salida <span className="text-red-500">*</span>
              </span>
              <input
                type="date"
                required
                min={addDaysToDateInput(checkIn, 1)}
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
                className={FIELD_CLASS}
              />
              <span className="mt-1 block text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
                A las {String(STAY_CHECK_OUT_HOUR).padStart(2, "0")}:00
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <BookingDayTimePicker value={startLocal} onChange={setStartLocal} />
            <div>
              <p className={LABEL_CLASS}>Duración</p>
              <div className="flex flex-wrap gap-2">
                {SLOT_DURATION_OPTIONS.map((option) => {
                  const selected = durationMin === option.minutes;
                  return (
                    <button
                      key={option.minutes}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setDurationMin(option.minutes)}
                      className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
                        selected
                          ? "border-kadesh bg-kadesh text-white"
                          : "border-[#d8dee8] bg-transparent text-[#3a3a3a] hover:border-kadesh/50 hover:bg-kadesh-50 dark:border-white/18 dark:text-[#e8edf4] dark:hover:bg-kadesh/15"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
                Termina a las {formatTimeOnly(slotEnd.toISOString())}
              </p>
            </div>
          </div>
        )}
      </fieldset>

      {services.length > 0 ? (
        <label className="mt-4 block">
          <span className={LABEL_CLASS}>Servicio</span>
          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            className={FIELD_CLASS}
          >
            <option value="">Sin servicio específico</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="mt-5 space-y-5">
        <AnimalTypeSelector
          selectedTypeId={animalTypeId}
          onTypeChange={(typeId) => {
            setAnimalTypeId(typeId);
            setAnimalBreedId("");
            setAnimalBreedName("");
          }}
          required={false}
        />
        <AnimalNameInput value={petName} onChange={setPetName} />
        <AnimalBreedPicker
          id="bookingAnimalBreed"
          animalTypeId={animalTypeId}
          value={animalBreedId}
          onChange={(breedId, breedName) => {
            setAnimalBreedId(breedId);
            setAnimalBreedName(breedName ?? "");
          }}
        />
      </div>

      <label className="mt-4 block">
        <span className={LABEL_CLASS}>Notas o motivo</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Motivo de la visita, indicaciones…"
          rows={4}
          className={`${FIELD_CLASS} min-h-[6.5rem] resize-y py-3`}
        />
      </label>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
          {error}{" "}
          {isAuthError ? (
            <Link href={loginHref} className="font-semibold underline">
              Iniciar sesión
            </Link>
          ) : null}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Enviando…" : "Solicitar cita"}
      </button>
      <p className="mt-2 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
        No queda confirmada al enviarla. El negocio la revisa y te avisa por
        correo.
      </p>
    </form>
  );
}
