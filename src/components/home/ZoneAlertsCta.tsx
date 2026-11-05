'use client';

import { useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Notification03Icon } from '@hugeicons/core-free-icons';
import AuthGateModal, { type AuthGateCopy } from 'kadesh/components/auth/AuthGateModal';
import { ZONE_ALERTS_AUTH_REASONS } from 'kadesh/components/home/constants';
// Por archivo y no por el barril de notificaciones: el barril exporta el shell del panel.
import { useAlertSettings } from 'kadesh/components/notifications/hooks/useAlertSettings';
import { Routes } from 'kadesh/core/routes';
import { useUser } from 'kadesh/utils/UserContext';

const AUTH_COPY: AuthGateCopy = {
  title: 'Activa las alertas de tu zona',
  description:
    'Con una cuenta guardamos tu zona y sabemos a dónde avisarte. Te toma un minuto y luego eliges el punto en el mapa.',
  reasons: [...ZONE_ALERTS_AUTH_REASONS],
};

const PRIMARY_CLASS =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-kadesh px-6 text-base font-semibold text-white transition-colors hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh';

/**
 * Botón de la sección de alertas. Sin sesión abre el modal de cuenta y luego lleva a elegir la zona;
 * con las alertas ya activas dice el radio y ofrece cambiar la zona. Mientras se sabe si hay sesión,
 * el enlace navega normal (la página de alertas también pide cuenta).
 */
export default function ZoneAlertsCta() {
  const { user, loading } = useUser();
  const { settings } = useAlertSettings(user?.id);
  const [open, setOpen] = useState(false);

  if (user && settings?.enabled) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-emerald-700 dark:bg-white/10 dark:text-emerald-400">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} strokeWidth={1.8} aria-hidden="true" />
          Tus alertas están activas a {settings.radiusKm} km
        </p>
        <Link
          href={Routes.notifications.alerts}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-kadesh/40 px-5 text-sm font-semibold text-kadesh-700 transition-colors hover:border-kadesh hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:text-kadesh-300 dark:hover:bg-white/10"
        >
          Cambiar zona
        </Link>
      </div>
    );
  }

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (loading || user) return;
    event.preventDefault();
    setOpen(true);
  };

  return (
    <>
      <Link href={Routes.notifications.alerts} onClick={handleClick} className={PRIMARY_CLASS}>
        <HugeiconsIcon icon={Notification03Icon} size={20} strokeWidth={1.8} aria-hidden="true" />
        Activar alertas de mi zona
      </Link>
      {!user ? (
        <AuthGateModal
          isOpen={open}
          onClose={() => setOpen(false)}
          redirectTo={Routes.notifications.alerts}
          {...AUTH_COPY}
        />
      ) : null}
    </>
  );
}
