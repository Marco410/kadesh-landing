"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import {
  GET_PET_PLACE_SERVICES_QUERY,
  REQUEST_PET_PLACE_SERVICE_MUTATION,
  UPDATE_MY_PET_PLACE_MUTATION,
  type GetPetPlaceServicesResponse,
  type MyPetPlace,
  type PetPlaceServiceCatalogItem,
  type RequestPetPlaceServiceResponse,
  type RequestPetPlaceServiceVariables,
  type UpdateMyPetPlaceResponse,
  type UpdateMyPetPlaceVariables,
} from "kadesh/components/veterinaries/queries";
import { INPUT_CLASS, LABEL_CLASS } from "./formStyles";

function isApprovedCatalogItem(service: PetPlaceServiceCatalogItem): boolean {
  if (service.active === false) return false;
  if (service.status && service.status !== "approved") return false;
  return Boolean(service.name?.trim());
}

export default function ClinicServicesForm({
  place,
  onSaved,
}: {
  place: MyPetPlace;
  onSaved: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    place.services?.map((service) => service.id) ?? [],
  );
  const [query, setQuery] = useState("");
  const [requestName, setRequestName] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [requested, setRequested] = useState(false);

  const { data, loading: loadingCatalog } = useQuery<GetPetPlaceServicesResponse>(
    GET_PET_PLACE_SERVICES_QUERY,
    { fetchPolicy: "cache-and-network" },
  );

  const [updatePlace, { loading }] = useMutation<
    UpdateMyPetPlaceResponse,
    UpdateMyPetPlaceVariables
  >(UPDATE_MY_PET_PLACE_MUTATION);

  const [requestService, { loading: requesting }] = useMutation<
    RequestPetPlaceServiceResponse,
    RequestPetPlaceServiceVariables
  >(REQUEST_PET_PLACE_SERVICE_MUTATION);

  const catalog = (data?.petPlaceServices ?? []).filter(isApprovedCatalogItem);
  const pending = (place.requested_services ?? []).filter(
    (service) => service.status === "pending",
  );

  const selected = useMemo(
    () => catalog.filter((service) => selectedIds.includes(service.id)),
    [catalog, selectedIds],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pool = catalog.filter((service) => !selectedIds.includes(service.id));
    if (!needle) return pool;
    return pool.filter((service) => {
      const haystack = `${service.name ?? ""} ${service.description ?? ""}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [catalog, query, selectedIds]);

  const toggle = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
    setSaved(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    try {
      const { data: resultData } = await updatePlace({
        variables: {
          input: {
            petPlaceId: place.id,
            serviceIds: selectedIds,
          },
        },
      });
      const result = resultData?.updateMyPetPlace;
      if (!result?.success) {
        setError(result?.message ?? "No pudimos guardar los servicios.");
        return;
      }
      setSaved(true);
      onSaved();
    } catch {
      setError("No pudimos guardar los servicios. Intenta de nuevo.");
    }
  };

  const handleRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setRequested(false);
    const name = requestName.trim();
    if (name.length < 3) {
      setError("Escribe el nombre del servicio (al menos 3 letras).");
      return;
    }
    try {
      const { data: resultData } = await requestService({
        variables: {
          input: {
            petPlaceId: place.id,
            name,
            description: requestDescription.trim() || undefined,
          },
        },
      });
      const result = resultData?.requestPetPlaceService;
      if (!result?.success) {
        setError(result?.message ?? "No pudimos enviar la solicitud.");
        return;
      }
      setRequestName("");
      setRequestDescription("");
      setRequested(true);
      onSaved();
    } catch {
      setError("No pudimos enviar la solicitud. Intenta de nuevo.");
    }
  };

  if (loadingCatalog && catalog.length === 0) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-11 animate-pulse rounded-xl bg-[#e6e9ef] dark:bg-white/10"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-3">
        {selected.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5a5a5a] dark:text-[#9aa3b2]">
              En tu ficha ({selected.length})
            </p>
            <ul className="flex flex-wrap gap-2">
              {selected.map((service) => (
                <li key={service.id}>
                  <button
                    type="button"
                    onClick={() => toggle(service.id)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-kadesh-50 px-3 text-sm font-semibold text-kadesh hover:bg-kadesh-100 dark:bg-kadesh/20 dark:text-kadesh-200"
                    aria-label={`Quitar ${service.name}`}
                  >
                    {service.name}
                    <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            Aún no marcas ninguno. No es obligatorio.
          </p>
        )}

        <label className="relative block">
          <span className="sr-only">Buscar servicio</span>
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a5a]"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar en el catálogo"
            className={`${INPUT_CLASS} pl-10`}
          />
        </label>

        <ul className="max-h-64 overflow-y-auto rounded-xl border border-[#ececec] dark:border-white/10">
          {filtered.length === 0 ? (
            <li className="px-3 py-3 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
              {query.trim()
                ? "Nada coincide. Pídelo abajo para que lo revisemos."
                : "Ya marcaste todos o el catálogo está vacío."}
            </li>
          ) : (
            filtered.map((service) => (
              <li key={service.id} className="border-b border-[#ececec] last:border-b-0 dark:border-white/10">
                <label
                  className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2"
                  title={service.description ?? undefined}
                >
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggle(service.id)}
                    className="h-4 w-4 shrink-0 rounded border-[#d8dee8] text-kadesh focus:ring-kadesh"
                  />
                  <span className="min-w-0 text-sm font-medium text-[#121212] dark:text-[#eef1f6]">
                    {service.name}
                  </span>
                </label>
              </li>
            ))
          )}
        </ul>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:opacity-60 sm:w-auto"
        >
          {loading ? "Guardando…" : "Guardar servicios"}
        </button>
      </form>

      {pending.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            En revisión
          </p>
          <ul className="space-y-1 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
            {pending.map((service) => (
              <li key={service.id} className="rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-500/10">
                {service.name}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            No salen en la ficha hasta que los aceptemos.
          </p>
        </div>
      ) : null}

      <form
        onSubmit={handleRequest}
        className="space-y-3 rounded-xl border border-dashed border-[#d8dee8] p-3 dark:border-white/18"
      >
        <p className="text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
          ¿No está lo que ofreces?
        </p>
        <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
          Pídelo. Lo revisamos y, si aplica, aparece en el catálogo para todas las clínicas.
        </p>
        <label className="block">
          <span className={LABEL_CLASS}>Nombre del servicio</span>
          <input
            value={requestName}
            onChange={(event) => setRequestName(event.target.value)}
            className={INPUT_CLASS}
            placeholder="Ej. Odontología veterinaria"
          />
        </label>
        <label className="block">
          <span className={LABEL_CLASS}>Qué incluye (opcional)</span>
          <textarea
            value={requestDescription}
            onChange={(event) => setRequestDescription(event.target.value)}
            rows={2}
            className={INPUT_CLASS}
          />
        </label>
        <button
          type="submit"
          disabled={requesting}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh hover:bg-kadesh hover:text-white disabled:opacity-60 sm:w-auto"
        >
          {requesting ? "Enviando…" : "Pedir este servicio"}
        </button>
        {requested ? (
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            Solicitud enviada. Te aparece aquí en revisión.
          </p>
        ) : null}
      </form>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          Servicios actualizados.
        </p>
      ) : null}
    </div>
  );
}
