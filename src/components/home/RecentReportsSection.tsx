'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert02Icon,
  ArrowRight01Icon,
  Image01Icon,
  Location01Icon,
} from '@hugeicons/core-free-icons';
import { animalDetailHref } from 'kadesh/components/animals/animalSlug';
import { getStatusColor, getStatusLabel } from 'kadesh/components/animals/constants';
import { gsap, useGSAP, HOME_EASE } from 'kadesh/components/home/gsap-register';
import {
  RECENT_REPORTS_LIMIT,
  useRecentReports,
  type RecentReport,
  type RecentReportStatus,
} from 'kadesh/components/home/hooks/useRecentReports';
import { reportDateBadge } from 'kadesh/components/home/recentReports';
import RecentReportsMiniMap from 'kadesh/components/home/RecentReportsMiniMap';
import { DEFAULT_RADIUS } from 'kadesh/constants/constans';
import { Routes } from 'kadesh/core/routes';
import ReportLink from 'kadesh/components/animals/ReportLink';
import { cn } from 'kadesh/utils/cn';
import { useRememberedLocation } from 'kadesh/utils/useRememberedLocation';
import { Bone, LoadingBar, SkeletonRegion } from 'kadesh/components/ui/skeleton';
import { animalDisplayName } from 'kadesh/components/animals/animalName';

const FILTERS: { label: string; value: RecentReportStatus }[] = [
  { label: 'Perdidos', value: 'lost' },
  { label: 'Encontrados', value: 'found' },
  { label: 'En adopción', value: 'in_adoption' },
];

function reportTitle(report: RecentReport): string {
  return animalDisplayName({ name: report.name, typeName: report.typeName });
}

const subscribeNever = () => () => {};

/**
 * `false` en el servidor y al hidratar, `true` después. La fecha relativa («Hoy», «Ayer») depende
 * del reloj y de la zona horaria: el servidor (UTC, HTML en caché) y el navegador darían textos
 * distintos y React fallaría al hidratar. Por eso se pinta ya en el navegador.
 */
function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

function distanceText(distance: number | null): string | null {
  if (distance == null) return null;
  return distance < 1 ? `a ${Math.round(distance * 1000)} m` : `a ${distance.toFixed(1)} km`;
}

/**
 * Cuadro del feed: foto cuadrada, badge de fecha («Hoy», «Ayer»…) arriba a la izquierda, punto con
 * el color del estado arriba a la derecha y, sobre un degradado, el nombre y la distancia o ciudad.
 */
function ReportTile({ report }: { report: RecentReport }) {
  const hydrated = useHydrated();
  const title = reportTitle(report);
  const statusLabel = getStatusLabel(report.status);
  const badge = hydrated ? reportDateBadge(report.createdAt) : null;
  const where = distanceText(report.distance) ?? report.place;

  return (
    <li data-report-card className="group relative aspect-square overflow-hidden bg-[#e8edf3] dark:bg-[#2a3548] sm:rounded-xl">
      {report.imageUrl ? (
        <Image
          src={report.imageUrl}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#5a5a5a]">
          <HugeiconsIcon icon={Image01Icon} size={32} strokeWidth={1.5} aria-hidden="true" />
        </div>
      )}
      {badge ? (
        <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#121212] shadow-sm sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:text-[11px]">
          {badge}
        </span>
      ) : null}
      <span
        className="absolute right-1.5 top-1.5 z-10 h-3 w-3 rounded-full ring-2 ring-white sm:right-2.5 sm:top-2.5 sm:h-3.5 sm:w-3.5"
        style={{ backgroundColor: getStatusColor(report.status) }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-2 pb-1.5 pt-6 sm:px-3 sm:pb-2.5 sm:pt-10">
        <p className="truncate text-xs font-bold text-white sm:text-base">
          <Link
            href={animalDetailHref(report)}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {title}
            <span className="sr-only">, {statusLabel.toLowerCase()}</span>
          </Link>
        </p>
        {where ? (
          <p className="truncate text-[10px] font-medium text-white/85 sm:text-xs">
            <span className="sm:hidden">{statusLabel} · </span>
            {where}
          </p>
        ) : null}
      </div>
      {/* Anillo de foco sobre todo el cuadro (el enlace cubre el cuadro con `after`). */}
      <span className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] ring-kadesh ring-offset-0 group-has-[:focus-visible]:ring-4" aria-hidden="true" />
    </li>
  );
}

/**
 * Primer cuadro del feed, con la misma estructura que los de foto: arriba a la izquierda una
 * pastilla blanca («Gratis», mismo estilo que «Hoy») y abajo el texto. Fondo: el rojo del botón
 * principal del hero y del pin «Perdido».
 */
function ReportTileCta() {
  return (
    <li className="relative aspect-square overflow-hidden bg-red-600 transition-colors hover:bg-red-700 sm:rounded-xl">
      <ReportLink
        href={`${Routes.animals.new}?status=lost`}
        className="group/cta flex h-full w-full flex-col justify-end px-2 pb-1.5 text-white focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-white sm:px-4 sm:pb-3.5"
      >
        <span className="absolute left-1.5 top-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700 shadow-sm sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:text-[11px]">
          Gratis
        </span>
        <span className="text-[13px] font-black leading-[1.05] tracking-[-0.02em] sm:text-2xl lg:text-[1.7rem]">
          ¿Se perdió tu mascota?
        </span>
        <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-white/90 sm:mt-2 sm:text-sm">
          Repórtala aquí
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="h-3 w-3 shrink-0 transition-transform duration-200 group-hover/cta:translate-x-1 sm:h-4 sm:w-4"
            strokeWidth={2.4}
            aria-hidden="true"
          />
        </span>
      </ReportLink>
    </li>
  );
}

