"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, WhatsappIcon } from "@hugeicons/core-free-icons";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import { normalizePhone } from "kadesh/components/profile/validateProfile";
import { veterinaryDetailHref } from "./petPlaceSlug";
import {
  CLAIM_PET_PLACE_MUTATION,
  type ClaimPetPlaceResponse,
  type ClaimPetPlaceVariables,
} from "./queries";
import {
  CLAIM_BENEFITS,
  CLAIM_ROLE_OPTIONS,
  PET_PLACE_CLAIM_ROLE,
  PET_PLACE_CLAIM_STATUS,
  type PetPlaceClaimRole,
} from "./constants";
import { claimWhatsAppUrl, disputeClaimWhatsAppUrl } from "./claimWhatsApp";
import type { PetPlaceDetail } from "./types";

const INPUT_CLASS =
  "w-full rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-white dark:placeholder:text-[#9aa3b2]";

interface ClaimPetPlaceSectionProps {
  place: PetPlaceDetail;
  onClaimed: () => void;
}

export default function ClaimPetPlaceSection({
  place,
  onClaimed,
}: ClaimPetPlaceSectionProps) {
  const { user } = useUser();
  const [role, setRole] = useState<PetPlaceClaimRole>(PET_PLACE_CLAIM_ROLE.OWNER);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [claimPetPlace, { loading }] = useMutation<
    ClaimPetPlaceResponse,
    ClaimPetPlaceVariables
  >(CLAIM_PET_PLACE_MUTATION);

  const claimStatus = place.claimStatus ?? PET_PLACE_CLAIM_STATUS.UNCLAIMED;
  const isVerified = Boolean(place.verified) || claimStatus === PET_PLACE_CLAIM_STATUS.VERIFIED;
  const ownerId = place.user?.id ?? null;
  const isOwn = Boolean(user?.id && ownerId === user.id);
  const isPending = claimStatus === PET_PLACE_CLAIM_STATUS.PENDING;
  const takenByOther =
    Boolean(ownerId) &&
    !isOwn &&
    (isVerified || isPending);

  const loginHref = `${Routes.auth.login}?redirect=${encodeURIComponent(
    veterinaryDetailHref(place),
  )}`;

  const openWhatsApp = (nextPhone: string, nextRole: string, nextNotes: string) => {
    window.open(
      claimWhatsAppUrl({
        placeName: place.name,
        placeId: place.id,
        role: nextRole,
        phone: nextPhone,
        notes: nextNotes,
      }),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.replace(/\D/g, "").length < 10) {
      setError("El teléfono debe ser de 10 dígitos.");
      return;
    }

    try {
      const { data } = await claimPetPlace({
        variables: {
          input: {
            petPlaceId: place.id,
            role,
            phone: cleanPhone,
            notes: notes.trim() || null,
          },
        },
      });
      const result = data?.claimPetPlace;
      if (!result?.success) {
        setError(result?.message ?? "No pudimos enviar la solicitud.");
        return;
      }
      openWhatsApp(cleanPhone, role, notes);
      onClaimed();
    } catch {
      setError("No pudimos enviar la solicitud. Intenta de nuevo.");
    }
  };

  if (isVerified && !isOwn) return null;

  if (isVerified && isOwn) {
    return (
      <section className="rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised">
        <h2 className="text-sm font-bold text-[#121212] dark:text-white">
          Esta ficha es tuya
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
          Ya está verificada. Puedes actualizar horarios, teléfono y servicios desde tu perfil.
        </p>
        <Link
          href={`${Routes.profile}?tab=clinics`}
          className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
        >
          Editar en mi perfil
        </Link>
      </section>
    );
  }

  if (takenByOther) {
    return (
      <section className="rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised">
        <h2 className="text-sm font-bold text-[#121212] dark:text-white">
          Ficha en revisión
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
          Alguien ya pidió esta clínica. Si es un error, escríbenos.
        </p>
        <a
          href={disputeClaimWhatsAppUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
        >
          <HugeiconsIcon icon={WhatsappIcon} size={18} strokeWidth={1.5} />
          Escribir por WhatsApp
        </a>
      </section>
    );
  }

  if (isOwn && isPending) {
    return (
      <section className="rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised">
        <h2 className="text-sm font-bold text-[#121212] dark:text-white">
          Solicitud enviada
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
          Falta validar por WhatsApp que la clínica es tuya. Cuando lo confirmemos, podrás editar la ficha.
        </p>
        <button
          type="button"
          onClick={() =>
            openWhatsApp(user?.phone || phone, PET_PLACE_CLAIM_ROLE.OWNER, notes)
          }
          className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
        >
          <HugeiconsIcon icon={WhatsappIcon} size={18} strokeWidth={1.5} />
          Seguir por WhatsApp
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised">
      <h2 className="text-sm font-bold text-[#121212] dark:text-white">
        ¿Es tu clínica?
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
        Reclámala para completar horarios, contacto y servicios. Validamos que seas tú por WhatsApp.
      </p>
      <ul className="mt-3 space-y-1.5">
        {CLAIM_BENEFITS.map((benefit) => (
          <li
            key={benefit}
            className="flex items-start gap-2 text-sm text-[#121212] dark:text-white"
          >
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={16}
              className="mt-0.5 shrink-0 text-kadesh"
              strokeWidth={1.5}
              aria-hidden
            />
            {benefit}
          </li>
        ))}
      </ul>

      {!user?.id ? (
        <Link
          href={loginHref}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 sm:w-auto"
        >
          Inicia sesión para reclamarla
        </Link>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <fieldset>
            <legend className="mb-1.5 text-xs font-semibold text-[#5a5a5a] dark:text-[#b0b0b0]">
              Tu rol
            </legend>
            <div role="group" aria-label="Tu rol" className="flex flex-wrap gap-1.5">
              {CLAIM_ROLE_OPTIONS.map((option) => {
                const selected = role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setRole(option.value)}
                    className={`inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
                      selected
                        ? "bg-kadesh text-white"
                        : "bg-[#f3f5f8] text-[#3a3a3a] hover:bg-kadesh-50 dark:bg-night dark:text-[#d0d0d0] dark:hover:bg-kadesh/20"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#5a5a5a] dark:text-[#b0b0b0]">
              Teléfono para validarte
            </span>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={INPUT_CLASS}
              placeholder="10 dígitos"
              autoComplete="tel"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#5a5a5a] dark:text-[#b0b0b0]">
              Cómo comprobamos que es tuya
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={`${INPUT_CLASS} resize-none`}
              rows={3}
              placeholder="Cédula profesional, RFC o el nombre con el que opera la clínica"
            />
          </label>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <HugeiconsIcon icon={WhatsappIcon} size={18} strokeWidth={1.5} />
            {loading ? "Enviando…" : "Reclamar y enviar por WhatsApp"}
          </button>
        </form>
      )}
    </section>
  );
}
