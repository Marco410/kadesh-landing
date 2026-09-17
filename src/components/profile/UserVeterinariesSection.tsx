"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  HospitalLocationIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { veterinaryDetailHref } from "kadesh/components/veterinaries/petPlaceSlug";
import VerifiedBadge from "kadesh/components/veterinaries/VerifiedBadge";
import { normalizePhone } from "kadesh/components/profile/validateProfile";
import {
  GET_MY_PET_PLACES_QUERY,
  UPDATE_MY_PET_PLACE_MUTATION,
  type GetMyPetPlacesResponse,
  type GetMyPetPlacesVariables,
  type MyPetPlace,
  type UpdateMyPetPlaceResponse,
  type UpdateMyPetPlaceVariables,
} from "kadesh/components/veterinaries/queries";
import {
  PET_PLACE_CLAIM_STATUS,
  SOCIAL_MEDIA_OPTIONS,
} from "kadesh/components/veterinaries/constants";
import { claimWhatsAppUrl } from "kadesh/components/veterinaries/claimWhatsApp";

const INPUT_CLASS =
  "w-full rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2]";

function statusLabel(place: MyPetPlace): { label: string; className: string } {
  if (place.verified || place.claimStatus === PET_PLACE_CLAIM_STATUS.VERIFIED) {
    return { label: "Verificada", className: "bg-green-600 text-white" };
  }
  if (place.claimStatus === PET_PLACE_CLAIM_STATUS.REJECTED) {
    return { label: "Rechazada", className: "bg-[#3a3a3a] text-white" };
  }
  return { label: "En revisión", className: "bg-amber-500 text-white" };
}

