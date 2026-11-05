'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApolloClient } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Alert02Icon, Location01Icon, Notification03Icon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { useRememberedLocation } from 'kadesh/utils/useRememberedLocation';
import { LoadingBar, SkeletonRegion } from 'kadesh/components/ui/skeleton';
import {
  EVENT_CATEGORIES,
  EVENT_WHEN_OPTIONS,
  EVENTS_NEAR_RADIUS_KM,
  EVENTS_PAGE_SIZE,
  type EventWhen,
} from './constants';
import EventCard, { EventCardSkeleton } from './EventCard';
import { whenUntil } from './format';
import { eventsListingHref } from './searchParams';
import { EVENTS_FEED_QUERY, type EventsFeedResponse, type EventsFeedVariables } from './queries';
import type { EventFeedItem, EventsFeed, EventsFeedFilters, EventStateFacet } from './types';

export type EventsIndexFilters = {
  /** Slug del estado (`michoacan`). */
  state: string | null;
  /** Llave del municipio (`morelia`). */
  city: string | null;
  category: string | null;
  when: EventWhen;
  /** `?cerca=1`: abre con «Cerca de mí» (p. ej. desde la portada). */
  near: boolean;
};

const selectClass =
  'min-h-11 w-full rounded-xl border border-[#d8dee8] bg-white px-3 text-sm font-medium text-[#121212] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] sm:w-auto';

function chipClass(active: boolean) {
  return cn(
    'inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh',
    active
      ? 'border-kadesh bg-kadesh text-white'
      : 'border-[#dcdcdc] bg-white text-[#3a3a3a] hover:border-kadesh dark:border-white/15 dark:bg-night dark:text-[#d0d0d0]',
  );
}

/**
 * Filtros y lista de `/eventos`. La primera página llega del servidor (SEO); cambiar un filtro
 * cambia la URL y el servidor vuelve a pintar. «Cerca de mí» y «Ver más» piden en el navegador.
 */
