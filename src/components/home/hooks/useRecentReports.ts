'use client';

import { useQuery } from '@apollo/client';
import { GET_NEARBY_ANIMALS_QUERY } from 'kadesh/components/animals/queries';
import { sortMultimediaByOrder } from 'kadesh/components/animals/sortMultimedia';
import { DEFAULT_RADIUS } from 'kadesh/constants/constans';
import type { GeoCoords } from 'kadesh/utils/geolocation';

export const RECENT_REPORTS_LIMIT = 6;

export type RecentReportStatus = 'lost' | 'found' | 'in_adoption';

export type RecentReport = {
  id: string;
  slug?: string | null;
  name: string;
  typeName: string;
  status: string;
  place: string;
  createdAt: string;
  imageUrl?: string;
  distance: number | null;
};

type NearbyAnimalNode = {
  id: string;
  slug?: string | null;
  name: string;
  distance: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  status: string;
  animal_type: { name: string } | null;
  createdAt: string;
  multimedia: Array<{ url: string; order?: number | null }>;
};

type NearbyAnimalsResponse = {
  getNearbyAnimals: { animals: NearbyAnimalNode[] | null } | null;
};

function toReport(animal: NearbyAnimalNode): RecentReport {
  return {
    id: animal.id,
    slug: animal.slug,
    name: animal.name,
    typeName: animal.animal_type?.name?.toLowerCase() ?? '',
    status: animal.status,
    place: [animal.city, animal.state].filter(Boolean).join(', ') || animal.address || '',
    createdAt: animal.createdAt,
    imageUrl: sortMultimediaByOrder(animal.multimedia)[0]?.url,
    distance: animal.distance,
  };
}

/**
 * Los reportes más recientes para la portada. Con ubicación, los de la zona (ordenados por cercanía);
 * si no hay ninguno cerca o no hay ubicación, los más recientes de todo el país para no dejar la sección vacía.
 */
export function useRecentReports(coords: GeoCoords | null, status: RecentReportStatus | null) {
  const base = { limit: RECENT_REPORTS_LIMIT, skip: 0, ...(status && { status }) };

  const nearby = useQuery<NearbyAnimalsResponse>(GET_NEARBY_ANIMALS_QUERY, {
    variables: {
      input: { ...base, lat: coords?.lat, lng: coords?.lng, radius: DEFAULT_RADIUS },
    },
    skip: !coords,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  // Al cambiar el filtro se quedan los reportes anteriores (atenuados) hasta que llegan los nuevos.
  const nearbyData = nearby.data ?? nearby.previousData;
  const nearbyReports = (nearbyData?.getNearbyAnimals?.animals ?? []).map(toReport);
  const needsNational = !coords || (!nearby.loading && nearbyReports.length === 0);

  const national = useQuery<NearbyAnimalsResponse>(GET_NEARBY_ANIMALS_QUERY, {
    variables: { input: base },
    skip: !needsNational,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const nationalData = national.data ?? national.previousData;
  const nationalReports = (nationalData?.getNearbyAnimals?.animals ?? []).map(toReport);
  const isNearby = !!coords && nearbyReports.length > 0;

  return {
    reports: isNearby ? nearbyReports : nationalReports,
    isNearby,
    loading: (!!coords && nearby.loading && !nearbyData) || (needsNational && national.loading && !nationalData),
    refreshing:
      (!!coords && nearby.loading && !nearby.data && !!nearby.previousData) ||
      (needsNational && national.loading && !national.data && !!national.previousData),
  };
}
