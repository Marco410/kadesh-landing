"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon, Upload04Icon } from "@hugeicons/core-free-icons";
import {
  DashButton,
  dashInputClass,
  dashLabelClass,
  dashSelectClass,
  dashTextareaClass,
} from "kadesh/components/app-shell";
import { ANIMAL_TYPE_OPTIONS } from "kadesh/components/animals/constants";
import { petErrorMessage } from "kadesh/components/pets";
import { CHIP_CLASS, chipTone } from "kadesh/components/profile/clinics/formStyles";
import { cn } from "kadesh/utils/cn";
import { RESCUE_LIMITS, RESCUE_ORG_TYPE_OPTIONS, canEditRescueProfile, knownRescueSpecies } from "./constants";
import { UPDATE_RESCUE_ORG_MUTATION, type UpdateRescueOrgResponse } from "./queries";
import type { RescueOrganization } from "./types";

type ImageSlot = "logo" | "cover";

/**
 * Perfil público del espacio. Lo editan admins y coordinadores; el resto lo ve en solo lectura.
 * El backend limpia y valida (teléfono, links de redes, largos): aquí solo lo básico.
 */
export default function RescueProfileForm({
  org,
  onSaved,
}: {
  org: RescueOrganization;
  onSaved: () => void;
}) {
  const id = useId();
  const editable = canEditRescueProfile(org.viewerRole);
  const [name, setName] = useState(org.name);
  const [type, setType] = useState(org.type);
  const [description, setDescription] = useState(org.description ?? "");
  const [city, setCity] = useState(org.city ?? "");
  const [state, setState] = useState(org.state ?? "");
  const [species, setSpecies] = useState<string[]>(() => knownRescueSpecies(org.species));
  const [capacity, setCapacity] = useState(org.capacity != null ? String(org.capacity) : "");
  const [whatsapp, setWhatsapp] = useState(org.whatsapp ?? "");
  const [email, setEmail] = useState(org.email ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(org.websiteUrl ?? "");
  const [facebookUrl, setFacebookUrl] = useState(org.facebookUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(org.instagramUrl ?? "");
  const [tiktokUrl, setTiktokUrl] = useState(org.tiktokUrl ?? "");
  const [donationUrl, setDonationUrl] = useState(org.donationUrl ?? "");
  const [donationInfo, setDonationInfo] = useState(org.donationInfo ?? "");
  const [needs, setNeeds] = useState(org.needs ?? "");
  const [files, setFiles] = useState<Partial<Record<ImageSlot, File>>>({});
  const [previews, setPreviews] = useState<Partial<Record<ImageSlot, string>>>({});
  const [error, setError] = useState("");
  const [update, { loading }] = useMutation<UpdateRescueOrgResponse>(UPDATE_RESCUE_ORG_MUTATION);

  // Las vistas previas se liberan al salir de la vista (no antes: siguen en pantalla).
  const createdUrls = useRef<string[]>([]);
  useEffect(() => {
    const urls = createdUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const pickImage = (slot: ImageSlot) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      sileo.error({ title: "Elige una imagen", description: "JPG, PNG o WebP." });
      return;
    }
    if (file.size > RESCUE_LIMITS.IMAGE_MAX_BYTES) {
      sileo.error({ title: "La imagen pesa mucho", description: "Usa una de menos de 5 MB." });
      return;
    }
    const url = URL.createObjectURL(file);
    createdUrls.current.push(url);
    setFiles((current) => ({ ...current, [slot]: file }));
    setPreviews((current) => ({ ...current, [slot]: url }));
  };

  const toggleSpecies = (value: string) =>
    setSpecies((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editable) return;
    if (name.trim().length < RESCUE_LIMITS.NAME_MIN) {
      setError(`El nombre debe tener al menos ${RESCUE_LIMITS.NAME_MIN} letras.`);
      return;
    }
    const capacityValue = capacity.trim() ? Number(capacity) : null;
    if (capacityValue != null && (!Number.isFinite(capacityValue) || capacityValue < 0)) {
      setError("Revisa la capacidad.");
      return;
    }
    setError("");
    try {
      await update({
        variables: {
          id: org.id,
          data: {
            name: name.trim(),
            type,
            description,
            city: city.trim(),
            state: state.trim(),
            species: knownRescueSpecies(species),
            capacity: capacityValue == null ? null : Math.round(capacityValue),
            whatsapp: whatsapp.trim(),
            email: email.trim(),
            websiteUrl: websiteUrl.trim(),
            facebookUrl: facebookUrl.trim(),
            instagramUrl: instagramUrl.trim(),
            tiktokUrl: tiktokUrl.trim(),
            donationUrl: donationUrl.trim(),
            donationInfo,
            needs,
            ...(files.logo ? { logo: { upload: files.logo } } : {}),
            ...(files.cover ? { cover: { upload: files.cover } } : {}),
          },
        },
      });
      setFiles({});
      sileo.success({ title: "Perfil guardado" });
      onSaved();
    } catch (mutationError) {
      setError(petErrorMessage(mutationError, "No pudimos guardar. Revisa los datos e intenta de nuevo."));
    }
  };

  const logoUrl = previews.logo ?? org.logo?.url ?? null;
  const coverUrl = previews.cover ?? org.cover?.url ?? null;
  const field = (suffix: string) => `${id}-${suffix}`;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {!editable ? (
        <p className="rounded-2xl bg-dash-surface-2 px-4 py-3 text-sm text-dash-soft">
          Solo los administradores y coordinadores del espacio pueden cambiar el perfil.
        </p>
      ) : null}

      <fieldset disabled={!editable || loading} className="flex flex-col gap-6 disabled:opacity-90">
        <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
          <div>
            <p className={dashLabelClass}>Logo</p>
            <label
              htmlFor={field("logo")}
              className="group relative flex size-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-dash-line-strong bg-dash-surface-2 text-dash-muted focus-within:ring-2 focus-within:ring-kadesh-400"
            >
              {logoUrl ? (
                <Image src={logoUrl} alt="Logo actual" fill sizes="112px" className="object-cover" unoptimized />
              ) : (
                <HugeiconsIcon icon={Image01Icon} size={26} aria-hidden />
              )}
              <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-center text-[11px] font-semibold text-white">
                Cambiar
              </span>
              <input id={field("logo")} type="file" accept="image/*" className="sr-only" onChange={pickImage("logo")} />
            </label>
          </div>
          <div className="min-w-0">
            <p className={dashLabelClass}>Portada</p>
            <label
              htmlFor={field("cover")}
              className="relative flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-dash-line-strong bg-dash-surface-2 text-dash-muted focus-within:ring-2 focus-within:ring-kadesh-400"
            >
              {coverUrl ? (
                <Image src={coverUrl} alt="Portada actual" fill sizes="600px" className="object-cover" unoptimized />
              ) : (
                <span className="flex items-center gap-2 text-sm">
                  <HugeiconsIcon icon={Upload04Icon} size={18} aria-hidden />
                  Sube una foto de tus rescates
                </span>
              )}
              <input id={field("cover")} type="file" accept="image/*" className="sr-only" onChange={pickImage("cover")} />
            </label>
            <p className="mt-1.5 text-[13px] text-dash-muted">Horizontal, de menos de 5 MB.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor={field("name")} className={dashLabelClass}>
              Nombre del espacio
            </label>
            <input
              id={field("name")}
              value={name}
              maxLength={RESCUE_LIMITS.NAME_MAX}
              onChange={(event) => setName(event.target.value)}
              className={dashInputClass}
            />
          </div>
          <div>
            <label htmlFor={field("type")} className={dashLabelClass}>
              Tipo
            </label>
            <select id={field("type")} value={type} onChange={(event) => setType(event.target.value)} className={dashSelectClass}>
              {RESCUE_ORG_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={field("capacity")} className={dashLabelClass}>
              Capacidad <span className="font-normal text-dash-muted">(opcional)</span>
            </label>
            <input
              id={field("capacity")}
              type="number"
              inputMode="numeric"
              min={0}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              className={dashInputClass}
              placeholder="¿Cuántos animales a la vez?"
            />
          </div>
          <div>
            <label htmlFor={field("city")} className={dashLabelClass}>
              Municipio o ciudad
            </label>
            <input id={field("city")} value={city} onChange={(event) => setCity(event.target.value)} className={dashInputClass} />
          </div>
          <div>
            <label htmlFor={field("state")} className={dashLabelClass}>
              Estado
            </label>
            <input id={field("state")} value={state} onChange={(event) => setState(event.target.value)} className={dashInputClass} />
          </div>
          <div className="sm:col-span-2">
            <p className={dashLabelClass} id={field("species")}>
              ¿Qué animales rescatan?
            </p>
            <div role="group" aria-labelledby={field("species")} className="flex flex-wrap gap-2">
              {ANIMAL_TYPE_OPTIONS.map((option) => {
                const selected = species.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleSpecies(option.value)}
                    className={cn(CHIP_CLASS, chipTone(selected))}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={field("description")} className={dashLabelClass}>
              Sobre ustedes
            </label>
            <textarea
              id={field("description")}
              value={description}
              maxLength={RESCUE_LIMITS.DESCRIPTION_MAX}
              onChange={(event) => setDescription(event.target.value)}
              className={dashTextareaClass}
              rows={5}
              placeholder="Desde cuándo rescatan, en qué zona, cómo trabajan…"
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-[15px] font-semibold text-dash-ink">Contacto y redes</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={field("whatsapp")} className={dashLabelClass}>
                WhatsApp
              </label>
              <input
                id={field("whatsapp")}
                type="tel"
                inputMode="tel"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                className={dashInputClass}
                placeholder="443 521 5638"
              />
            </div>
            <div>
              <label htmlFor={field("email")} className={dashLabelClass}>
                Correo
              </label>
              <input
                id={field("email")}
                type="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={dashInputClass}
              />
            </div>
            <div>
              <label htmlFor={field("facebook")} className={dashLabelClass}>
                Facebook
              </label>
              <input
                id={field("facebook")}
                value={facebookUrl}
                onChange={(event) => setFacebookUrl(event.target.value)}
                className={dashInputClass}
                placeholder="Link o @usuario"
              />
            </div>
            <div>
              <label htmlFor={field("instagram")} className={dashLabelClass}>
                Instagram
              </label>
              <input
                id={field("instagram")}
                value={instagramUrl}
                onChange={(event) => setInstagramUrl(event.target.value)}
                className={dashInputClass}
                placeholder="Link o @usuario"
              />
            </div>
            <div>
              <label htmlFor={field("tiktok")} className={dashLabelClass}>
                TikTok
              </label>
              <input
                id={field("tiktok")}
                value={tiktokUrl}
                onChange={(event) => setTiktokUrl(event.target.value)}
                className={dashInputClass}
                placeholder="Link o @usuario"
              />
            </div>
            <div>
              <label htmlFor={field("website")} className={dashLabelClass}>
                Sitio web
              </label>
              <input
                id={field("website")}
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
                className={dashInputClass}
                placeholder="tusitio.org"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[15px] font-semibold text-dash-ink">Cómo ayudarles</p>
          <div className="grid gap-4">
            <div>
              <label htmlFor={field("donationUrl")} className={dashLabelClass}>
                Link para donar
              </label>
              <input
                id={field("donationUrl")}
                value={donationUrl}
                onChange={(event) => setDonationUrl(event.target.value)}
                className={dashInputClass}
                placeholder="PayPal, Mercado Pago, Kichink…"
              />
            </div>
            <div>
              <label htmlFor={field("donationInfo")} className={dashLabelClass}>
                Otros datos para donar
              </label>
              <textarea
                id={field("donationInfo")}
                value={donationInfo}
                maxLength={RESCUE_LIMITS.DONATION_INFO_MAX}
                onChange={(event) => setDonationInfo(event.target.value)}
                className={dashTextareaClass}
                rows={3}
                aria-describedby={field("donationInfo-hint")}
              />
              <p id={field("donationInfo-hint")} className="mt-1.5 text-[13px] text-dash-muted">
                Se muestra en tu perfil público tal cual. Pon solo lo que quieras compartir.
              </p>
            </div>
            <div>
              <label htmlFor={field("needs")} className={dashLabelClass}>
                Lo que necesitan
              </label>
              <textarea
                id={field("needs")}
                value={needs}
                maxLength={RESCUE_LIMITS.NEEDS_MAX}
                onChange={(event) => setNeeds(event.target.value)}
                className={dashTextareaClass}
                rows={3}
                placeholder="Croquetas para cachorro, desparasitante, cobijas, transporte al veterinario…"
              />
            </div>
          </div>
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {editable ? (
        <div className="flex justify-end">
          <DashButton type="submit" disabled={loading}>
            {loading ? "Guardando…" : "Guardar perfil"}
          </DashButton>
        </div>
      ) : null}
    </form>
  );
}
