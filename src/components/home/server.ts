import { animalDetailHref } from 'kadesh/components/animals/animalSlug';
import {
  ZONE_ALERTS_LIMIT,
  alertTitle,
  dedupeAlerts,
  formatAlertDay,
  formatAlertPlace,
  isZoneAlertStatus,
  toIsoDate,
  type ZoneAlert,
} from './zoneAlerts';
import {
  RECENT_REPORTS_LIMIT,
  toRecentReport,
  type NearbyAnimalNode,
  type RecentReport,
} from './recentReports';

const REVALIDATE_SECONDS = 60 * 60;

const PET_LANDING_STATS_QUERY = `
  query PetLandingStats {
    petLandingStats {
      animals
      animalsLost
      animalsHome
      animalsInAdoption
      veterinaries
      veterinariesVerified
      cities
    }
  }
`;

export type PetLandingStats = {
  animals: number;
  animalsLost: number;
  animalsHome: number;
  animalsInAdoption: number;
  veterinaries: number;
  veterinariesVerified: number;
  cities: number;
};

type PetLandingStatsResponse = {
  data?: { petLandingStats: PetLandingStats | null };
  errors?: Array<{ message?: string }>;
};

/** Cifras agregadas para el hero; solo servidor. Devuelve null si el API falla para no romper la portada. */
export async function fetchPetLandingStats(): Promise<PetLandingStats | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return null;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: PET_LANDING_STATS_QUERY }),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as PetLandingStatsResponse;
    if (payload.errors?.length) {
      console.error('PetLandingStats GraphQL errors:', payload.errors);
      return null;
    }

    return payload.data?.petLandingStats ?? null;
  } catch (error) {
    console.error('PetLandingStats GraphQL fetch failed:', error);
    return null;
  }
}

/** Las alertas cambian más seguido que las cifras: la portada se regenera cada 10 min. */
const ZONE_ALERTS_REVALIDATE_SECONDS = 10 * 60;
/** Se piden de más: se descartan las bitácoras que ya no son el estado actual de su animal. */
const ZONE_ALERTS_CANDIDATES = 30;
/** Deja fuera bitácoras sin fecha (en `desc` Postgres pone los null primero). Fijo para no cambiar la llave de la caché. */
const ZONE_ALERTS_SINCE = '2000-01-01T00:00:00.000Z';
const DAY_MS = 24 * 60 * 60 * 1000;

const ZONE_ALERTS_QUERY = `
  query HomeZoneAlerts($take: Int!, $since: DateTime!) {
    animalLogs(
      where: {
        status: { in: ["lost", "found"] }
        date_status: { gt: $since }
        animal: { duplicateOf: null }
      }
      orderBy: [{ date_status: desc }, { createdAt: desc }]
      take: $take
    ) {
      id
      status
      city
      state
      placeLabel
      date_status
      animal {
        id
        slug
        name
        animal_type {
          name
        }
        logs(orderBy: [{ date_status: desc }, { createdAt: desc }], take: 1) {
          id
        }
        multimedia(orderBy: [{ order: asc }], take: 1) {
          image {
            url
          }
        }
      }
    }
  }
`;

type ZoneAlertLog = {
  id: string;
  status: string | null;
  city: string | null;
  state: string | null;
  placeLabel: string | null;
  date_status: string | null;
  animal: {
    id: string;
    slug: string | null;
    name: string | null;
    animal_type: { name: string | null } | null;
    logs: Array<{ id: string }> | null;
    multimedia: Array<{ image: { url: string | null } | null }> | null;
  } | null;
};

type ZoneAlertsResponse = {
  data?: { animalLogs: ZoneAlertLog[] | null };
  errors?: Array<{ message?: string }>;
};

/**
 * Las alertas de zona más recientes de todo México (perdidos y encontrados), para la portada; solo
 * servidor. Es lo que ve quien no ha compartido su ubicación y lo que indexan los buscadores. Solo
 * cuenta un reporte si ese es el estado actual del animal: el que ya volvió a casa no es alerta.
 * Devuelve [] si el API falla para no romper la portada.
 */
export async function fetchRecentZoneAlerts(): Promise<ZoneAlert[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return [];
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: ZONE_ALERTS_QUERY,
        variables: { take: ZONE_ALERTS_CANDIDATES, since: ZONE_ALERTS_SINCE },
      }),
      next: { revalidate: ZONE_ALERTS_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as ZoneAlertsResponse;
    if (payload.errors?.length) {
      console.error('HomeZoneAlerts GraphQL errors:', payload.errors);
    }

    const now = Date.now();
    const alerts: ZoneAlert[] = [];

    for (const log of payload.data?.animalLogs ?? []) {
      const animal = log.animal;
      if (!animal || !isZoneAlertStatus(log.status)) continue;
      // Solo su bitácora más reciente (eso también deja un animal una sola vez).
      if (animal.logs?.[0]?.id !== log.id) continue;

      const dateTime = toIsoDate(log.date_status);
      // Una fecha a futuro es un error de captura: no se presenta como alerta reciente.
      if (dateTime && new Date(dateTime).getTime() > now + DAY_MS) continue;

      const { title, typeLabel } = alertTitle(animal.name, animal.animal_type?.name);
      alerts.push({
        id: animal.id,
        href: animalDetailHref(animal),
        status: log.status,
        title,
        typeLabel,
        place: formatAlertPlace([log.placeLabel, log.city, log.state]),
        dateTime,
        dateLabel: formatAlertDay(dateTime),
        imageUrl: animal.multimedia?.[0]?.image?.url ?? null,
        distanceKm: null,
      });
    }

    return dedupeAlerts(alerts).slice(0, ZONE_ALERTS_LIMIT);
  } catch (error) {
    console.error('HomeZoneAlerts GraphQL fetch failed:', error);
    return [];
  }
}

const RECENT_REPORTS_QUERY = `
  query HomeRecentReports($input: NearbyAnimalsInput!) {
    getNearbyAnimals(input: $input) {
      animals {
        id
        slug
        name
        distance
        address
        city
        state
        status
        animal_type {
          name
        }
        createdAt
        multimedia {
          url
          order
        }
      }
    }
  }
`;

type RecentReportsResponse = {
  data?: { getNearbyAnimals: { animals: NearbyAnimalNode[] | null } | null };
  errors?: Array<{ message?: string }>;
};

/**
 * Los reportes más recientes de todo México para «Reportes recientes»; solo servidor, con la
 * portada (10 min). Antes los pedía el navegador en cada visita, y `getNearbyAnimals` recorre todos
 * los reportes en el back. Devuelve [] si el API falla: la sección los pide entonces desde el navegador.
 */
export async function fetchRecentReports(): Promise<RecentReport[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return [];
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: RECENT_REPORTS_QUERY,
        variables: { input: { limit: RECENT_REPORTS_LIMIT, skip: 0 } },
      }),
      next: { revalidate: ZONE_ALERTS_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as RecentReportsResponse;
    if (payload.errors?.length) {
      console.error('HomeRecentReports GraphQL errors:', payload.errors);
    }

    return (payload.data?.getNearbyAnimals?.animals ?? []).map(toRecentReport);
  } catch (error) {
    console.error('HomeRecentReports GraphQL fetch failed:', error);
    return [];
  }
}
