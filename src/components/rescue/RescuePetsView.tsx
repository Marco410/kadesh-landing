"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Home01Icon, Image01Icon, InjectionIcon, Notification01Icon } from "@hugeicons/core-free-icons";
import {
  DashEmptyState,
  DashErrorState,
  DashFilterChips,
  DashLoadMore,
  DashLoadingRows,
  dashButtonClass,
} from "kadesh/components/app-shell";
import { getStatusColor, getStatusLabel } from "kadesh/components/animals/constants";
import {
  DUE_TONE_CLASS,
  PET_SEARCH_PARAM,
  PetDetailView,
  PetFormModal,
  dueTone,
  formatDay,
  relativeDueLabel,
} from "kadesh/components/pets";
import { useUser } from "kadesh/utils/UserContext";
import { PET_RESCUE_STAGE_OPTIONS, RESCUE_ORG_STATUS, canPublishForRescue, rescueStage } from "./constants";
import { RESCUE_PETS_QUERY, rescuePetsWhere, type RescuePetsResponse } from "./queries";
import RescuePetPanel from "./RescuePetPanel";
import type { RescueOrganization, RescuePetRow } from "./types";

const PAGE_SIZE = 30;
type Filter = "all" | string;

function PetRow({ pet, onOpen }: { pet: RescuePetRow; onOpen: () => void }) {
  const photo = pet.multimedia[0]?.image?.url;
  const stage = rescueStage(pet.stage);
  const reportStatus = pet.publicReport?.logs[0]?.status;
  const next = pet.reminders[0];
  const facts = [
    pet.animal_type?.name,
    pet.animal_breed?.breed,
    pet.intakeDate ? `Llegó el ${formatDay(pet.intakeDate)}` : null,
  ].filter(Boolean);

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-dash-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400"
      >
        <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-dash-surface-2 text-dash-muted">
          {photo ? (
            <Image src={photo} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <HugeiconsIcon icon={Image01Icon} size={20} aria-hidden />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-dash-ink">{pet.name}</span>
            {stage ? (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${stage.tone}`}>{stage.label}</span>
            ) : null}
            {reportStatus ? (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 text-white"
                style={{ backgroundColor: getStatusColor(reportStatus) }}
                title="Estado de su reporte público"
              >
                {getStatusLabel(reportStatus)}
              </span>
            ) : null}
          </span>
          {facts.length ? <span className="mt-0.5 block truncate text-[13px] text-dash-muted">{facts.join(" · ")}</span> : null}
          {pet.fosterMember?.userName ? (
            <span className="mt-0.5 flex items-center gap-1 text-[13px] text-dash-muted">
              <HugeiconsIcon icon={Home01Icon} size={14} strokeWidth={1.8} aria-hidden />
              Hogar temporal: {pet.fosterMember.userName}
            </span>
          ) : null}
          {next ? (
            <span className={`mt-1 flex items-start gap-1 text-xs font-semibold ${DUE_TONE_CLASS[dueTone(next.dueDate)]}`}>
              <HugeiconsIcon icon={Notification01Icon} size={14} strokeWidth={1.8} className="mt-px shrink-0" aria-hidden />
              <span className="break-words">
                {next.title} · {formatDay(next.dueDate)} ({relativeDueLabel(next.dueDate).toLowerCase()})
              </span>
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

/**
 * «Fichas»: la cartilla interna de cada animal del espacio (vacunas, recordatorios, etapa, hogar
 * temporal). Con `&pet=<id>` abre la ficha: la misma cartilla de las familias más el panel del
 * espacio (`RescuePetPanel`). Quien es hogar temporal solo recibe las suyas (lo recorta el backend).
 */
export default function RescuePetsView({ org }: { org: RescueOrganization }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const openPetId = searchParams.get(PET_SEARCH_PARAM);
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const where = useMemo(() => rescuePetsWhere(org.id), [org.id]);
  const { data, loading, error, fetchMore, refetch } = useQuery<RescuePetsResponse>(RESCUE_PETS_QUERY, {
    variables: { where, take: PAGE_SIZE, skip: 0 },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    skip: Boolean(openPetId),
  });

  const closed = org.status === RESCUE_ORG_STATUS.REJECTED || org.status === RESCUE_ORG_STATUS.SUSPENDED;
  const canCreate = canPublishForRescue(org.viewerRole) && !closed;

  const openPet = (petId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (petId) params.set(PET_SEARCH_PARAM, petId);
    else params.delete(PET_SEARCH_PARAM);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const pets = useMemo(() => data?.pets ?? [], [data?.pets]);
  const total = data?.petsCount ?? 0;
  const counts = useMemo(() => {
    const byStage = new Map<string, number>();
    for (const pet of pets) if (pet.stage) byStage.set(pet.stage, (byStage.get(pet.stage) ?? 0) + 1);
    return byStage;
  }, [pets]);
  // Si la etapa elegida se quedó sin fichas (p. ej. tras un cambio), vuelve a «Todas».
  const activeFilter = filter !== "all" && !counts.has(filter) ? "all" : filter;
  const visible = activeFilter === "all" ? pets : pets.filter((pet) => pet.stage === activeFilter);

  if (openPetId) {
    if (!user?.id) return <DashLoadingRows rows={3} label="Cargando ficha" />;
    return (
      <PetDetailView
        petId={openPetId}
        userId={user.id}
        onBack={() => openPet(null)}
        backLabel="Fichas"
        renderRescuePanel={(pet) => <RescuePetPanel org={org} pet={pet} onLeft={() => openPet(null)} />}
      />
    );
  }

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { skip: pets.length },
        updateQuery: (previous, { fetchMoreResult }) =>
          fetchMoreResult ? { ...fetchMoreResult, pets: [...previous.pets, ...fetchMoreResult.pets] } : previous,
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const createButton = canCreate ? (
    <button type="button" onClick={() => setCreating(true)} className={dashButtonClass({ variant: "primary", size: "sm" })}>
      <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} aria-hidden />
      Nueva ficha
    </button>
  ) : null;
  const createModal = canCreate ? (
    <PetFormModal
      isOpen={creating}
      onClose={() => setCreating(false)}
      organization={{ id: org.id, name: org.name }}
      onSaved={(petId) => openPet(petId)}
    />
  ) : null;

  if (loading && pets.length === 0) return <DashLoadingRows rows={4} label="Cargando fichas" />;

  if (error && pets.length === 0) {
    return (
      <DashErrorState
        message="No pudimos cargar las fichas del espacio."
        action={
          <button type="button" onClick={() => refetch()} className={dashButtonClass({ variant: "outline", size: "sm" })}>
            Reintentar
          </button>
        }
      />
    );
  }

  if (pets.length === 0) {
    return (
      <>
        <DashEmptyState
          icon={InjectionIcon}
          title={canCreate ? "Aún no hay fichas" : "No tienes fichas asignadas"}
          description={
            canCreate
              ? "Crea la ficha de cada animal que tienen a su cargo para llevar sus vacunas, desparasitaciones y recordatorios. También puedes crearla desde un animal publicado («Crear ficha»)."
              : "Cuando te asignen un animal en tu hogar temporal, su ficha aparecerá aquí."
          }
          action={createButton}
        />
        {createModal}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DashFilterChips<Filter>
          label="Etapa"
          value={activeFilter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Todas", count: pets.length },
            ...PET_RESCUE_STAGE_OPTIONS.filter((option) => counts.has(option.value)).map((option) => ({
              value: option.value,
              label: option.label,
              count: counts.get(option.value) ?? 0,
            })),
          ]}
        />
        {createButton}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl bg-dash-surface-2 px-4 py-6 text-center text-sm text-dash-muted">
          Ninguna ficha cargada en esa etapa.
        </p>
      ) : (
        <ul className="-mx-2 divide-y divide-dash-line">
          {visible.map((pet) => (
            <PetRow key={pet.id} pet={pet} onOpen={() => openPet(pet.id)} />
          ))}
        </ul>
      )}

      {pets.length < total ? <DashLoadMore onClick={loadMore} loading={loadingMore} /> : null}
      {createModal}
    </div>
  );
}
