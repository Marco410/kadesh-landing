"use client";

import { useCallback, useEffect, useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import { sileo } from "sileo";
import LocationPicker from "kadesh/components/animals/nuevo/LocationPicker";
import { CHIP_CLASS, INPUT_CLASS, LABEL_CLASS, chipTone } from "kadesh/components/profile/clinics/formStyles";
import { PET_REFETCH, PetSheet, petErrorMessage, type PetDetail } from "kadesh/components/pets";
import { cn } from "kadesh/utils/cn";
import { RESCUE_PUBLISH_STATUS_OPTIONS, type RescuePublishStatus } from "./constants";
import { PUBLISH_RESCUE_PET_MUTATION, type PublishRescuePetResponse } from "./queries";

/**
 * Publica la ficha (`publishRescuePet`). Si ya tiene reporte público, solo le agrega la bitácora
 * (misma ubicación); si no, crea el reporte a nombre del espacio con los datos y fotos de la ficha,
 * y por eso pide dónde está. El reporte lleva el WhatsApp del espacio y avisa a la zona.
 */
export default function PublishRescuePetModal({
  isOpen,
  onClose,
  pet,
  initialStatus,
  hasReport,
}: {
  isOpen: boolean;
  onClose: () => void;
  pet: PetDetail;
  initialStatus: RescuePublishStatus;
  hasReport: boolean;
}) {
  const client = useApolloClient();
  const [status, setStatus] = useState<RescuePublishStatus>(initialStatus);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);
  const [notes, setNotes] = useState("");
  const [locationError, setLocationError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [publish, { loading }] = useMutation<PublishRescuePetResponse>(PUBLISH_RESCUE_PET_MUTATION);

  useEffect(() => {
    if (!isOpen) return;
    setStatus(initialStatus);
    setLat("");
    setLng("");
    setAddress("");
    setCity("");
    setState("");
    setCountry("");
    setNotes("");
    setLocationError("");
    setSubmitError("");
    // Solo al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleLocationChange = useCallback((newLat: string, newLng: string) => {
    setLat(newLat);
    setLng(newLng);
  }, []);

  const handleAddressChange = useCallback((a: string, c: string, s: string, co: string) => {
    setAddress(a);
    setCity(c);
    setState(s);
    setCountry(co);
  }, []);

  const handleSubmit = async () => {
    if (!hasReport) {
      if (!lat || !lng || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
        setLocationError("Fija el pin en el mapa o usa «Estoy aquí».");
        return;
      }
      if (isResolvingPlace) {
        setLocationError("Estamos ubicando la zona. Espera un momento.");
        return;
      }
    }
    setLocationError("");
    setSubmitError("");
    try {
      const result = await publish({
        variables: {
          petId: pet.id,
          status,
          location: hasReport ? null : { lat, lng, address: address.trim() || [city, state].filter(Boolean).join(", ") },
          notes: notes.trim() || null,
        },
      });
      const payload = result.data?.publishRescuePet;
      if (!payload?.success) {
        setSubmitError(payload?.message || "No se pudo publicar. Intenta de nuevo.");
        return;
      }
      await client.refetchQueries({ include: PET_REFETCH });
      sileo.success({
        title: payload.message,
        description: payload.createdReport
          ? "Avisamos a quien tiene alertas en esa zona. Compártelo para que más gente lo vea."
          : "Actualizamos su reporte público.",
      });
      onClose();
    } catch (error) {
      setSubmitError(petErrorMessage(error, "No se pudo publicar. Intenta de nuevo."));
    }
  };

  const statusLabel = RESCUE_PUBLISH_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "";

  return (
    <PetSheet
      isOpen={isOpen}
      title={`Publicar a ${pet.name}`}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={`Publicar como «${statusLabel}»`}
      isSubmitting={loading}
      error={submitError}
    >
      <p className="text-sm text-dash-muted">
        {hasReport
          ? "Actualizaremos su reporte público con el nuevo estado. Sus datos y fotos no cambian."
          : "Publicaremos un reporte a nombre del espacio con el nombre, fotos y señas de la ficha, y el WhatsApp del espacio. Vacunas y recordatorios no se publican."}
      </p>

      <div>
        <p className={LABEL_CLASS}>¿Cómo lo publicas?</p>
        <div role="radiogroup" aria-label="Estado de la publicación" className="flex flex-wrap gap-2">
          {RESCUE_PUBLISH_STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={status === option.value}
              onClick={() => setStatus(option.value)}
              className={cn(CHIP_CLASS, chipTone(status === option.value))}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-dash-muted">
          {RESCUE_PUBLISH_STATUS_OPTIONS.find((option) => option.value === status)?.hint}
        </p>
      </div>

      {hasReport ? null : (
        <div>
          <p className={LABEL_CLASS}>
            ¿Dónde está? <span className="text-red-600">*</span>
          </p>
          {locationError ? <p className="mb-2 text-xs text-red-600">{locationError}</p> : null}
          <LocationPicker
            compact
            isVisible={isOpen}
            lat={lat}
            lng={lng}
            address={address}
            city={city}
            state={state}
            country={country}
            onLocationChange={handleLocationChange}
            onAddressChange={handleAddressChange}
            onResolvingChange={setIsResolvingPlace}
          />
          <p className="mt-1 text-xs text-dash-muted">Basta con la zona: la colonia o el municipio del espacio.</p>
        </div>
      )}

      <div>
        <label htmlFor={`publish-notes-${pet.id}`} className={LABEL_CLASS}>
          Notas
        </label>
        <textarea
          id={`publish-notes-${pet.id}`}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className={`${INPUT_CLASS} resize-none`}
          placeholder="Carácter, si convive con otros animales, requisitos para adoptarlo…"
        />
      </div>
    </PetSheet>
  );
}
