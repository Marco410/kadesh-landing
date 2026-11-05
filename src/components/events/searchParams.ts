import { Routes } from 'kadesh/core/routes';
import { isEventCategory, type EventWhen } from './constants';
import { stateBySlug } from './mexicoStates';
import type { EventsIndexFilters } from './EventsIndexClient';
import type { EventsPlace } from './events-seo';
import type { EventStateFacet } from './types';

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ? raw.trim().toLowerCase() : null;
}

/** Llave de municipio válida ("san-luis-potosi") o null. */
export function cleanCityKey(value: string | null | undefined): string | null {
  const key = (value ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return key || null;
}

/**
 * Filtros desde la query: `?tipo=esterilizacion&cuando=semana&cerca=1`. El estado y el municipio
 * van en la ruta (`/eventos/en/michoacan/morelia`); `?estado=` y `?ciudad=` se aceptan para mandar
 * (308) las URLs viejas a su ruta.
 */
export function parseEventsSearchParams(params: RawParams): EventsIndexFilters {
  const state = stateBySlug(first(params.estado))?.slug ?? null;
  const city = state ? cleanCityKey(first(params.ciudad)) : null;
  const tipo = first(params.tipo);
  const cuando = first(params.cuando);
  const when: EventWhen = cuando === 'semana' || cuando === 'mes' ? cuando : 'proximos';
  const near = first(params.cerca) === '1';
  return { state, city, category: isEventCategory(tipo) ? tipo : null, when, near };
}

/** URL de un listado: el lugar en la ruta y lo demás en la query. */
export function eventsListingHref(filters: EventsIndexFilters): string {
  const path = filters.state ? Routes.events.place(filters.state, filters.city) : Routes.events.index;
  const params = new URLSearchParams();
  if (filters.category) params.set('tipo', filters.category);
  if (filters.when !== 'proximos') params.set('cuando', filters.when);
  if (filters.near) params.set('cerca', '1');
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

/** "san-luis-potosi" → "San Luis Potosi" (cuando el municipio no viene en las facetas). */
function titleFromKey(key: string): string {
  return key
    .split('-')
    .map((word) => (['de', 'del', 'la', 'las', 'los', 'el', 'y'].includes(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')
    .replace(/^./, (c) => c.toUpperCase());
}

/** Lugar de una página `/eventos/en/<estado>[/<municipio>]`, o null si el estado no existe. */
export function resolveEventsPlace(
  stateSlug: string,
  citySegment: string | null,
  facets: EventStateFacet[],
): EventsPlace | null {
  const state = stateBySlug(stateSlug);
  if (!state) return null;
  const key = citySegment ? cleanCityKey(citySegment) : null;
  if (citySegment && !key) return null;
  const facetCity = key ? facets.find((facet) => facet.slug === state.slug)?.cities.find((city) => city.key === key) : null;
  return {
    state: { slug: state.slug, name: state.name },
    city: key ? { key, name: facetCity?.name ?? titleFromKey(key) } : null,
  };
}
