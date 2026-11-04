"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { HelpCircleIcon, RadarIcon } from "@hugeicons/core-free-icons";
import { dashButtonClass, dashSurfaceClass } from "kadesh/components/app-shell";
import { NotificationsShell, WhatsappNotificationsCard } from "kadesh/components/notifications";
import { MAX_DAILY_ALERTS } from "kadesh/components/notifications/constants";
import { useAlertSettings } from "kadesh/components/notifications/hooks/useAlertSettings";
import { useProfileDetailCrumb } from "kadesh/components/profile/shell/ProfileShell";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import { useUser } from "kadesh/utils/UserContext";

/** Tarjeta lateral: estado de las alertas de zona y acceso a configurarlas (viven en su pantalla). */
function ZoneAlertsCard() {
  const { user } = useUser();
  const { settings: zone, loading } = useAlertSettings(user?.id);
  const ready = Boolean(zone?.enabled);

  return (
    <section aria-labelledby="settings-zone-title" className={cn(dashSurfaceClass, "p-5")}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-dash-surface-2 text-dash-soft">
          <HugeiconsIcon icon={RadarIcon} size={20} aria-hidden />
        </span>
        <h2 id="settings-zone-title" className="text-[17px] font-semibold tracking-[-0.02em] text-dash-ink">
          Alertas de zona
        </h2>
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-sm leading-relaxed text-dash-muted">
        {!loading ? (
          <span className={cn("mt-[7px] size-2 shrink-0 rounded-full", ready ? "bg-green-500" : "bg-amber-500")} aria-hidden />
        ) : null}
        <span>
          {loading
            ? "Cargando…"
            : ready
              ? `Te avisamos de mascotas perdidas o encontradas a ${zone?.radiusKm} km de tu zona.`
              : "Te falta configurar tu zona. Elige un punto en el mapa y el radio."}
        </span>
      </p>
      <p className="mt-2 text-[13px] text-dash-muted">Máximo {MAX_DAILY_ALERTS} al día, de reportes de los últimos 3 días.</p>
      <Link
        href={Routes.notifications.alerts}
        className={cn(dashButtonClass({ variant: "outline", size: "sm", fullWidth: true }), "mt-4")}
      >
        {ready ? "Cambiar zona" : "Configurar zona"}
      </Link>
    </section>
  );
}

const TIPS = [
  "Revisa que tu número sea el correcto: lo cambias en Datos del perfil.",
  "Las alertas de zona solo llegan con tu zona configurada.",
  "Si apagas un aviso aquí, lo sigues viendo en la campana.",
];

/**
 * Ajustes de avisos: la campana siempre; WhatsApp (general y por tipo) a la izquierda y, a la
 * derecha, las alertas de zona y qué revisar si no llega. La bandeja queda limpia en /notificaciones.
 */
export default function AjustesAvisosPage() {
  useProfileDetailCrumb("Ajustes de avisos");

  return (
    <NotificationsShell
      view="notifications"
      wide
      title="Ajustes de avisos"
      description="La campana te avisa siempre. Aquí eliges qué te llega también por WhatsApp y configuras tus alertas de zona."
      back={{ href: Routes.notifications.index, label: "Notificaciones" }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="min-w-0">
          <WhatsappNotificationsCard />
        </div>
        <div className="space-y-4 xl:sticky xl:top-[5.5rem]">
          <ZoneAlertsCard />
          <section aria-labelledby="settings-help-title" className="rounded-3xl bg-dash-surface-2 p-5">
            <h2 id="settings-help-title" className="flex items-center gap-2 text-sm font-semibold text-dash-ink">
              <HugeiconsIcon icon={HelpCircleIcon} size={18} className="text-dash-soft" aria-hidden />
              ¿No te llega el WhatsApp?
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-snug text-dash-soft">
              {TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </NotificationsShell>
  );
}
