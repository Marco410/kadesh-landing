'use client';

import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { animalDetailHref } from 'kadesh/components/animals/animalSlug';
import { GET_NEARBY_ANIMALS_QUERY } from 'kadesh/components/animals/queries';
import { sortMultimediaByOrder } from 'kadesh/components/animals/sortMultimedia';
import {
  ZONE_ALERTS_LIMIT,
  alertTitle,
  dedupeAlerts,
  formatAlertDay,
  formatAlertPlace,
  isZoneAlertStatus,
  toIsoDate,
  type ZoneAlert,
  type ZoneAlertStatus,
} from 'kadesh/components/home/zoneAlerts';
// Por archivo y no por el barril de notificaciones: el barril exporta el shell del panel.
import { useAlertSettings } from 'kadesh/components/notifications/hooks/useAlertSettings';
import { DEFAULT_RADIUS } from 'kadesh/constants/constans';
import { useUser } from 'kadesh/utils/UserContext';
import { useRememberedLocation } from 'kadesh/utils/useRememberedLocation';

/**
 * `getNearbyAnimals` ordena por distancia antes de paginar: con pocas se tendrían las más cercanas,
 * no las más recientes. Se piden de más por estado y aquí se ordenan por fecha. Si algún día el back
 * acepta ordenar por fecha, bajar esto a `ZONE_ALERTS_LIMIT`.
 */
const NEARBY_PER_STATUS = 40;

export type AlertZone = {
  lat: number;
  lng: number;
  radiusKm: number;
  /** `alerts`: la zona que la persona guardó en sus alertas. `location`: su ubicación actual. */
  source: 'alerts' | 'location';
};

type NearbyAnimalNode = {
  id: string;
  slug?: string | null;
  name: string | null;
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
  getNearbyAnimals: { animals: NearbyAnimalNode[] | null; total: number } | null;
};

function toAlert(animal: NearbyAnimalNode): ZoneAlert | null {
  if (!isZoneAlertStatus(animal.status)) return null;
  const { title, typeLabel } = alertTitle(animal.name, animal.animal_type?.name);
  const dateTime = toIsoDate(animal.createdAt);
  return {
    id: animal.id,
    href: animalDetailHref(animal),
    status: animal.status,
    title,
    typeLabel,
    place: formatAlertPlace([animal.city, animal.state], animal.address),
    dateTime,
    dateLabel: formatAlertDay(dateTime),
    imageUrl: sortMultimediaByOrder(animal.multimedia)[0]?.url ?? null,
    distanceKm: animal.distance,
  };
}

function byNewest(a: ZoneAlert, b: ZoneAlert): number {
  const timeA = a.dateTime ? new Date(a.dateTime).getTime() : 0;
  const timeB = b.dateTime ? new Date(b.dateTime).getTime() : 0;
  return timeB - timeA || (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
}

/**
 * Alertas de la portada. Sin zona, las que llegaron del servidor (las más recientes de México).
 * Con sesión y alertas activas, las de su zona y radio; si no, con la ubicación ya compartida,
 * las que están a `DEFAULT_RADIUS` km. La ubicación no se pide sola: `location.request` es el botón.
 */
export function useZoneAlerts(initialAlerts: ZoneAlert[]) {
  const { user, loading: userLoading } = useUser();
  const { settings, loading: settingsLoading } = useAlertSettings(user?.id);
  const location = useRememberedLocation();

  // Con sesión se espera a saber si tiene zona guardada, para no pedir dos veces.
  const waitingForSettings = userLoading || (!!user?.id && settingsLoading);

  const zone = useMemo<AlertZone | null>(() => {
    if (waitingForSettings) return null;
    if (settings?.enabled && settings.center) {
      return { ...settings.center, radiusKm: settings.radiusKm, source: 'alerts' };
    }
    if (location.coords) {
      return { ...location.coords, radiusKm: DEFAULT_RADIUS, source: 'location' };
    }
    return null;
  }, [waitingForSettings, settings, location.coords]);

  const variables = (status: ZoneAlertStatus) => ({
    input: {
      lat: zone?.lat,
      lng: zone?.lng,
      radius: zone?.radiusKm,
      status,
      limit: NEARBY_PER_STATUS,
      skip: 0,
    },
  });
  const options = { skip: !zone, fetchPolicy: 'cache-and-network', errorPolicy: 'all' } as const;
  const lost = useQuery<NearbyAnimalsResponse>(GET_NEARBY_ANIMALS_QUERY, { ...options, variables: variables('lost') });
  const found = useQuery<NearbyAnimalsResponse>(GET_NEARBY_ANIMALS_QUERY, { ...options, variables: variables('found') });

  const loading = !!zone && ((lost.loading && !lost.data) || (found.loading && !found.data));
  const failed = !!lost.error && !!found.error;

  const nearby = useMemo(() => {
    if (!zone || loading) return [];
    const alerts = [...(lost.data?.getNearbyAnimals?.animals ?? []), ...(found.data?.getNearbyAnimals?.animals ?? [])]
      .map(toAlert)
      .filter((alert): alert is ZoneAlert => alert !== null)
      .sort(byNewest);
    return dedupeAlerts(alerts).slice(0, ZONE_ALERTS_LIMIT);
  }, [zone, loading, lost.data, found.data]);

  const inZone = nearby.length > 0;

  return {
    alerts: inZone ? nearby : initialAlerts,
    zone,
    inZone,
    /** Hay zona pero nada cerca: se muestran las del país y se dice. */
    zoneEmpty: !!zone && !loading && !failed && !inZone,
    counts: inZone
      ? {
          lost: lost.data?.getNearbyAnimals?.total ?? 0,
          found: found.data?.getNearbyAnimals?.total ?? 0,
        }
      : null,
    loading,
    location,
  };
}
