'use client';

import { useQuery } from '@apollo/client';
import { GET_NEARBY_ANIMALS_QUERY } from 'kadesh/components/animals/queries';
import { DEFAULT_RADIUS } from 'kadesh/constants/constans';
import type { GeoCoords } from 'kadesh/utils/geolocation';
import {
  RECENT_REPORTS_LIMIT,
  toRecentReport,
  type NearbyAnimalNode,
  type RecentReport,
  type RecentReportStatus,
} from 'kadesh/components/home/recentReports';

export { RECENT_REPORTS_LIMIT, type RecentReport, type RecentReportStatus };

type NearbyAnimalsResponse = {
  getNearbyAnimals: { animals: NearbyAnimalNode[] | null } | null;
};

/**
 * Los reportes más recientes para la portada. Con ubicación, los de la zona (ordenados por cercanía);
 * si no hay ninguno cerca o no hay ubicación, los más recientes de todo el país para no dejar la sección vacía.
 *
 * `initialNational` son los del país que ya pintó el servidor (portada en caché, 10 min): mientras
 * no haya filtro se usan esos y el navegador no pide nada. `getNearbyAnimals` recorre todos los
 * reportes en el back, así que pedirla en cada visita era lo más caro de la portada.
 */
export function useRecentReports(
  coords: GeoCoords | null,
  status: RecentReportStatus | null,
  initialNational: RecentReport[] = [],
) {
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
  const nearbyReports = (nearbyData?.getNearbyAnimals?.animals ?? []).map(toRecentReport);
  const needsNational = !coords || (!nearby.loading && nearbyReports.length === 0);
  const useInitial = status === null && initialNational.length > 0;

  const national = useQuery<NearbyAnimalsResponse>(GET_NEARBY_ANIMALS_QUERY, {
    variables: { input: base },
    skip: !needsNational || useInitial,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const nationalData = national.data ?? national.previousData;
  const nationalReports = useInitial
    ? initialNational
    : (nationalData?.getNearbyAnimals?.animals ?? []).map(toRecentReport);
  const isNearby = !!coords && nearbyReports.length > 0;
  const nationalPending = needsNational && !useInitial && national.loading;

  return {
    reports: isNearby ? nearbyReports : nationalReports,
    isNearby,
    loading: (!!coords && nearby.loading && !nearbyData) || (nationalPending && !nationalData),
    refreshing:
      (!!coords && nearby.loading && !nearby.data && !!nearby.previousData) ||
      (nationalPending && !national.data && !!national.previousData),
  };
}
