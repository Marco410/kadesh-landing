"use client";

import { useCallback, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
  MARK_NOTIFICATION_READ_MUTATION,
  NOTIFICATION_INBOX_QUERY,
  NOTIFICATION_UNREAD_COUNT_QUERY,
  type MarkAllNotificationsReadResponse,
  type MarkNotificationReadResponse,
  type MarkNotificationReadVariables,
  type NotificationInboxResponse,
  type NotificationInboxVariables,
} from '../queries';
import { NOTIFICATIONS_PAGE_SIZE } from '../constants';
import type { AppNotification } from '../types';

/** Lista paginada de 20 de la campana, con marcar una o todas como leídas. */
export function useNotificationInbox({ skip = false }: { skip?: boolean } = {}) {
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, error, fetchMore, refetch } = useQuery<
    NotificationInboxResponse,
    NotificationInboxVariables
  >(NOTIFICATION_INBOX_QUERY, {
    variables: { take: NOTIFICATIONS_PAGE_SIZE, skip: 0 },
    fetchPolicy: 'cache-and-network',
    skip,
    onCompleted: (result) => {
      if (result.notifications.length < NOTIFICATIONS_PAGE_SIZE) setHasMore(false);
    },
  });

  const notifications = data?.notifications ?? [];

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchMore({
        variables: { skip: notifications.length },
        updateQuery: (prev, { fetchMoreResult }) => ({
          notifications: [...prev.notifications, ...fetchMoreResult.notifications],
        }),
      });
      if (result.data.notifications.length < NOTIFICATIONS_PAGE_SIZE) setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchMore, hasMore, loadingMore, notifications.length]);

  const [markReadMutation] = useMutation<
    MarkNotificationReadResponse,
    MarkNotificationReadVariables
  >(MARK_NOTIFICATION_READ_MUTATION, {
    refetchQueries: [NOTIFICATION_UNREAD_COUNT_QUERY],
  });

  const [markAllMutation, { loading: markingAll }] = useMutation<MarkAllNotificationsReadResponse>(
    MARK_ALL_NOTIFICATIONS_READ_MUTATION,
    {
      refetchQueries: [NOTIFICATION_INBOX_QUERY, NOTIFICATION_UNREAD_COUNT_QUERY],
    }
  );

  const markRead = useCallback(
    async (notification: AppNotification) => {
      if (notification.readAt) return;
      try {
        await markReadMutation({
          variables: { id: notification.id, readAt: new Date().toISOString() },
        });
      } catch (err) {
        console.error('Error al marcar la notificación como leída:', err);
      }
    },
    [markReadMutation]
  );

  const markAllRead = useCallback(async () => {
    try {
      await markAllMutation();
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  }, [markAllMutation]);

  return {
    notifications,
    loading: loading && !data,
    error,
    hasMore,
    loadingMore,
    loadMore,
    markRead,
    markAllRead,
    markingAll,
    hasUnread: notifications.some((notification) => !notification.readAt),
    refetch,
  };
}
