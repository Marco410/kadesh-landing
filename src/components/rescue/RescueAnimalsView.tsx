"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Image01Icon, Megaphone01Icon } from "@hugeicons/core-free-icons";
import {
  DashEmptyState,
  DashErrorState,
  DashFilterChips,
  DashLoadMore,
  DashLoadingRows,
  dashButtonClass,
} from "kadesh/components/app-shell";
import { animalDetailHref } from "kadesh/components/animals/animalSlug";
import { getStatusColor, getStatusLabel } from "kadesh/components/animals/constants";
import { Routes } from "kadesh/core/routes";
import { formatDateShort } from "kadesh/utils/format-date";
import { RESCUE_ORG_STATUS, canPublishForRescue } from "./constants";
import {
  CONVERT_ANIMAL_TO_PET_MUTATION,
  RESCUE_ORG_ANIMALS_QUERY,
  rescueAnimalsWhere,
  type ConvertAnimalToPetResponse,
  type RescueOrgAnimalsResponse,
} from "./queries";
import type { RescueAnimalRow, RescueOrganization } from "./types";
import { animalDisplayName, animalNameSource } from "kadesh/components/animals/animalName";

const PAGE_SIZE = 30;

type Filter = "all" | "active" | "in_adoption" | "home";

/** Con hogar: ya no necesitan nada del espacio. */
const HOME_STATUSES = ["adopted", "in_family"];

function currentStatus(animal: RescueAnimalRow): string {
  return animal.logs[0]?.status ?? "register";
}

function matches(filter: Filter, status: string): boolean {
  if (filter === "all") return true;
  if (filter === "in_adoption") return status === "in_adoption";
  if (filter === "home") return HOME_STATUSES.includes(status);
  return !HOME_STATUSES.includes(status);
}

/**
 * Animales publicados a nombre del espacio. El filtro va sobre lo cargado (el estado actual sale de
 * la bitácora y no se puede pedir al API por estado). Editar abre el formulario de siempre: el
 * backend deja editar al equipo (admin, coordinador y voluntario).
 */