export default function EventsIndexClient({
  initialFeed,
  facets,
  filters,
}: {
  initialFeed: EventsFeed;
  facets: EventStateFacet[];
  filters: EventsIndexFilters;
}) {
  const router = useRouter();
  const client = useApolloClient();
  const { coords, permissionDenied, isLocating, request: requestLocation } = useRememberedLocation();
  const [near, setNear] = useState(filters.near);
  const [items, setItems] = useState<EventFeedItem[]>(initialFeed.items);
  const [total, setTotal] = useState(initialFeed.total);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // Al cambiar los filtros, el servidor manda otra primera página.
  useEffect(() => {
    setNavigating(false);
    if (!near) {
      setItems(initialFeed.items);
      setTotal(initialFeed.total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFeed]);

  const stateFacet = facets.find((facet) => facet.slug === filters.state) ?? null;

  const baseInput = useMemo<EventsFeedFilters>(
    () => ({
      state: filters.state,
      city: filters.state ? filters.city : null,
      category: filters.category,
      to: whenUntil(filters.when),
      ...(near && coords ? { lat: coords.lat, lng: coords.lng, radiusKm: EVENTS_NEAR_RADIUS_KM } : {}),
    }),
    [filters, near, coords],
  );

  const fetchPage = useCallback(
    async (skip: number) => {
      const { data } = await client.query<EventsFeedResponse, EventsFeedVariables>({
        query: EVENTS_FEED_QUERY,
        variables: { input: { ...baseInput, take: EVENTS_PAGE_SIZE, skip } },
        fetchPolicy: 'network-only',
      });
      return data.petEventsFeed;
    },
    [baseInput, client],
  );

  // «Cerca de mí»: en cuanto haya ubicación, la primera página se pide en el navegador.
  useEffect(() => {
    if (!near) {
      setItems(initialFeed.items);
      setTotal(initialFeed.total);
      return;
    }
    if (!coords) return;
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    fetchPage(0)
      .then((feed) => {
        if (id !== requestId.current) return;
        setItems(feed.items);
        setTotal(feed.total);
      })
      .catch(() => {
        if (id === requestId.current) setError('No pudimos cargar los eventos cerca de ti. Intenta de nuevo.');
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near, coords, baseInput]);

  // Llegó con `?cerca=1`: la persona ya pidió los cercanos, así que se pide la ubicación.
  useEffect(() => {
    if (filters.near && !coords) requestLocation();
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (patch: Partial<EventsIndexFilters>) => {
    const next = { ...filters, near, ...patch };
    if ('state' in patch) next.city = null;
    setNavigating(true);
    router.replace(eventsListingHref(next), { scroll: false });
  };

  const toggleNear = () => {
    const next = !near;
    setNear(next);
    if (next && !coords) requestLocation();
    // La URL guarda el modo (para recargar o compartir) sin volver a pedir la página al servidor.
    window.history.replaceState(null, '', eventsListingHref({ ...filters, near: next }));
  };

  const loadMore = async () => {
    setLoadingMore(true);
    setError(null);
    try {
      const feed = await fetchPage(items.length);
      setItems((current) => {
        const seen = new Set(current.map((item) => item.event.id));
        return [...current, ...feed.items.filter((item) => !seen.has(item.event.id))];
      });
      setTotal(feed.total);
    } catch {
      setError('No pudimos cargar más eventos. Intenta de nuevo.');
    } finally {
      setLoadingMore(false);
    }
  };

  const hasFilters = Boolean(filters.state || filters.category || filters.when !== 'proximos' || near);
  const busy = loading || navigating || (near && !coords && isLocating);

  return (
    <div>
      <div
        role="search"
        aria-label="Filtrar eventos"
        className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#ececec] bg-white p-4 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Estado
            <select
              className={selectClass}
              value={filters.state ?? ''}
              onChange={(event) => applyFilters({ state: event.target.value || null })}
            >
              <option value="">Todo México</option>
              {facets.map((facet) => (
                <option key={facet.slug} value={facet.slug}>
                  {facet.name} ({facet.count})
                </option>
              ))}
              {filters.state && !stateFacet ? <option value={filters.state}>{filters.state}</option> : null}
            </select>
          </label>
          {stateFacet && stateFacet.cities.length > 0 ? (
            <label className="flex flex-col gap-1 text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
              Municipio
              <select
                className={selectClass}
                value={filters.city ?? ''}
                onChange={(event) => applyFilters({ city: event.target.value || null })}
              >
                <option value="">Todo {stateFacet.name}</option>
                {stateFacet.cities.map((city) => (
                  <option key={city.key} value={city.key}>
                    {city.name} ({city.count})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <button
              type="button"
              aria-pressed={near}
              onClick={toggleNear}
              disabled={isLocating}
              className={chipClass(near)}
            >
              <HugeiconsIcon icon={Location01Icon} size={16} strokeWidth={1.8} aria-hidden="true" />
              {isLocating ? 'Ubicando…' : 'Cerca de mí'}
            </button>
            {EVENT_WHEN_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={filters.when === option.value}
                onClick={() => applyFilters({ when: option.value })}
                className={chipClass(filters.when === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div role="group" aria-label="Tipo de evento" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            aria-pressed={!filters.category}
            onClick={() => applyFilters({ category: null })}
            className={chipClass(!filters.category)}
          >
            Todos
          </button>
          {EVENT_CATEGORIES.map((category) => {
            const active = filters.category === category.value;
            return (
              <button
                key={category.value}
                type="button"
                aria-pressed={active}
                onClick={() => applyFilters({ category: active ? null : category.value })}
                className={chipClass(active)}
              >
                <HugeiconsIcon icon={category.icon} size={16} strokeWidth={1.8} aria-hidden="true" />
                {category.label}
              </button>
            );
          })}
        </div>
        {near && permissionDenied ? (
          <p className="inline-flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            <HugeiconsIcon icon={Alert02Icon} size={18} className="mt-0.5 flex-shrink-0" aria-hidden />
            Sin permiso de ubicación no podemos mostrarte los cercanos. Elige tu estado en la lista.
          </p>
        ) : null}
        <LoadingBar active={busy} className="w-full" />
      </div>

      <p className="mb-4 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]" aria-live="polite">
        {busy
          ? 'Buscando eventos…'
          : total === 0
            ? 'Sin eventos con estos filtros.'
            : `${total} ${total === 1 ? 'evento' : 'eventos'}${near && coords ? ` a menos de ${EVENTS_NEAR_RADIUS_KM} km` : ''}`}
      </p>

      {loading && items.length === 0 ? (
        <SkeletonRegion label="Cargando eventos" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <EventCardSkeleton key={index} />
          ))}
        </SkeletonRegion>
      ) : items.length > 0 ? (
        <div
          className={cn(
            'grid grid-cols-1 gap-6 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3',
            busy && 'opacity-50',
          )}
        >
          {items.map((item) => (
            <EventCard key={item.event.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#d8dee8] px-6 py-14 text-center dark:border-white/15">
          <p className="mb-2 text-lg font-bold text-[#121212] dark:text-white">
            {hasFilters ? 'No encontramos eventos con estos filtros' : 'Todavía no hay eventos próximos'}
          </p>
          <p className="mb-6 max-w-md text-[#5a5a5a] dark:text-[#b0b0b0]">
            ¿Organizas una campaña de esterilización, una jornada de vacunación o una feria de adopción? Publícala gratis
            y avisamos a la gente de la zona.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={Routes.events.new}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
            >
              <HugeiconsIcon icon={Add01Icon} size={18} aria-hidden />
              Publicar evento
            </Link>
            <Link
              href={Routes.notifications.alerts}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#d8dee8] px-6 font-semibold text-[#121212] hover:border-kadesh dark:border-white/15 dark:text-white"
            >
              <HugeiconsIcon icon={Notification03Icon} size={18} aria-hidden />
              Avísame cuando haya uno cerca
            </Link>
          </div>
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-6 text-center text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {items.length > 0 && items.length < total ? (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="inline-flex min-h-12 items-center rounded-xl border border-[#d8dee8] px-6 font-semibold text-[#121212] hover:border-kadesh disabled:opacity-50 dark:border-white/15 dark:text-white"
          >
            {loadingMore ? 'Cargando…' : 'Ver más eventos'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