function ClinicEditor({
  place,
  onSaved,
}: {
  place: MyPetPlace;
  onSaved: () => void;
}) {
  const [name, setName] = useState(place.name);
  const [description, setDescription] = useState(place.description ?? "");
  const [phone, setPhone] = useState(place.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(place.whatsapp ?? "");
  const [email, setEmail] = useState(place.email ?? "");
  const [website, setWebsite] = useState(place.website ?? "");
  const [street, setStreet] = useState(place.street ?? "");
  const [municipality, setMunicipality] = useState(place.municipality ?? "");
  const [state, setState] = useState(place.state ?? "");
  const [cp, setCp] = useState(place.cp ?? "");
  const [address, setAddress] = useState(place.address ?? "");
  const [emergencies, setEmergencies] = useState(Boolean(place.emergencies));
  const [parking, setParking] = useState(Boolean(place.parking));
  const [appointmentRequired, setAppointmentRequired] = useState(
    Boolean(place.appointmentRequired),
  );
  const [socialRows, setSocialRows] = useState<
    Array<{ social_media: string; link: string }>
  >(
    place.pet_place_social_media.length > 0
      ? place.pet_place_social_media.map((item) => ({
          social_media: item.social_media || "Instagram",
          link: item.link ?? "",
        }))
      : [{ social_media: "Instagram", link: "" }],
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [updatePlace, { loading }] = useMutation<
    UpdateMyPetPlaceResponse,
    UpdateMyPetPlaceVariables
  >(UPDATE_MY_PET_PLACE_MUTATION);

  const unusedNetworks = SOCIAL_MEDIA_OPTIONS.filter(
    (network) => !socialRows.some((row) => row.social_media === network),
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    try {
      const { data } = await updatePlace({
        variables: {
          input: {
            petPlaceId: place.id,
            name: name.trim(),
            description: description.trim(),
            phone: normalizePhone(phone),
            whatsapp: normalizePhone(whatsapp),
            email: email.trim(),
            website: website.trim(),
            street: street.trim(),
            municipality: municipality.trim(),
            state: state.trim(),
            cp: cp.trim(),
            address: address.trim(),
            emergencies,
            parking,
            appointmentRequired,
            socialMedia: socialRows
              .filter((row) => row.link.trim())
              .map((row) => ({
                social_media: row.social_media,
                link: row.link.trim(),
              })),
          },
        },
      });
      const result = data?.updateMyPetPlace;
      if (!result?.success) {
        setError(result?.message ?? "No pudimos guardar.");
        return;
      }
      setSaved(true);
      onSaved();
    } catch {
      setError("No pudimos guardar. Intenta de nuevo.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-[#ececec] pt-4 dark:border-white/10">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
          Nombre
        </span>
        <input className={INPUT_CLASS} value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
          Descripción
        </span>
        <textarea
          className={`${INPUT_CLASS} resize-none`}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Teléfono
          </span>
          <input className={INPUT_CLASS} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            WhatsApp
          </span>
          <input className={INPUT_CLASS} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Correo
          </span>
          <input
            className={INPUT_CLASS}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Sitio web
          </span>
          <input className={INPUT_CLASS} value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
          Redes
        </p>
        <div className="space-y-2">
          {socialRows.map((row, index) => (
            <div key={`${row.social_media}-${index}`} className="flex gap-2">
              <select
                className={`${INPUT_CLASS} max-w-[9.5rem] shrink-0`}
                value={row.social_media}
                onChange={(event) => {
                  const next = [...socialRows];
                  next[index] = { ...row, social_media: event.target.value };
                  setSocialRows(next);
                }}
              >
                {SOCIAL_MEDIA_OPTIONS.filter(
                  (network) =>
                    network === row.social_media ||
                    !socialRows.some((item) => item.social_media === network),
                ).map((network) => (
                  <option key={network} value={network}>
                    {network}
                  </option>
                ))}
              </select>
              <input
                className={INPUT_CLASS}
                placeholder="https://"
                value={row.link}
                onChange={(event) => {
                  const next = [...socialRows];
                  next[index] = { ...row, link: event.target.value };
                  setSocialRows(next);
                }}
              />
              {socialRows.length > 1 ? (
                <button
                  type="button"
                  className="shrink-0 text-sm font-semibold text-[#5a5a5a] hover:text-red-600"
                  onClick={() =>
                    setSocialRows(socialRows.filter((_, itemIndex) => itemIndex !== index))
                  }
                >
                  Quitar
                </button>
              ) : null}
            </div>
          ))}
        </div>
        {unusedNetworks.length > 0 ? (
          <button
            type="button"
            className="mt-2 text-sm font-semibold text-kadesh hover:underline"
            onClick={() => {
              const nextNetwork = unusedNetworks[0];
              if (!nextNetwork) return;
              setSocialRows([
                ...socialRows,
                { social_media: nextNetwork, link: "" },
              ]);
            }}
          >
            Agregar red
          </button>
        ) : null}
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
          Calle
        </span>
        <input className={INPUT_CLASS} value={street} onChange={(e) => setStreet(e.target.value)} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Municipio
          </span>
          <input className={INPUT_CLASS} value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Estado
          </span>
          <input className={INPUT_CLASS} value={state} onChange={(e) => setState(e.target.value)} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            C.P.
          </span>
          <input className={INPUT_CLASS} value={cp} onChange={(e) => setCp(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Dirección
          </span>
          <input className={INPUT_CLASS} value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-[#121212] dark:text-[#eef1f6]">
        <input
          type="checkbox"
          checked={emergencies}
          onChange={(e) => setEmergencies(e.target.checked)}
          className="h-4 w-4 rounded border-[#d8dee8] text-kadesh focus:ring-kadesh"
        />
        Atiende urgencias 24/7
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-[#121212] dark:text-[#eef1f6]">
        <input
          type="checkbox"
          checked={parking}
          onChange={(e) => setParking(e.target.checked)}
          className="h-4 w-4 rounded border-[#d8dee8] text-kadesh focus:ring-kadesh"
        />
        Tiene estacionamiento
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-[#121212] dark:text-[#eef1f6]">
        <input
          type="checkbox"
          checked={appointmentRequired}
          onChange={(e) => setAppointmentRequired(e.target.checked)}
          className="h-4 w-4 rounded border-[#d8dee8] text-kadesh focus:ring-kadesh"
        />
        Atiende solo con cita
      </label>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      {saved ? (
        <p className="text-sm font-medium text-green-700 dark:text-green-400">Datos actualizados.</p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

export default function UserVeterinariesSection({ userId }: { userId: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, loading, refetch } = useQuery<
    GetMyPetPlacesResponse,
    GetMyPetPlacesVariables
  >(GET_MY_PET_PLACES_QUERY, {
    variables: {
      where: { user: { id: { equals: userId } } },
      orderBy: [{ createdAt: "desc" }],
    },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });

  const places = data?.petPlaces ?? [];

  if (loading && places.length === 0) {
    return (
      <div className="space-y-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-2xl bg-[#e6e9ef] dark:bg-white/10"
          />
        ))}
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised">
        <p className="font-semibold text-[#121212] dark:text-[#eef1f6]">
          Aún no tienes una clínica
        </p>
        <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
          Busca tu ficha en el directorio y reclámala. Validamos por WhatsApp y luego podrás editar los datos.
        </p>
        <Link
          href={Routes.veterinaries.index}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
        >
          Ir al directorio
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {places.map((place) => {
        const status = statusLabel(place);
        const canEdit =
          Boolean(place.verified) ||
          place.claimStatus === PET_PLACE_CLAIM_STATUS.VERIFIED;
        const open = openId === place.id;
        return (
          <li
            key={place.id}
            className="rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kadesh-50 text-kadesh dark:bg-kadesh/15">
                <HugeiconsIcon icon={HospitalLocationIcon} size={22} strokeWidth={1.5} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="flex min-w-0 items-center gap-1.5 truncate font-semibold text-[#121212] dark:text-[#eef1f6]">
                    <span className="truncate">{place.name}</span>
                    {canEdit ? <VerifiedBadge size={16} /> : null}
                  </p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                  {[place.municipality, place.state].filter(Boolean).join(", ") || "Sin ubicación"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={veterinaryDetailHref(place)}
                    className="inline-flex min-h-11 items-center rounded-xl border-2 border-kadesh px-3 text-sm font-semibold text-kadesh hover:bg-kadesh hover:text-white"
                  >
                    Ver ficha
                  </Link>
                  {canEdit ? (
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenId(open ? null : place.id)}
                      className="inline-flex min-h-11 items-center rounded-xl bg-kadesh px-3 text-sm font-semibold text-white hover:bg-kadesh-600"
                    >
                      {open ? "Cerrar" : "Editar datos"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          claimWhatsAppUrl({
                            placeName: place.name,
                            placeId: place.id,
                            role: "owner",
                            phone: place.claimPhone || "",
                          }),
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-kadesh px-3 text-sm font-semibold text-white hover:bg-kadesh-600"
                    >
                      <HugeiconsIcon icon={WhatsappIcon} size={16} strokeWidth={1.5} />
                      Validar por WhatsApp
                    </button>
                  )}
                </div>
                {canEdit && open ? (
                  <ClinicEditor place={place} onSaved={() => refetch()} />
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
