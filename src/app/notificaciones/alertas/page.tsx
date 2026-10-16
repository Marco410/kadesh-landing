"use client";

import { AlertSettingsForm, NotificationsShell } from "kadesh/components/notifications";
import { Routes } from "kadesh/core/routes";

export default function AlertasPage() {
  return (
    <NotificationsShell
      title="Alertas de zona"
      description="Elige una zona y te avisamos en la campana cuando reporten una mascota perdida o encontrada ahí."
      back={{ href: Routes.notifications.index, label: "Notificaciones" }}
    >
      <AlertSettingsForm />
    </NotificationsShell>
  );
}
