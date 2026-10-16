"use client";

import { useQuery } from '@apollo/client';
import { NOTIFICATION_UNREAD_COUNT_QUERY, type NotificationUnreadCountResponse } from '../queries';
import { UNREAD_POLL_MS } from '../constants';

/** Contador de no leídas de Pet para la campana. Se refresca cada minuto. */
export function useUnreadNotifications({ skip = false }: { skip?: boolean } = {}) {
  const { data } = useQuery<NotificationUnreadCountResponse>(NOTIFICATION_UNREAD_COUNT_QUERY, {
    skip,
    pollInterval: UNREAD_POLL_MS,
    fetchPolicy: 'cache-and-network',
  });

  return data?.notificationsCount ?? 0;
}
