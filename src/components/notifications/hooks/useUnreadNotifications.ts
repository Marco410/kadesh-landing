"use client";

import { useQuery } from '@apollo/client';
import { isTabHidden, useRefetchOnTabReturn } from 'kadesh/utils/useRefetchOnTabReturn';
import { NOTIFICATION_UNREAD_COUNT_QUERY, type NotificationUnreadCountResponse } from '../queries';
import { UNREAD_POLL_MS, UNREAD_STALE_MS } from '../constants';

/**
 * Contador de no leídas de Pet para la campana. Se refresca cada 5 min con la pestaña visible, al
 * volver a ella y cuando se marca algo como leído (las mutaciones vuelven a pedir esta consulta).
 *
 * `passive`: solo lee lo que ya pidió otro (la campana del panel) y no pide ni refresca por su
 * cuenta. Para pantallas que viven dentro de un shell que ya tiene el contador.
 */
export function useUnreadNotifications({ skip = false, passive = false }: { skip?: boolean; passive?: boolean } = {}) {
  const { data, refetch } = useQuery<NotificationUnreadCountResponse>(NOTIFICATION_UNREAD_COUNT_QUERY, {
    skip,
    ...(passive
      ? { fetchPolicy: 'cache-only' as const }
      : {
          pollInterval: UNREAD_POLL_MS,
          skipPollAttempt: isTabHidden,
          fetchPolicy: 'cache-and-network' as const,
        }),
  });
  useRefetchOnTabReturn(refetch, { skip: skip || passive, staleMs: UNREAD_STALE_MS });

  return data?.notificationsCount ?? 0;
}
