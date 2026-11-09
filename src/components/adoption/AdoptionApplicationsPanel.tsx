"use client";

import { useEffect, useId, useState } from 'react';
import { useQuery } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { canEditAnimal } from 'kadesh/components/animals/canEditAnimal';
import type { AnimalDetail } from 'kadesh/components/animals/detail';
import { useUser } from 'kadesh/utils/UserContext';
import AdoptionApplicationList, { type AdoptionListChange } from './AdoptionApplicationList';
import { ADOPTION_APPLICATION_PARAM, ADOPTION_PAGE_SIZE, ADOPTION_STATUS, isOpenAdoptionStatus } from './constants';
import { adoptionAnimalName } from './format';
import { ANIMAL_ADOPTION_APPLICATIONS_QUERY, type AnimalAdoptionApplicationsResponse } from './queries';

interface AdoptionApplicationsPanelProps {
  animal: AnimalDetail;
  /** Después de completar una adopción: el reporte quedó «Adoptado» y hay que recargarlo. */
  onChanged: () => void;
}

/**
 * «Solicitudes de adopción» en la ficha pública, solo para quien puede editar el animal (autor,
 * su espacio de rescate o un admin) y solo si hay alguna. Se abre sola si hay abiertas o si el
 * enlace trae `?solicitud=<id>` (la notificación), que además se resalta.
 */
export default function AdoptionApplicationsPanel({ animal, onChanged }: AdoptionApplicationsPanelProps) {
  const { user } = useUser();
  const listId = useId();
  const canManage = canEditAnimal(user, animal);
  const { data, fetchMore, refetch } = useQuery<AnimalAdoptionApplicationsResponse>(
    ANIMAL_ADOPTION_APPLICATIONS_QUERY,
    {
      variables: { animalId: animal.id, take: ADOPTION_PAGE_SIZE, skip: 0 },
      skip: !canManage,
      fetchPolicy: 'cache-and-network',
    },
  );
  const [highlightId, setHighlightId] = useState<string | null>(null);
  /** null: decide sola (abierta si hay pendientes o si viene de la notificación). */
  const [expanded, setExpanded] = useState<boolean | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const applications = canManage ? (data?.adoptionApplications ?? []) : [];
  const total = data?.adoptionApplicationsCount ?? applications.length;
  const openCount = applications.filter((item) => isOpenAdoptionStatus(item.status)).length;
  const newCount = applications.filter((item) => item.status === ADOPTION_STATUS.SUBMITTED).length;
  const isExpanded = expanded ?? (openCount > 0 || Boolean(highlightId));
  const highlightLoaded = Boolean(highlightId && applications.some((item) => item.id === highlightId));

  useEffect(() => {
    setHighlightId(new URLSearchParams(window.location.search).get(ADOPTION_APPLICATION_PARAM));
  }, []);

  useEffect(() => {
    if (!highlightLoaded || !isExpanded || !highlightId) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`solicitud-${highlightId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
    // Solo cuando llega la solicitud resaltada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightLoaded]);

  if (!canManage || applications.length === 0) return null;

  const name = adoptionAnimalName(animal.name);

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
    if (change.completed) onChanged();
  };

  const summary =
    openCount === 0
      ? `${total === 1 ? '1 solicitud' : `${total} solicitudes`}, ninguna abierta.`
      : newCount > 0
        ? `${newCount === 1 ? '1 nueva' : `${newCount} nuevas`} · ${openCount === 1 ? '1 abierta' : `${openCount} abiertas`}`
        : openCount === 1
          ? '1 abierta'
          : `${openCount} abiertas`;

  return (
    <section
      aria-label="Solicitudes de adopción"
      className={`shrink-0 scroll-mt-24 rounded-2xl p-4 ${
        openCount > 0
          ? 'border-2 border-kadesh/40 bg-kadesh-50 dark:border-kadesh/40 dark:bg-kadesh/10'
          : 'border border-[#ececec] bg-white dark:border-white/10 dark:bg-night-raised'
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black tracking-[-0.02em] text-[#121212] dark:text-[#eef1f6]">
            Solicitudes de adopción
          </h2>
          <p className="text-sm text-[#5a5a5a] dark:text-[#c3cad6]">{summary}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls={listId}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-kadesh hover:bg-white/70 dark:hover:bg-white/10 lg:min-h-9"
        >
          {isExpanded ? 'Ocultar' : 'Ver solicitudes'}
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={16}
            strokeWidth={2}
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
      </div>

      {isExpanded ? (
        <div id={listId} className="mt-3 lg:max-h-[40dvh] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
          <p className="mb-3 text-sm text-[#5a5a5a] dark:text-[#c3cad6]">
            Llama o escribe antes de decidir. Cuando {name} se vaya con su nueva familia, usa «Completar adopción» para
            pasarle su cartilla.
          </p>
          <AdoptionApplicationList
            applications={applications}
            canReview={canManage}
            canComplete={canManage}
            highlightId={highlightId}
            onChanged={handleChanged}
          />
          {applications.length < total ? (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className="inline-flex min-h-11 items-center rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh hover:bg-kadesh hover:text-white disabled:opacity-50 lg:min-h-9"
              >
                {loadingMore ? 'Cargando…' : 'Ver más solicitudes'}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
