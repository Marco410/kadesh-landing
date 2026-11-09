"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApolloClient, useQuery } from "@apollo/client";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import {
  DashEmptyState,
  DashErrorState,
  DashFilterChips,
  DashLoadMore,
  DashLoadingRows,
  dashButtonClass,
} from "kadesh/components/app-shell";
import {
  ADOPTION_OPEN_STATUSES,
  ADOPTION_PAGE_SIZE,
  AdoptionApplicationList,
  RESCUE_ADOPTION_APPLICATIONS_QUERY,
  rescueAdoptionWhere,
  type AdoptionListChange,
  type RescueAdoptionApplicationsResponse,
} from "kadesh/components/adoption";
import { Routes } from "kadesh/core/routes";
import { canManageRescueAnimals, canPublishForRescue } from "./constants";
import type { RescueOrganization } from "./types";

type Filter = "open" | "all";

/**
 * Solicitudes de adopción de los animales del espacio (`vista=solicitudes`). Las revisan admin,
 * coordinación y voluntariado; la adopción la completan admin y coordinación (igual que el backend).
 * Hogar temporal solo las ve.
 */
export default function RescueApplicationsView({ org }: { org: RescueOrganization }) {
  const client = useApolloClient();
  const [filter, setFilter] = useState<Filter>("open");
  const [loadingMore, setLoadingMore] = useState(false);
  const variables = useMemo(
    () => ({
      where: rescueAdoptionWhere(org.id, filter === "open" ? ADOPTION_OPEN_STATUSES : undefined),
      openWhere: rescueAdoptionWhere(org.id, ADOPTION_OPEN_STATUSES),
      allWhere: rescueAdoptionWhere(org.id),
      take: ADOPTION_PAGE_SIZE,
      skip: 0,
    }),
    [org.id, filter],
  );
  const { data, previousData, loading, error, fetchMore, refetch } = useQuery<RescueAdoptionApplicationsResponse>(
    RESCUE_ADOPTION_APPLICATIONS_QUERY,
    { variables, fetchPolicy: "cache-and-network", notifyOnNetworkStatusChange: true },
  );

  const applications = useMemo(() => data?.adoptionApplications ?? [], [data?.adoptionApplications]);
  // Los conteos no cambian al cambiar de filtro: mientras llega la otra lista se quedan los anteriores.
  const counts = data ?? previousData;
  const openCount = counts?.openCount ?? 0;
  const allCount = counts?.allCount ?? 0;
  const total = filter === "open" ? openCount : allCount;
  const canReview = canPublishForRescue(org.viewerRole);
  const canComplete = canManageRescueAnimals(org.viewerRole);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { skip: applications.length },
        updateQuery: (previous, { fetchMoreResult }) =>
          fetchMoreResult
            ? {
                ...fetchMoreResult,
                adoptionApplications: [...previous.adoptionApplications, ...fetchMoreResult.adoptionApplications],
              }
            : previous,
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const handleChanged = async (change: AdoptionListChange) => {
    await refetch();
    if (change.completed) {
      // El animal quedó «Adoptado» y su ficha salió del espacio: cifras, publicados y fichas.
      await client.refetchQueries({ include: ["MyRescueOrganizations", "RescueOrganizationAnimals", "RescuePets"] });
    }
  };

  if (!counts && loading) return <DashLoadingRows rows={3} label="Cargando solicitudes" />;

  if (error && !data) {
    return (
      <DashErrorState
        message="No pudimos cargar las solicitudes."
        action={
          <button type="button" onClick={() => refetch()} className={dashButtonClass({ variant: "outline", size: "sm" })}>
            Reintentar
          </button>
        }
      />
    );
  }

  if (allCount === 0) {
    return (
      <DashEmptyState
        icon={FavouriteIcon}
        title="Aún no hay solicitudes"
        description="Cuando alguien quiera adoptar a uno de sus animales «En adopción», su solicitud llegará aquí y les avisaremos."
        action={
          <Link href={Routes.profileRescue(org.id, "animales")} className={dashButtonClass({ variant: "outline", size: "sm" })}>
            Ver publicados
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DashFilterChips<Filter>
        label="Mostrar"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "open", label: "Abiertas", count: openCount },
          { value: "all", label: "Todas", count: allCount },
        ]}
      />

      {!canReview ? (
        <p className="rounded-2xl bg-dash-surface-2 px-4 py-3 text-sm text-dash-muted">
          Con tu rol puedes ver las solicitudes. Las revisa el resto del equipo.
        </p>
      ) : null}

      {!data && loading ? (
        <DashLoadingRows rows={3} label="Cargando solicitudes" />
      ) : applications.length === 0 ? (
        <div className="rounded-2xl bg-dash-surface-2 px-4 py-6 text-center text-sm text-dash-muted">
          <p>No hay solicitudes abiertas por ahora.</p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`${dashButtonClass({ variant: "outline", size: "sm" })} mt-3`}
          >
            Ver todas
          </button>
        </div>
      ) : (
        <AdoptionApplicationList
          applications={applications}
          canReview={canReview}
          canComplete={canComplete}
          showAnimal
          onChanged={handleChanged}
        />
      )}

      {applications.length > 0 && applications.length < total ? (
        <DashLoadMore onClick={loadMore} loading={loadingMore} />
      ) : null}
    </div>
  );
}
