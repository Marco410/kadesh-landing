"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import LocationPicker from "kadesh/components/animals/nuevo/LocationPicker";
import ChoiceChip from "kadesh/components/animals/nuevo/ChoiceChip";
import { normalizePhone } from "kadesh/components/profile/validateProfile";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import {
  CREATE_PET_PLACE_MUTATION,
  GET_VETERINARY_PET_PLACE_TYPE,
} from "./queries";
import {
  CLAIM_ROLE_OPTIONS,
  PET_PLACE_CLAIM_ROLE,
  PET_PLACE_CLAIM_STATUS,
  type PetPlaceClaimRole,
} from "./constants";

const fieldClass =
  "w-full rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-base text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh sm:text-sm dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2]";
const labelClass =
  "mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]";

interface FieldErrors {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  location?: string;
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export default function RegisterVeterinaryForm() {
  const router = useRouter();
  const { user } = useUser();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState<PetPlaceClaimRole>(PET_PLACE_CLAIM_ROLE.OWNER);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [emergencies, setEmergencies] = useState(false);
  const [parking, setParking] = useState(false);
  const [appointmentRequired, setAppointmentRequired] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const { data: typeData } = useQuery<{ petPlaceTypes?: { id: string }[] }>(
    GET_VETERINARY_PET_PLACE_TYPE,
  );
  const [createPetPlace, { loading }] = useMutation(CREATE_PET_PLACE_MUTATION);

  const validate = () => {
    const next: FieldErrors = {};
    const missing: string[] = [];
    if (!name.trim()) {
      next.name = "Escribe el nombre de la clínica.";
      missing.push("Nombre");
    }
    if (description.trim().length < 10) {
      next.description = "Cuéntanos en una frase qué ofrece tu clínica.";
      missing.push("Descripción");
    }
    if (digitsOnly(phone).length < 10) {
      next.phone = "El teléfono debe ser de 10 dígitos.";
      missing.push("Teléfono");
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      next.email = "Revisa el correo.";
      missing.push("Correo");
    }
    if (!lat.trim() || !lng.trim()) {
      next.location = "Fija el pin de tu clínica en el mapa.";
      missing.push("Ubicación");
    }
    setErrors(next);
    if (missing.length) {
      sileo.error({
        title: "Faltan campos por completar",
        description: missing.join(", "),
      });
    }
    return missing.length === 0;
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      sileo.error({ title: "Inicia sesión para registrar tu veterinaria" });
      return;
    }
    if (!validate()) return;

    const typeId = typeData?.petPlaceTypes?.[0]?.id;
    const cleanPhone = normalizePhone(phone);
    const cleanWhatsapp = digitsOnly(whatsapp);
    const site = website.trim();

    try {
      const { data } = await createPetPlace({
        variables: {
          data: {
            name: name.trim(),
            description: description.trim(),
            phone: cleanPhone,
            whatsapp: cleanWhatsapp,
            email: email.trim(),
            website: site && !/^https?:\/\//i.test(site) ? `https://${site}` : site,
            emergencies,
            parking,
            appointmentRequired,
            address: address.trim(),
            street: address.trim(),
            municipality: city.trim(),
            state: state.trim(),
            country: country.trim(),
            lat,
            lng,
            ...(typeId ? { types: { connect: [{ id: typeId }] } } : {}),
            user: { connect: { id: user.id } },
            claimStatus: PET_PLACE_CLAIM_STATUS.PENDING,
            claimRole: role,
            claimPhone: cleanPhone,
            claimedAt: new Date().toISOString(),
          },
        },
      });
      if (!data?.createPetPlace?.id) throw new Error("No se creó la ficha");
      sileo.success({
        title: "Solicitud enviada",
        description: "Validaremos tu clínica y te avisaremos.",
      });
      router.push(`${Routes.profile}?tab=clinics`);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message.split("\n")[0]
          : "Intenta de nuevo.";
      sileo.error({ title: "No se pudo registrar", description: message });
    }
  };

