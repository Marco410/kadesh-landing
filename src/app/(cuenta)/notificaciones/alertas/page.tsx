"use client";

import { AlertSettingsForm, NotificationsShell } from "kadesh/components/notifications";
import { Routes } from "kadesh/core/routes";

export default function AlertasPage() {
  return (
    <NotificationsShell view="alerts" back={{ href: Routes.notifications.index, label: "Notificaciones" }}>
      <AlertSettingsForm />
    </NotificationsShell>
  );
}
