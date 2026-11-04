"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings02Icon } from "@hugeicons/core-free-icons";
import { DashButton, dashButtonClass } from "kadesh/components/app-shell";
import {
  NotificationList,
  NotificationsShell,
  WhatsappNotificationsCard,
  useNotificationInbox,
} from "kadesh/components/notifications";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";

export default function NotificacionesPage() {
  const { user } = useUser();
  const inbox = useNotificationInbox({ skip: !user?.id });

  return (
    <NotificationsShell
      view="notifications"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {inbox.hasUnread ? (
            <DashButton variant="ghost" size="sm" onClick={() => void inbox.markAllRead()} disabled={inbox.markingAll}>
              Marcar todas como leídas
            </DashButton>
          ) : null}
          <Link href={Routes.notifications.alerts} className={dashButtonClass({ variant: "outline", size: "sm" })}>
            <HugeiconsIcon icon={Settings02Icon} size={16} aria-hidden="true" />
            Alertas de zona
          </Link>
        </div>
      }
    >
      <div className="mb-5">
        <WhatsappNotificationsCard />
      </div>
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
