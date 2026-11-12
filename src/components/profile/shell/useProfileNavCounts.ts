"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
// Directo (no el barrel): el barrel de notificaciones exporta NotificationsShell, que usa este shell.
import { useUnreadNotifications } from "kadesh/components/notifications/hooks";
import { UNREAD_POLL_MS, UNREAD_STALE_MS } from "kadesh/components/notifications/constants";
import { isTabHidden, useRefetchOnTabReturn } from "kadesh/utils/useRefetchOnTabReturn";
import { addDays, calendarDay, startOfHour } from "./dates";
import type { ProfileNavCounts } from "./profileNav";
import {
  PROFILE_NAV_COUNTS_QUERY,
  type ProfileNavCountsResponse,
  type ProfileNavCountsVariables,
} from "./queries";

/**
 * Contadores de los globos del menú y de la campana. Se refrescan cada 5 min con la
 * pestaña visible y al volver a ella, como la campana.
 * Devuelve también `unread` para la campana de la barra (una sola consulta para los dos).
 */
export function useProfileNavCounts(userId: string | undefined): { counts: ProfileNavCounts; unread: number } {
  const unread = useUnreadNotifications({ skip: !userId });
  const variables = useMemo<ProfileNavCountsVariables | null>(() => {
    if (!userId) return null;
    const now = startOfHour(new Date());
    return { userId, now: now.toISOString(), soon: calendarDay(addDays(now, 7)) };
  }, [userId]);

  const { data, refetch } = useQuery<ProfileNavCountsResponse, ProfileNavCountsVariables>(PROFILE_NAV_COUNTS_QUERY, {
    variables: variables ?? undefined,
    skip: !variables,
    pollInterval: UNREAD_POLL_MS,
    skipPollAttempt: isTabHidden,
    fetchPolicy: "cache-and-network",
  });
  useRefetchOnTabReturn(refetch, { skip: !variables, staleMs: UNREAD_STALE_MS });

  return {
    unread,
    counts: {
      notifications: unread,
      pets: data?.reminders ?? null,
      appointments: data?.upcomingAppointments ?? null,
      clinics: data?.clinicPendingAppointments ?? null,
    },
  };
}
