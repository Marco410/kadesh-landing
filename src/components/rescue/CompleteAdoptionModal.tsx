"use client";

import { useEffect, useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import { sileo } from "sileo";
import { INPUT_CLASS, LABEL_CLASS } from "kadesh/components/profile/clinics/formStyles";
import { PetSheet, petErrorMessage, type PetDetail } from "kadesh/components/pets";
import { RESCUE_ADOPTER_NOT_FOUND } from "./constants";
import { COMPLETE_RESCUE_ADOPTION_MUTATION, type CompleteRescueAdoptionResponse } from "./queries";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * «Completar adopción» (`completeRescueAdoption`): la cartilla, con vacunas, registros y
 * recordatorios, pasa a la cuenta del adoptante como dueño principal. El espacio deja de verla y su
 * reporte público queda «Adoptado». La cuenta debe existir: no se crean cuentas a nombre de otros.
 */
export default function CompleteAdoptionModal({
  isOpen,
  onClose,
  pet,
  orgName,
  onAdopted,
}: {
  isOpen: boolean;
  onClose: () => void;
  pet: PetDetail;
  orgName: string;
  onAdopted: () => void;
}) {
  const client = useApolloClient();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [complete, { loading }] = useMutation<CompleteRescueAdoptionResponse>(COMPLETE_RESCUE_ADOPTION_MUTATION);

  useEffect(() => {
    if (!isOpen) return;
    setEmail("");
    setEmailError("");
    setSubmitError("");
  }, [isOpen]);

  const handleSubmit = async () => {
    const clean = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(clean)) {
      setEmailError("Escribe el correo con el que la persona entra a KADESH.");
      return;
    }
    setEmailError("");
    setSubmitError("");
    try {
      const result = await complete({ variables: { petId: pet.id, email: clean } });
      const payload = result.data?.completeRescueAdoption;
      if (!payload?.success) {
        if (payload?.code === RESCUE_ADOPTER_NOT_FOUND) setEmailError(payload.message);
        else setSubmitError(payload?.message || "No se pudo completar la adopción. Intenta de nuevo.");
        return;
      }
      sileo.success({ title: `¡${pet.name} tiene familia!`, description: payload.message });
      onClose();
      onAdopted();
      await client.refetchQueries({ include: ["RescuePets", "RescueOrganizationAnimals", "MyRescueOrganizations"] });
    } catch (error) {
      setSubmitError(petErrorMessage(error, "No se pudo completar la adopción. Intenta de nuevo."));
    }
  };

  return (
    <PetSheet
      isOpen={isOpen}
      title={`Completar la adopción de ${pet.name}`}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Completar adopción"
      isSubmitting={loading}
      error={submitError}
    >
      <p className="text-sm text-dash-muted">
        La cartilla de {pet.name} (vacunas, registros y recordatorios) pasará a la cuenta de quien lo adopta y dejará de
        verse en {orgName}. Su publicación quedará como «Adoptado».
      </p>

      <div>
        <label htmlFor={`adopter-email-${pet.id}`} className={LABEL_CLASS}>
          Correo de quien adopta <span className="text-red-600">*</span>
        </label>
        <input
          id={`adopter-email-${pet.id}`}
          type="email"
          inputMode="email"
          autoComplete="off"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={INPUT_CLASS}
          placeholder="correo@ejemplo.com"
          aria-invalid={Boolean(emailError)}
          aria-describedby={`adopter-email-hint-${pet.id}`}
        />
        <p
          id={`adopter-email-hint-${pet.id}`}
          className={emailError ? "mt-1 text-xs text-red-600" : "mt-1 text-xs text-dash-muted"}
        >
          {emailError || "Necesita una cuenta de KADESH (es gratis). Si no la tiene, pídele que se registre primero."}
        </p>
      </div>
    </PetSheet>
  );
}
