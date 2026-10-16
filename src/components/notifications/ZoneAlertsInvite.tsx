"use client";

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Notification03Icon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { useUser } from 'kadesh/utils/UserContext';
import { useAlertSettings } from './hooks';

/** Invitación en la portada para quien tiene sesión y aún no activó sus alertas de zona. */
export default function ZoneAlertsInvite() {
  const { user } = useUser();
  const { settings, loading } = useAlertSettings(user?.id);

  if (!user?.id || loading || !settings || settings.enabled) return null;

  return (
    <section aria-labelledby="zone-alerts-invite" className="bg-white px-4 pb-4 pt-12 dark:bg-night sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-kadesh-200 bg-kadesh-50 p-6 text-center dark:border-kadesh/30 dark:bg-kadesh/10 sm:flex-row sm:text-left">
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-kadesh text-white">
          <HugeiconsIcon icon={Notification03Icon} size={24} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h2 id="zone-alerts-invite" className="text-lg font-bold text-[#121212] dark:text-white">
            Alertas de tu zona
          </h2>
          <p className="mt-1 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
            Te avisamos cuando alguien reporte una mascota perdida o encontrada cerca de ti.
          </p>
        </div>
        <Link
          href={Routes.notifications.alerts}
          className="inline-flex min-h-11 flex-shrink-0 items-center justify-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
        >
          Activar alertas
        </Link>
      </div>
    </section>
  );
}
