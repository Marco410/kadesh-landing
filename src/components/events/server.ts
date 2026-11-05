import { EVENT_CARD_FIELDS, EVENT_DETAIL_FIELDS } from './fields';
import { DEFAULT_EVENT_TIME_ZONE } from './constants';
import { eventDayKey, zonedInputToIso } from './format';
import type { EventFeedItem, EventsFeed, EventsFeedFilters, EventStateFacet, PetEvent } from './types';

/**
 * Consultas de eventos desde el servidor (sin sesión): `/eventos`, la ficha, la portada y el
 * sitemap. Si el API falla devuelven vacío para no romper la página.
 */

const REVALIDATE_SECONDS = 60;
const SITEMAP_PAST_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const FEED_QUERY = `
  query PetEventsFeed($input: PetEventsFeedInput!) {
    petEventsFeed(input: $input) {
      total
      items {
        nextStartsAt
        nextEndsAt
        distanceKm
        event {
          ${EVENT_CARD_FIELDS}
        }
      }
    }
  }
`;

const FACETS_QUERY = `
  query PetEventFacets {
    petEventFacets {
      code
      slug
      name
      count
      cities {
        key
        name
        count
      }
    }
  }
`;

const BY_SLUG_QUERY = `
  query PetEventBySlug($slug: String!) {
    petEvent(where: { slug: $slug }) {
      ${EVENT_DETAIL_FIELDS}
    }
  }
`;

const SITEMAP_QUERY = `
  query PetEventsForSitemap($since: DateTime!) {
    petEvents(
      where: { status: { equals: "approved" }, lastEndsAt: { gte: $since } }
      orderBy: [{ firstStartsAt: asc }]
      take: 1000
    ) {
      slug
      updatedAt
    }
  }
`;

type GraphqlResponse<T> = { data?: T; errors?: Array<{ message?: string }> };

async function queryGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
  revalidate = REVALIDATE_SECONDS,
): Promise<T | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      next: { revalidate },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as GraphqlResponse<T>;
    if (payload.errors?.length) {
      console.error('Events GraphQL errors:', payload.errors);
      return payload.data ?? null;
    }
    return payload.data ?? null;
  } catch (error) {
    console.error('Events GraphQL fetch failed:', error);
    return null;
  }
}

/** `revalidate`: la portada usa 10 min (como sus alertas) para no regenerarse cada minuto. */
export async function fetchEventsFeed(filters: EventsFeedFilters, revalidate = REVALIDATE_SECONDS): Promise<EventsFeed> {
  const data = await queryGraphql<{ petEventsFeed: EventsFeed }>(FEED_QUERY, { input: filters }, revalidate);
  return data?.petEventsFeed ?? { total: 0, items: [] };
}

export async function fetchEventFacets(): Promise<EventStateFacet[]> {
  const data = await queryGraphql<{ petEventFacets: EventStateFacet[] }>(FACETS_QUERY, {}, 5 * 60);
  return data?.petEventFacets ?? [];
}

/** Ficha pública (publicada o cancelada después de publicarse). */
export async function fetchPublicEventBySlug(slug: string): Promise<PetEvent | null> {
  if (!slug) return null;
  const data = await queryGraphql<{ petEvent: PetEvent | null }>(BY_SLUG_QUERY, { slug });
  return data?.petEvent ?? null;
}

export type SitemapEvent = { slug: string; updatedAt: string | null };

/** Eventos publicados que no han terminado o terminaron hace menos de 30 días. */
export async function fetchEventsForSitemap(): Promise<SitemapEvent[]> {
  const since = new Date(Date.now() - SITEMAP_PAST_DAYS * DAY_MS);
  since.setUTCHours(0, 0, 0, 0);
  const data = await queryGraphql<{ petEvents: Array<{ slug: string | null; updatedAt: string | null }> }>(
    SITEMAP_QUERY,
    { since: since.toISOString() },
    60 * 60,
  );
  return (data?.petEvents ?? []).filter((event): event is SitemapEvent => Boolean(event.slug));
}

/** Días de la tira de la portada. */
export const HOME_WEEK_DAYS = 7;
const HOME_WEEK_TAKE = 48;
const HOME_REVALIDATE_SECONDS = 10 * 60;

const HOME_WEEK_QUERY = `
  query HomeEventsWeek($input: PetEventsFeedInput!, $from: DateTime!, $to: DateTime!) {
    publishedEvents: petEventsCount(where: { status: { equals: "approved" } })
    petEventsFeed(input: $input) {
      total
      items {
        nextStartsAt
        nextEndsAt
        distanceKm
        event {
          ${EVENT_CARD_FIELDS}
          sessions(where: { startsAt: { lt: $to }, endsAt: { gt: $from } }, orderBy: [{ startsAt: asc }]) {
            id
            startsAt
            endsAt
          }
        }
      }
    }
  }
`;

export type HomeEvents = {
  /** Inicio de hoy en hora de CDMX (ISO): la tira arranca ahí. */
  from: string;
  /** Eventos de todo México con alguna fecha en los próximos 7 días (con esas fechas). */
  week: EventFeedItem[];
  /** Solo si la semana viene vacía: los siguientes eventos, para que la sección nunca quede sola. */
  next: EventFeedItem[];
  /** Eventos registrados: todos los publicados, también los que ya pasaron (cifra del hero). */
  publishedTotal: number;
};

/**
 * Portada: todos los eventos publicados de los próximos 7 días, sin filtro. La ventana es por día
 * completo en hora de CDMX, así la llave de la caché no cambia en todo el día.
 */
export async function fetchHomeEvents(now = new Date()): Promise<HomeEvents> {
  const todayKey = eventDayKey(now.toISOString(), DEFAULT_EVENT_TIME_ZONE);
  const from = zonedInputToIso(todayKey, '00:00', DEFAULT_EVENT_TIME_ZONE) ?? now.toISOString();
  const [year, month, day] = todayKey.split('-').map(Number);
  const endKey = new Date(Date.UTC(year, month - 1, day + HOME_WEEK_DAYS)).toISOString().slice(0, 10);
  const to = zonedInputToIso(endKey, '00:00', DEFAULT_EVENT_TIME_ZONE) ?? now.toISOString();

  const data = await queryGraphql<{ petEventsFeed: EventsFeed; publishedEvents: number | null }>(
    HOME_WEEK_QUERY,
    { input: { to, take: HOME_WEEK_TAKE }, from, to },
    HOME_REVALIDATE_SECONDS,
  );
  const week = (data?.petEventsFeed?.items ?? []).filter((item) => (item.event.sessions ?? []).length > 0);
  const next = week.length > 0 ? [] : (await fetchEventsFeed({ take: 3, skip: 0 }, HOME_REVALIDATE_SECONDS)).items;
  return { from, week, next, publishedTotal: data?.publishedEvents ?? 0 };
}
