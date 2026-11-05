'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert02Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Image01Icon,
  Location01Icon,
} from '@hugeicons/core-free-icons';
import ReportLink from 'kadesh/components/animals/ReportLink';
import { gsap, useGSAP, HOME_EASE } from 'kadesh/components/home/gsap-register';
import { useZoneAlerts, type AlertZone } from 'kadesh/components/home/hooks/useZoneAlerts';
import {
  formatAlertAgo,
  formatAlertDistance,
  type ZoneAlert,
  type ZoneAlertStatus,
} from 'kadesh/components/home/zoneAlerts';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { LoadingBar } from 'kadesh/components/ui/skeleton';

const STATUS_UI: Record<
  ZoneAlertStatus,
  { label: string; text: string; badge: string; icon: typeof Alert02Icon }
> = {
  lost: {
    label: 'Perdido',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-600',
    icon: Alert02Icon,
  },
  found: {
    label: 'Encontrado',
    text: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-600',
    icon: CheckmarkCircle02Icon,
  },
};

/** Hora actual, solo después de hidratar: el HTML trae el día fijo («4 nov») y luego pasa a «Hace 3 h». */
function useNow(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function scopeLabel(zone: AlertZone | null, inZone: boolean): string {
  if (!zone || !inZone) return 'Las más recientes de México';
  return zone.source === 'alerts'
    ? `En tu zona de alertas, a ${zone.radiusKm} km`
    : `A ${zone.radiusKm} km de ti`;
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

function ZoneAlertRow({ alert, now }: { alert: ZoneAlert; now: number | null }) {
  const ui = STATUS_UI[alert.status];
  // Las fotos son URLs firmadas que vencen en 1 h; la portada en caché puede traer una vencida.
  const [imageFailed, setImageFailed] = useState(false);
  const when = (now != null && formatAlertAgo(alert.dateTime, now)) || alert.dateLabel;
  const details = [alert.typeLabel, alert.place, formatAlertDistance(alert.distanceKm)].filter(Boolean);

  return (
    <li data-zone-alert>
      <article className="group relative flex items-center gap-3 rounded-2xl px-2 py-3 transition-colors hover:bg-[#f4f6fa] dark:hover:bg-white/5">
        <span className="relative h-14 w-14 flex-shrink-0">
          <span className="relative block h-full w-full overflow-hidden rounded-xl bg-[#e8edf3] dark:bg-[#2a3548]">
            {alert.imageUrl && !imageFailed ? (
              <Image
                src={alert.imageUrl}
                alt={`Foto de ${alert.title}`}
                fill
                sizes="56px"
                className="object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[#5a5a5a] dark:text-[#9aa3b2]">
                <HugeiconsIcon icon={Image01Icon} size={22} strokeWidth={1.5} aria-hidden="true" />
              </span>
            )}
          </span>
          <span
            className={cn(
              'absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-white dark:ring-night-raised',
              ui.badge
            )}
            aria-hidden="true"
          >
            <HugeiconsIcon icon={ui.icon} size={14} strokeWidth={2} />
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold">
            <span className={cn('uppercase tracking-wide', ui.text)}>{ui.label}</span>
            {when ? (
              <time dateTime={alert.dateTime ?? undefined} className="font-medium text-[#5a5a5a] dark:text-[#9aa3b2]">
                {when}
              </time>
            ) : null}
          </p>
          <h4 className="truncate text-base font-bold text-[#121212] dark:text-white">
            <Link
              href={alert.href}
              className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-kadesh"
            >
              {alert.title}
            </Link>
          </h4>
          {details.length > 0 ? (
            <p className="truncate text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">{details.join(' · ')}</p>
          ) : null}
        </div>

        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={18}
          strokeWidth={2}
          className="flex-shrink-0 text-[#9aa3b2] transition-colors group-hover:text-kadesh"
          aria-hidden="true"
        />
      </article>
    </li>
  );
}

/**
 * Lista de alertas de la sección. Llega renderizada desde el servidor (las más recientes de México)
 * para que la lean los buscadores; en el navegador cambia a las de la zona de quien la ve.
 */
export default function ZoneAlertsFeed({ initialAlerts }: { initialAlerts: ZoneAlert[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const now = useNow();
  const { alerts, zone, inZone, zoneEmpty, counts, loading, location } = useZoneAlerts(initialAlerts);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-zone-alert]', {
          x: 24,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: HOME_EASE,
          scrollTrigger: { trigger: rootRef.current, start: 'top 80%', once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="rounded-3xl border border-white bg-white p-5 shadow-[0_24px_60px_-28px_rgba(15,35,80,0.35)] dark:border-white/10 dark:bg-night-raised sm:p-6"
    >
      <div className="flex items-start justify-between gap-4 px-2">
        <div>
          <h3 id="alertas-recientes" className="text-lg font-bold text-[#121212] dark:text-white">
            Alertas recientes
          </h3>
          <p className="mt-0.5 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">{scopeLabel(zone, inZone)}</p>
        </div>
        {counts && zone ? (
          <p className="text-right text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
            <span className="block font-semibold text-red-700 dark:text-red-400">
              {plural(counts.lost, 'perdido', 'perdidos')}
            </span>
            <span className="block font-semibold text-emerald-700 dark:text-emerald-400">
              {plural(counts.found, 'encontrado', 'encontrados')}
            </span>
            <span className="sr-only">en esta zona</span>
          </p>
        ) : null}
      </div>

      <LoadingBar active={loading} className="mt-4" />

      {zoneEmpty && zone ? (
        <p className="mx-2 mt-3 rounded-xl bg-[#f7f8fa] px-3 py-2 text-sm text-[#3a3a3a] dark:bg-white/5 dark:text-[#d0d0d0]">
          No hay alertas activas a {zone.radiusKm} km de ti. Estas son las más recientes de México.
        </p>
      ) : null}

      {alerts.length > 0 ? (
        <ol
          aria-labelledby="alertas-recientes"
          aria-busy={loading || undefined}
          className={cn(
            'mt-2 divide-y divide-[#eef0f4] transition-opacity duration-200 dark:divide-white/5',
            loading && 'opacity-50'
          )}
        >
          {alerts.map((alert) => (
            <ZoneAlertRow key={alert.id} alert={alert} now={now} />
          ))}
        </ol>
      ) : (
        <div className="px-2 py-8 text-center">
          <p className="mb-5 text-[#5a5a5a] dark:text-[#b0b0b0]">
            Por ahora no hay alertas activas. Si tu mascota se perdió, repórtala y avisamos a quienes
            tienen alertas en esa zona.
          </p>
          <ReportLink
            href={`${Routes.animals.new}?status=lost`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Reportar mascota perdida
          </ReportLink>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-3 border-t border-[#eef0f4] px-2 pt-4 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
        {!zone && !location.permissionDenied ? (
          <button
            type="button"
            onClick={location.request}
            disabled={location.isLocating}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#dcdcdc] px-4 text-sm font-semibold text-[#3a3a3a] transition-colors hover:border-kadesh disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-white/15 dark:text-[#d0d0d0]"
          >
            <HugeiconsIcon icon={Location01Icon} size={18} strokeWidth={1.5} aria-hidden="true" />
            {location.isLocating ? 'Obteniendo ubicación…' : 'Ver las de mi zona'}
          </button>
        ) : !zone && location.permissionDenied ? (
          <p className="text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
            Sin tu ubicación te mostramos las más recientes de México.
          </p>
        ) : (
          <span />
        )}
        <Link
          href={Routes.animals.index}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
        >
          Ver todas en el mapa
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
