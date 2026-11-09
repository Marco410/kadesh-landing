"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { useApolloClient, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, Image01Icon } from "@hugeicons/core-free-icons";
import {
  DashButton,
  DashSectionCard,
  dashInputClass,
  dashLabelClass,
  dashTextareaClass,
} from "kadesh/components/app-shell";
import { ANIMAL_TYPE_OPTIONS } from "kadesh/components/animals/constants";
import { CHIP_CLASS, chipTone } from "kadesh/components/profile/clinics/formStyles";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import { useUser } from "kadesh/utils/UserContext";
import { RESCUE_LIMITS, RESCUE_ORG_TYPE, RESCUE_ORG_TYPE_OPTIONS, type RescueOrgType } from "./constants";
import {
  ACTIVATE_RESCUE_ORG_MUTATION,
  RESCUE_REFETCH,
  UPDATE_RESCUE_ORG_MUTATION,
  type ActivateRescueOrgResponse,
} from "./queries";

const STEPS = [
  { title: "¿Qué tipo de espacio eres?", hint: "Puedes cambiarlo después." },
  { title: "¿Dónde y cómo te contactamos?", hint: "Tu WhatsApp nos sirve para verificar tu espacio." },
  { title: "Cuéntanos de ustedes", hint: "Esto sale en tu perfil público una vez verificado. Todo es opcional." },
] as const;

const PHONE_DIGITS = /^\d{10}$/;

function digitsOf(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("52") ? digits.slice(2) : digits;
}

/**
 * Activar un espacio de rescate en tres pasos. Al terminar, el espacio queda «En revisión» con la
 * persona como administradora; el logo (si lo eligió) se sube enseguida con el perfil.
 */