  const toggles: Array<[string, boolean, (v: boolean) => void]> = [
    ["Atiende urgencias 24/7", emergencies, setEmergencies],
    ["Tiene estacionamiento", parking, setParking],
    ["Solo con cita", appointmentRequired, setAppointmentRequired],
  ];

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <header className="shrink-0 border-b border-[#e6e9ef] bg-white px-4 py-3 dark:border-white/10 dark:bg-night-raised sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(Routes.veterinaries.index)}
            aria-label="Volver a veterinarias"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#121212] hover:bg-[#f3f5f8] dark:text-[#eef1f6] dark:hover:bg-night"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} strokeWidth={1.5} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black tracking-tight text-[#121212] dark:text-[#eef1f6] sm:text-xl">
              Registra tu veterinaria
            </h1>
            <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
              Revisamos cada solicitud antes de publicarla.
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-5 sm:px-6 sm:py-6">
          <div>
            <label htmlFor="vet-name" className={labelClass}>
              Nombre de la clínica <span className="text-red-600">*</span>
            </label>
            <input
              id="vet-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              placeholder="Ej. Clínica Veterinaria San Francisco"
            />
            {errors.name ? <p className="mt-2 text-xs text-red-600">{errors.name}</p> : null}
          </div>

          <div>
            <label htmlFor="vet-description" className={labelClass}>
              Descripción <span className="text-red-600">*</span>
            </label>
            <textarea
              id="vet-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${fieldClass} resize-none`}
              placeholder="Servicios, especialidades y a qué animales atienden"
            />
            {errors.description ? (
              <p className="mt-2 text-xs text-red-600">{errors.description}</p>
            ) : null}
          </div>

          <div>
            <p className={labelClass}>Tu relación con la clínica</p>
            <div className="flex flex-wrap gap-1.5">
              {CLAIM_ROLE_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option.value}
                  label={option.label}
                  selected={role === option.value}
                  onSelect={() => setRole(option.value)}
                />
              ))}
            </div>
          </div>

          <div className={errors.location ? "rounded-xl ring-1 ring-red-500 ring-offset-2 dark:ring-offset-night" : ""}>
            <LocationPicker
              compact
              lat={lat}
              lng={lng}
              address={address}
              city={city}
              state={state}
              country={country}
              onLocationChange={(a, b) => {
                setLat(a);
                setLng(b);
              }}
              onAddressChange={(a, c, s, co) => {
                setAddress(a);
                setCity(c);
                setState(s);
                setCountry(co);
              }}
            />
            {errors.location ? <p className="mt-2 text-xs text-red-600">{errors.location}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="vet-phone" className={labelClass}>
                Teléfono <span className="text-red-600">*</span>
              </label>
              <input
                id="vet-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={18}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClass}
                placeholder="55 1234 5678"
              />
              {errors.phone ? <p className="mt-2 text-xs text-red-600">{errors.phone}</p> : null}
            </div>
            <div>
              <label htmlFor="vet-whatsapp" className={labelClass}>WhatsApp</label>
              <input
                id="vet-whatsapp"
                type="tel"
                inputMode="tel"
                maxLength={18}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className={fieldClass}
                placeholder="Con lada"
              />
            </div>
            <div>
              <label htmlFor="vet-email" className={labelClass}>Correo</label>
              <input
                id="vet-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
                placeholder="contacto@clinica.com"
              />
              {errors.email ? <p className="mt-2 text-xs text-red-600">{errors.email}</p> : null}
            </div>
            <div>
              <label htmlFor="vet-website" className={labelClass}>Sitio web</label>
              <input
                id="vet-website"
                type="url"
                inputMode="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={fieldClass}
                placeholder="www.miclinica.com"
              />
            </div>
          </div>

          <div>
            <p className={labelClass}>Detalles</p>
            <div className="flex flex-wrap gap-1.5">
              {toggles.map(([label, value, set]) => (
                <ChoiceChip key={label} label={label} selected={value} onSelect={() => set(!value)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-[#e6e9ef] bg-white px-4 py-3 dark:border-white/10 dark:bg-night-raised sm:px-6">
        <div className="mx-auto flex max-w-2xl gap-3">
          <button
            type="button"
            onClick={() => router.push(Routes.veterinaries.index)}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-[#3a3a3a] hover:bg-[#f3f5f8] dark:text-[#d0d0d0] dark:hover:bg-night"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-kadesh px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Enviando…" : "Enviar solicitud"}
          </button>
        </div>
      </div>
    </form>
  );
}
