"use client";

import { DashButton } from "kadesh/components/app-shell";
import {
  NotificationChannelsSummary,
  NotificationList,
  NotificationsShell,
  useNotificationInbox,
} from "kadesh/components/notifications";
import { useUser } from "kadesh/utils/UserContext";

/**
 * Bandeja: lo que te llegó. La configuración (WhatsApp, alertas de zona) vive en Ajustes de avisos;
 * aquí solo su resumen, que es también el acceso: columna lateral en escritorio, franja arriba de la
 * lista en teléfono y tableta. Sin botón "Ajustes" en el encabezado: duplicaría ese acceso.
 */
export default function NotificacionesPage() {
  const { user } = useUser();
  const inbox = useNotificationInbox({ skip: !user?.id });

  return (
    <NotificationsShell
      view="notifications"
      wide
      actions={
        inbox.hasUnread ? (
          <DashButton variant="ghost" size="sm" onClick={() => void inbox.markAllRead()} disabled={inbox.markingAll}>
            Marcar todas como leídas
          </DashButton>
        ) : null
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="min-w-0">
          <div className="mb-4 xl:hidden">
            <NotificationChannelsSummary variant="strip" />
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
        </div>
        {/* Debajo de la barra flotante (≈ 4.75 rem en escritorio). */}
        <aside className="hidden xl:sticky xl:top-[5.5rem] xl:block" aria-label="Cómo te avisamos">
          <NotificationChannelsSummary variant="rail" />
        </aside>
      </div>
    </NotificationsShell>
  );
}
