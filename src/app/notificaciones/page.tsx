"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings02Icon } from "@hugeicons/core-free-icons";
import {
  NotificationList,
  NotificationsShell,
  useNotificationInbox,
} from "kadesh/components/notifications";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";

export default function NotificacionesPage() {
  const { user } = useUser();
  const inbox = useNotificationInbox({ skip: !user?.id });

  return (
    <NotificationsShell
      title="Notificaciones"
      actions={
        <div className="flex items-center gap-2">
          {inbox.hasUnread ? (
            <button
              type="button"
              onClick={() => void inbox.markAllRead()}
              disabled={inbox.markingAll}
              className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh-50 disabled:opacity-50 dark:hover:bg-kadesh/15"
            >
              Marcar todas como leídas
            </button>
          ) : null}
          <Link
            href={Routes.notifications.alerts}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-kadesh px-3 text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh hover:text-white"
          >
            <HugeiconsIcon icon={Settings02Icon} size={16} strokeWidth={1.5} aria-hidden="true" />
            Alertas de zona
          </Link>
        </div>
      }
    >
      <NotificationList
        notifications={inbox.notifications}
        loading={inbox.loading}
        error={inbox.error}
        hasMore={inbox.hasMore}
        loadingMore={inbox.loadingMore}
        onLoadMore={() => void inbox.loadMore()}
        onRetry={() => void inbox.refetch()}
        onSelect={(notification) => void inbox.markRead(notification)}
        skeletonRows={6}
      />
    </NotificationsShell>
  );
}