/** Silueta de la cuadrícula, con sus mismas medidas. */
function ReportGridSkeleton() {
  return (
    <SkeletonRegion
      label="Cargando reportes"
      className="-mx-4 mb-0.5 grid grid-cols-3 gap-0.5 sm:mx-0 sm:mb-6 sm:gap-3 lg:grid-cols-4"
    >
      {Array.from({ length: RECENT_REPORTS_LIMIT + 1 }, (_, index) => (
        <Bone key={index} kind="box" radius={0} className="aspect-square sm:rounded-xl" />
      ))}
    </SkeletonRegion>
  );
}

/** `initialReports`: los más recientes del país, ya pintados por el servidor (sin filtro). */
export default function RecentReportsSection({ initialReports = [] }: { initialReports?: RecentReport[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<RecentReportStatus | null>(null);
  const {
    coords,
    permissionDenied,
    isLocating,
    request: handleUseLocation,
  } = useRememberedLocation();
  const { reports, isNearby, loading, refreshing } = useRecentReports(coords, status, initialReports);

  useGSAP(
    () => {
      if (loading || reports.length === 0) return;

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-report-card]', {
          y: 28,
          opacity: 0,
          duration: 0.5,
          stagger: { each: 0.06, amount: 0.3 },
          ease: HOME_EASE,
          scrollTrigger: {
            trigger: '[data-report-grid]',
            start: 'top 80%',
            once: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [loading, reports.length, status] }
  );

  return (
    <section
      ref={rootRef}
      id="animales"
      aria-labelledby="reportes-heading"
      className="w-full scroll-mt-20 bg-[#f7f8fa] py-24 dark:bg-night-raised"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2
            id="reportes-heading"
            className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl"
          >
            Ellos están buscando a su familia ahora mismo
          </h2>
          <p className="text-lg text-[#5a5a5a] dark:text-[#b0b0b0] sm:text-xl">
            Reportes reales de los últimos días. Si reconoces a alguno, abre su
            ficha y avisa a quien lo reportó.
          </p>
        </div>

        <div className="mb-10 flex flex-col items-center gap-4">
          <div role="group" aria-label="Filtrar reportes" className="flex flex-wrap justify-center gap-2">
            {FILTERS.map((filter) => {
              const active = status === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatus(active ? null : filter.value)}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh',
                    active
                      ? 'border-kadesh bg-kadesh text-white'
                      : 'border-[#dcdcdc] bg-white text-[#3a3a3a] hover:border-kadesh dark:border-white/15 dark:bg-night dark:text-[#d0d0d0]'
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full ring-2 ring-white/70"
                    style={{ backgroundColor: getStatusColor(filter.value) }}
                    aria-hidden
                  />
                  {filter.label}
                </button>
              );
            })}
          </div>
          <LoadingBar active={refreshing} className="w-full max-w-xs" />

          {!coords && !permissionDenied && (
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={isLocating}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
            >
              <HugeiconsIcon icon={Location01Icon} size={18} strokeWidth={1.5} aria-hidden="true" />
              {isLocating ? 'Obteniendo ubicación…' : 'Ver los de mi zona'}
            </button>
          )}

          {permissionDenied && (
            <p className="inline-flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-left text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              <HugeiconsIcon icon={Alert02Icon} size={18} className="mt-0.5 flex-shrink-0" />
              <span>Sin tu ubicación te mostramos los reportes más recientes de todo el país.</span>
            </p>
          )}

          {coords && !loading && !isNearby && reports.length > 0 && (
            <p className="text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
              No hay reportes a {DEFAULT_RADIUS} km de ti. Estos son los más recientes del país.
            </p>
          )}
        </div>

        {loading ? (
          <ReportGridSkeleton />
        ) : reports.length > 0 ? (
          <ul
            data-report-grid
            aria-label="Reportes recientes"
            className={cn(
              '-mx-4 mb-0.5 grid grid-cols-3 gap-0.5 transition-opacity duration-200 sm:mx-0 sm:mb-6 sm:gap-3 lg:grid-cols-4',
              refreshing && 'opacity-50'
            )}
          >
            <ReportTileCta />
            {reports.map((report) => (
              <ReportTile key={report.id} report={report} />
            ))}
          </ul>
        ) : (
          <div className="mb-10 flex flex-col items-center px-4 py-12 text-center">
            <p className="mb-6 max-w-md text-[#5a5a5a] dark:text-[#b0b0b0]">
              No hay reportes con este filtro por ahora. Si tu mascota se perdió,
              sé el primero en reportarla.
            </p>
            <ReportLink
              href={`${Routes.animals.new}?status=lost`}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Reportar mascota perdida
            </ReportLink>
          </div>
        )}

        <RecentReportsMiniMap
          reports={loading ? [] : reports}
          coords={isNearby ? coords : null}
          href={status ? `${Routes.animals.index}?status=${status}` : Routes.animals.index}
        />
      </div>
    </section>
  );
}