export default function RescueAnimalsView({ org }: { org: RescueOrganization }) {
  const router = useRouter();
  const client = useApolloClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [convert] = useMutation<ConvertAnimalToPetResponse>(CONVERT_ANIMAL_TO_PET_MUTATION);
  const where = useMemo(() => rescueAnimalsWhere(org.id), [org.id]);
  const { data, loading, error, fetchMore, refetch } = useQuery<RescueOrgAnimalsResponse>(RESCUE_ORG_ANIMALS_QUERY, {
    variables: { where, take: PAGE_SIZE, skip: 0 },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const [loadingMore, setLoadingMore] = useState(false);

  const animals = useMemo(() => data?.animals ?? [], [data?.animals]);
  const total = data?.animalsCount ?? 0;
  const closed = org.status === RESCUE_ORG_STATUS.REJECTED || org.status === RESCUE_ORG_STATUS.SUSPENDED;
  const canPublish = canPublishForRescue(org.viewerRole) && !closed;

  const counts = useMemo(() => {
    const statuses = animals.map(currentStatus);
    return {
      all: animals.length,
      active: statuses.filter((status) => matches("active", status)).length,
      in_adoption: statuses.filter((status) => matches("in_adoption", status)).length,
      home: statuses.filter((status) => matches("home", status)).length,
    };
  }, [animals]);
  const visible = animals.filter((animal) => matches(filter, currentStatus(animal)));

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { skip: animals.length },
        updateQuery: (previous, { fetchMoreResult }) =>
          fetchMoreResult
            ? { ...fetchMoreResult, animals: [...previous.animals, ...fetchMoreResult.animals] }
            : previous,
      });
    } finally {
      setLoadingMore(false);
    }
  };

  /** «Crear ficha»: la cartilla interna del animal, con sus datos y fotos del reporte. */
  const createPet = async (animal: RescueAnimalRow) => {
    setConvertingId(animal.id);
    try {
      const result = await convert({ variables: { animalId: animal.id, organizationId: org.id } });
      const payload = result.data?.convertAnimalToPet;
      if (!payload?.success || !payload.petId) {
        sileo.error({ title: "No se pudo crear la ficha", description: payload?.message });
        return;
      }
      sileo.success({ title: payload.message, description: "Ya puedes llevar sus vacunas y recordatorios." });
      await client.refetchQueries({ include: ["RescueOrganizationAnimals"] });
      router.replace(Routes.profileRescuePet(org.id, payload.petId), { scroll: false });
    } catch {
      sileo.error({ title: "No se pudo crear la ficha", description: "Revisa tu conexión e intenta de nuevo." });
    } finally {
      setConvertingId(null);
    }
  };

  const publishLink = canPublish ? (
    <Link href={Routes.animals.newForRescue(org.id)} className={dashButtonClass({ variant: "primary", size: "sm" })}>
      <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} aria-hidden />
      Publicar animal
    </Link>
  ) : null;

  if (loading && animals.length === 0) return <DashLoadingRows rows={4} label="Cargando animales" />;

  if (error && animals.length === 0) {
    return (
      <DashErrorState
        message="No pudimos cargar los animales del espacio."
        action={
          <button type="button" onClick={() => refetch()} className={dashButtonClass({ variant: "outline", size: "sm" })}>
            Reintentar
          </button>
        }
      />
    );
  }

  if (animals.length === 0) {
    return (
      <DashEmptyState
        icon={Megaphone01Icon}
        title="Aún no hay animales del espacio"
        description="Publica un rescate o un animal en adopción y elige tu organización en «Publicar como». Tu equipo podrá actualizarlo."
        action={publishLink}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DashFilterChips<Filter>
          label="Mostrar"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Todos", count: counts.all },
            { value: "active", label: "Buscan hogar", count: counts.active },
            { value: "in_adoption", label: "En adopción", count: counts.in_adoption },
            { value: "home", label: "Con hogar", count: counts.home },
          ]}
        />
        {publishLink}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl bg-dash-surface-2 px-4 py-6 text-center text-sm text-dash-muted">
          Ningún animal cargado con ese filtro.
        </p>
      ) : (
        <ul className="divide-y divide-dash-line">
          {visible.map((animal) => {
            const status = currentStatus(animal);
            const photo = animal.multimedia[0]?.image?.url;
            const log = animal.logs[0];
            return (
              <li key={animal.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-dash-surface-2 text-dash-muted">
                  {photo ? (
                    <Image src={photo} alt="" fill sizes="56px" className="object-cover" />
                  ) : (
                    <HugeiconsIcon icon={Image01Icon} size={20} aria-hidden />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Link
                      href={animalDetailHref(animal)}
                      className="truncate font-semibold text-dash-ink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400 rounded"
                    >
                      {animalDisplayName(animalNameSource(animal))}
                    </Link>
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 text-white"
                      style={{ backgroundColor: getStatusColor(status) }}
                    >
                      {getStatusLabel(status)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[13px] text-dash-muted">
                    {[
                      animal.animal_type?.name,
                      log?.city,
                      formatDateShort(log?.date_status ?? animal.createdAt ?? null, false),
                      animal.user?.name ? `Publicó ${animal.user.name}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {canPublish ? (
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    {animal.pet ? (
                      <Link
                        href={Routes.profileRescuePet(org.id, animal.pet.id)}
                        className={dashButtonClass({ variant: "ghost", size: "sm" })}
                        aria-label={`Ver la ficha de ${animalDisplayName(animalNameSource(animal))}`}
                      >
                        Ver ficha
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => createPet(animal)}
                        disabled={convertingId !== null}
                        className={dashButtonClass({ variant: "ghost", size: "sm" })}
                        aria-label={`Crear la ficha de ${animalDisplayName(animalNameSource(animal))}`}
                      >
                        {convertingId === animal.id ? "Creando…" : "Crear ficha"}
                      </button>
                    )}
                    <Link
                      href={Routes.animals.edit(animal.slug || animal.id)}
                      className={dashButtonClass({ variant: "outline", size: "sm" })}
                      aria-label={`Actualizar a ${animalDisplayName(animalNameSource(animal))}`}
                    >
                      Actualizar
                    </Link>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {animals.length < total ? <DashLoadMore onClick={loadMore} loading={loadingMore} /> : null}
    </div>
  );
}
