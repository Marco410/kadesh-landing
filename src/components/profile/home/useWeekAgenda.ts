"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { readGrantedLocation } from "kadesh/utils/geolocation";
import {
  PROFILE_WEEK_FEED_QUERY,
  PROFILE_WEEK_QUERY,
  type ProfileWeekFeedResponse,
  type ProfileWeekFeedVariables,
  type ProfileWeekResponse,
  type ProfileWeekVariables,
} from "./queries";
import {
  WEEK_FEED_TAKE,
  WEEK_NEAR_RADIUS_KM,
  bucketWeek,
  buildWeekDays,
  buildWeekVariables,
  collectWeekItems,
} from "./weekAgenda";

export type WeekSource = "zone" | "location" | "country";

/**
 * Datos de "Los próximos 7 días": la semana de la persona (citas, eventos que sigue u organiza) y
 * los eventos próximos para descubrir. Para "cerca de ti" usa el centro de sus alertas de zona; si
 * no tiene, la ubicación que ya compartió en este navegador; si tampoco, todo México.
 */
export function useWeekAgenda({ userId, now }: { userId: string; now: Date }) {
  const variables = useMemo(() => buildWeekVariables(userId, now), [userId, now]);
  const week = useQuery<ProfileWeekResponse, ProfileWeekVariables>(PROFILE_WEEK_QUERY, {
    variables,
    fetchPolicy: "cache-and-network",
  });
  // Se lee una sola vez al montar (localStorage).
  const [granted] = useState(() => readGrantedLocation());

  const me = week.data?.me;
  const zone = me?.alertLat != null && me?.alertLng != null ? { lat: me.alertLat, lng: me.alertLng } : null;
  const center = zone ?? granted;
  const source: WeekSource = zone ? "zone" : granted ? "location" : "country";

  const feedVariables = useMemo<ProfileWeekFeedVariables>(
    () => ({
      from: variables.from,
      to: variables.to,
      input: {
        to: variables.to,
        take: WEEK_FEED_TAKE,
        ...(center ? { lat: center.lat, lng: center.lng, radiusKm: WEEK_NEAR_RADIUS_KM } : {}),
      },
    }),
    [variables, center?.lat, center?.lng], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const feed = useQuery<ProfileWeekFeedResponse, ProfileWeekFeedVariables>(PROFILE_WEEK_FEED_QUERY, {
    variables: feedVariables,
    // Hasta saber si tiene zona, para no pedir dos veces.
    skip: !week.data,
    fetchPolicy: "cache-and-network",
  });

  const days = useMemo(() => {
    const discover = (feed.data?.petEventsFeed?.items ?? []).map((item) => item.event);
    const items = collectWeekItems(week.data, { events: discover, near: source !== "country" });
    return bucketWeek(buildWeekDays(now), items);
  }, [week.data, feed.data, source, now]);

  return {
    loading: week.loading && !week.data,
    error: week.error ?? null,
    days,
    source,
    discoverTotal: feed.data?.petEventsFeed?.total ?? 0,
  };
}
