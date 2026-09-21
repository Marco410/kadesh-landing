"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { normalizePhone } from "kadesh/components/profile/validateProfile";
import {
  SOCIAL_MEDIA_OPTIONS,
  TYPES_PET_PLACE,
  type PetPlaceTypeValue,
} from "kadesh/components/veterinaries/constants";
import {
  UPDATE_MY_PET_PLACE_MUTATION,
  type MyPetPlace,
  type UpdateMyPetPlaceResponse,
  type UpdateMyPetPlaceVariables,
} from "kadesh/components/veterinaries/queries";
import { INPUT_CLASS, LABEL_CLASS, SECTION_TITLE_CLASS } from "./formStyles";

function selectedTypeValues(place: MyPetPlace): PetPlaceTypeValue[] {
  const values = (place.types ?? [])
    .map((type) => type.value)
    .filter((value): value is PetPlaceTypeValue =>
      TYPES_PET_PLACE.some((option) => option.value === value),
    );
  return values.length > 0 ? values : ["veterinary"];
}

export default function ClinicDataForm({
  place,
  onSaved,
}: {
  place: MyPetPlace;
  onSaved: () => void;
}) {
  const [name, setName] = useState(place.name);
  const [description, setDescription] = useState(place.description ?? "");
  const [types, setTypes] = useState<PetPlaceTypeValue[]>(() =>
    selectedTypeValues(place),
  );
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
  const [typesError, setTypesError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [updatePlace, { loading }] = useMutation<
    UpdateMyPetPlaceResponse,
    UpdateMyPetPlaceVariables
  >(UPDATE_MY_PET_PLACE_MUTATION);

  const unusedNetworks = SOCIAL_MEDIA_OPTIONS.filter(
    (network) => !socialRows.some((row) => row.social_media === network),
  );

  const toggleType = (value: PetPlaceTypeValue) => {
    setTypesError(null);
    setTypes((current) => {
      if (current.includes(value)) {
        if (current.length === 1) {
          setTypesError("Deja al menos un tipo. Un negocio no puede quedar sin categoría.");
          return current;
        }
        return current.filter((item) => item !== value);
      }
      return [...current, value];
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    if (types.length === 0) {
      setTypesError("Elige al menos un tipo de negocio.");
      return;
    }
    try {
      const { data } = await updatePlace({
        variables: {
          input: {
            petPlaceId: place.id,
            name: name.trim(),
            description: description.trim(),
            types,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <h3 className={SECTION_TITLE_CLASS}>Identidad</h3>
        <div className="mt-3 space-y-3">
          <fieldset>
            <legend className={LABEL_CLASS}>
              Tipo de negocio <span className="text-red-600">*</span>
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TYPES_PET_PLACE.map((option) => {
                const selected = types.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium ${
                      selected
                        ? "border-kadesh bg-kadesh-50 text-[#121212] dark:bg-kadesh/15 dark:text-[#eef1f6]"
                        : "border-[#d8dee8] text-[#3a3a3a] dark:border-white/18 dark:text-[#d0d0d0]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleType(option.value)}
                      className="h-4 w-4 shrink-0 rounded border-[#d8dee8] text-kadesh focus:ring-kadesh"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
            {typesError ? (
              <p id="clinic-types-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
                {typesError}
              </p>
            ) : (
              <p className="mt-2 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
                Puedes marcar más de uno. Al menos uno debe quedar activo.
              </p>
            )}
          </fieldset>
          <label className="block">
            <span className={LABEL_CLASS}>
              Nombre <span className="text-red-600">*</span>
            </span>
            <input
              className={INPUT_CLASS}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className={LABEL_CLASS}>
              Descripción <span className="text-red-600">*</span>
            </span>
            <textarea
              className={`${INPUT_CLASS} min-h-[5.5rem] resize-none`}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>
        </div>
      </section>

      <section>
        <h3 className={SECTION_TITLE_CLASS}>Contacto</h3>
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={LABEL_CLASS}>Teléfono</span>
              <input className={INPUT_CLASS} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="block">
              <span className={LABEL_CLASS}>WhatsApp</span>
              <input className={INPUT_CLASS} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={LABEL_CLASS}>Correo</span>
              <input
                className={INPUT_CLASS}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block">
              <span className={LABEL_CLASS}>Sitio web</span>
              <input className={INPUT_CLASS} value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>
          <div>
            <p className={LABEL_CLASS}>Redes</p>
            <div className="space-y-2">
              {socialRows.map((row, index) => (
                <div key={`${row.social_media}-${index}`} className="flex flex-col gap-2 sm:flex-row">
                  <select
                    className={`${INPUT_CLASS} sm:max-w-[9.5rem] sm:shrink-0`}
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
                      className="inline-flex min-h-11 shrink-0 items-center justify-center text-sm font-semibold text-[#5a5a5a] hover:text-red-600"
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
                className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-kadesh hover:underline"
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
        </div>
      </section>

      <section>
        <h3 className={SECTION_TITLE_CLASS}>Dirección</h3>
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className={LABEL_CLASS}>Calle</span>
            <input className={INPUT_CLASS} value={street} onChange={(e) => setStreet(e.target.value)} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={LABEL_CLASS}>Municipio</span>
              <input className={INPUT_CLASS} value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
            </label>
            <label className="block">
              <span className={LABEL_CLASS}>Estado</span>
              <input className={INPUT_CLASS} value={state} onChange={(e) => setState(e.target.value)} />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={LABEL_CLASS}>C.P.</span>
              <input className={INPUT_CLASS} value={cp} onChange={(e) => setCp(e.target.value)} />
            </label>
            <label className="block">
              <span className={LABEL_CLASS}>Dirección</span>
              <input className={INPUT_CLASS} value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>
          </div>
        </div>
      </section>

      <section>
        <h3 className={SECTION_TITLE_CLASS}>Cómo atienden</h3>
        <div className="mt-3 space-y-1">
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
        </div>
      </section>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          Datos actualizados.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Guardando…" : "Guardar datos"}
      </button>
    </form>
  );
}