export default function RescueOnboardingForm() {
  const router = useRouter();
  const client = useApolloClient();
  const { user } = useUser();
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0);
  const [type, setType] = useState<RescueOrgType>(RESCUE_ORG_TYPE.INDEPENDENT);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [species, setSpecies] = useState<string[]>(["dog", "cat"]);
  const [whatsapp, setWhatsapp] = useState(user?.phone ?? "");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [activate, { loading: activating }] = useMutation<ActivateRescueOrgResponse>(ACTIVATE_RESCUE_ORG_MUTATION);
  const [updateOrg, { loading: uploading }] = useMutation(UPDATE_RESCUE_ORG_MUTATION);
  const busy = activating || uploading;
  const skipFocus = useRef(true);

  useEffect(() => {
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  const field = (suffix: string) => `${id}-${suffix}`;

  const validate = (current: number): string => {
    if (current === 0 && name.trim().length < RESCUE_LIMITS.NAME_MIN) {
      return "Escribe el nombre de tu espacio (o el tuyo, si rescatas por tu cuenta).";
    }
    if (current === 1) {
      if (!PHONE_DIGITS.test(digitsOf(whatsapp))) return "Escribe un WhatsApp de 10 dígitos.";
      if (!city.trim()) return "Escribe tu municipio o ciudad.";
    }
    if (current === 2 && !confirmed) return "Confirma que la información es real para continuar.";
    return "";
  };

  const next = () => {
    const message = validate(step);
    setError(message);
    if (!message) setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const pickLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > RESCUE_LIMITS.IMAGE_MAX_BYTES) {
      sileo.error({ title: "Revisa la imagen", description: "JPG, PNG o WebP de menos de 5 MB." });
      return;
    }
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const toggleSpecies = (value: string) =>
    setSpecies((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      next();
      return;
    }
    for (let index = 0; index < STEPS.length; index += 1) {
      const message = validate(index);
      if (message) {
        setError(message);
        setStep(index);
        return;
      }
    }
    setError("");
    try {
      const result = await activate({
        variables: {
          input: {
            name: name.trim(),
            type,
            city: city.trim(),
            state: state.trim(),
            species,
            whatsapp: digitsOf(whatsapp),
            email: email.trim(),
            description: description.trim(),
            facebookUrl: facebookUrl.trim(),
            instagramUrl: instagramUrl.trim(),
          },
        },
      });
      const payload = result.data?.activateRescueOrganization;
      const org = payload?.organization;
      if (!payload?.success || !org) {
        setError(payload?.message ?? "No pudimos activar tu espacio. Intenta de nuevo.");
        return;
      }
      if (logo) {
        try {
          await updateOrg({ variables: { id: org.id, data: { logo: { upload: logo } } } });
        } catch (uploadError) {
          console.error("[rescue] No se pudo subir el logo", uploadError);
          sileo.error({ title: "Tu espacio ya está activo", description: "El logo no se subió; agrégalo en Perfil público." });
        }
      }
      await client.refetchQueries({ include: RESCUE_REFETCH });
      sileo.success({ title: payload.message });
      router.push(Routes.profileRescue(org.id));
    } catch (mutationError) {
      console.error("[rescue] activateRescueOrganization", mutationError);
      setError("No pudimos activar tu espacio. Intenta de nuevo.");
    }
  };

  const current = STEPS[step];

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <ol className="flex gap-2" aria-label="Pasos">
        {STEPS.map((item, index) => (
          <li
            key={item.title}
            className={cn("h-1.5 flex-1 rounded-full", index <= step ? "bg-kadesh-500" : "bg-dash-surface-3")}
            aria-current={index === step ? "step" : undefined}
          >
            <span className="sr-only">
              Paso {index + 1} de {STEPS.length}: {item.title}
            </span>
          </li>
        ))}
      </ol>

      <DashSectionCard
        key={step}
        title={
          <span ref={headingRef} tabIndex={-1} className="outline-none">
            {current.title}
          </span>
        }
        description={`Paso ${step + 1} de ${STEPS.length}. ${current.hint}`}
      >
        <fieldset disabled={busy} className="flex flex-col gap-5">
          {step === 0 ? (
            <>
              <div role="radiogroup" aria-label="Tipo de espacio" className="grid gap-2 sm:grid-cols-2">
                {RESCUE_ORG_TYPE_OPTIONS.map((option) => {
                  const selected = option.value === type;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setType(option.value)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-[border-color,background-color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400",
                        selected
                          ? "border-dash-ink bg-dash-surface-2"
                          : "border-dash-line bg-dash-surface hover:border-dash-line-strong",
                      )}
                    >
                      <span className="block text-sm font-semibold text-dash-ink">{option.label}</span>
                      <span className="mt-0.5 block text-[13px] text-dash-muted">{option.hint}</span>
                    </button>
                  );
                })}
              </div>
              <div>
                <label htmlFor={field("name")} className={dashLabelClass}>
                  Nombre del espacio
                </label>
                <input
                  id={field("name")}
                  value={name}
                  maxLength={RESCUE_LIMITS.NAME_MAX}
                  onChange={(event) => setName(event.target.value)}
                  className={dashInputClass}
                  placeholder="Huellitas de Morelia"
                  autoComplete="organization"
                />
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
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
                <input
                  id={field("state")}
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  className={dashInputClass}
                  placeholder="Michoacán"
                />
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
              <div>
                <label htmlFor={field("whatsapp")} className={dashLabelClass}>
                  WhatsApp del espacio
                </label>
                <input
                  id={field("whatsapp")}
                  type="tel"
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  className={dashInputClass}
                  placeholder="443 521 5638"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label htmlFor={field("email")} className={dashLabelClass}>
                  Correo <span className="font-normal text-dash-muted">(opcional)</span>
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
            </div>
          ) : null}

          {step === 2 ? (
            <>
              <div className="flex items-center gap-4">
                <label
                  htmlFor={field("logo")}
                  className="relative flex size-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-dash-line-strong bg-dash-surface-2 text-dash-muted focus-within:ring-2 focus-within:ring-kadesh-400"
                >
                  {logoPreview ? (
                    <Image src={logoPreview} alt="Logo elegido" fill sizes="80px" className="object-cover" unoptimized />
                  ) : (
                    <HugeiconsIcon icon={Image01Icon} size={22} aria-hidden />
                  )}
                  <input id={field("logo")} type="file" accept="image/*" className="sr-only" onChange={pickLogo} />
                </label>
                <div className="text-sm">
                  <p className="font-semibold text-dash-ink">Logo o foto</p>
                  <p className="text-dash-muted">Toca el círculo para elegirlo. Menos de 5 MB.</p>
                </div>
              </div>
              <div>
                <label htmlFor={field("description")} className={dashLabelClass}>
                  Sobre ustedes
                </label>
                <textarea
                  id={field("description")}
                  value={description}
                  maxLength={RESCUE_LIMITS.DESCRIPTION_MAX}
                  onChange={(event) => setDescription(event.target.value)}
                  className={dashTextareaClass}
                  rows={4}
                  placeholder="Desde cuándo rescatan, en qué zona, cómo trabajan…"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
              <label className="flex items-start gap-3 rounded-2xl bg-dash-surface-2 p-4 text-sm text-dash-soft">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  className="mt-0.5 size-5 shrink-0 accent-kadesh-500"
                />
                <span>
                  Confirmo que rescatamos animales y que estos datos son reales. Sé que KADESH verifica cada espacio
                  antes de mostrarlo al público.
                </span>
              </label>
            </>
          ) : null}
        </fieldset>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {step > 0 ? (
            <DashButton
              variant="ghost"
              icon={ArrowLeft01Icon}
              onClick={() => {
                setError("");
                setStep((value) => Math.max(value - 1, 0));
              }}
              disabled={busy}
            >
              Atrás
            </DashButton>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <DashButton type="submit" variant="dark">
              Siguiente
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} aria-hidden />
            </DashButton>
          ) : (
            <DashButton type="submit" disabled={busy}>
              {busy ? "Activando…" : "Activar mi espacio"}
            </DashButton>
          )}
        </div>
      </DashSectionCard>
    </form>
  );
}
