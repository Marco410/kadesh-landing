'use client';

import { useRef, useState } from 'react';
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
import {
  ANIMAL_TYPE_LABELS,
  getStatusColor,
  getStatusLabel,
} from 'kadesh/components/animals/constants';
import { gsap, useGSAP, HOME_EASE } from 'kadesh/components/home/gsap-register';
import {
  useRecentReports,
  type RecentReport,
  type RecentReportStatus,
} from 'kadesh/components/home/hooks/useRecentReports';
import { DEFAULT_RADIUS } from 'kadesh/constants/constans';
import { Routes } from 'kadesh/core/routes';
import ReportLink from 'kadesh/components/animals/ReportLink';
import { cn } from 'kadesh/utils/cn';
import { formatDate } from 'kadesh/utils/format-date';
import { useRememberedLocation } from 'kadesh/utils/useRememberedLocation';
import { Bone, LoadingBar, SkeletonRegion, boneWidth } from 'kadesh/components/ui/skeleton';

const FILTERS: { label: string; value: RecentReportStatus }[] = [
  { label: 'Perdidos', value: 'lost' },
  { label: 'Encontrados', value: 'found' },
  { label: 'En adopción', value: 'in_adoption' },
];

function reportTitle(report: RecentReport): string {
  return report.name?.trim() || ANIMAL_TYPE_LABELS[report.typeName] || 'Sin nombre';
}

function ReportCard({ report }: { report: RecentReport }) {
  const title = reportTitle(report);
  const typeLabel = ANIMAL_TYPE_LABELS[report.typeName];

  return (
    <article
      data-report-card
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,35,80,0.1)] dark:border-[#2a2a2a] dark:bg-[#1e1e1e]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e8edf3] dark:bg-[#2a3548]">
        {report.imageUrl ? (
          <Image
            src={report.imageUrl}
            alt={`${title}, ${getStatusLabel(report.status).toLowerCase()}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#5a5a5a]">
            <HugeiconsIcon icon={Image01Icon} size={40} strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
        <span
          className="absolute top-3 left-3 z-10 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-md"
          style={{ backgroundColor: getStatusColor(report.status) }}
        >
          {getStatusLabel(report.status)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-[#212121] dark:text-white">
          <Link
            href={animalDetailHref(report)}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {title}
          </Link>
        </h3>
        {typeLabel && typeLabel !== title && (
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">{typeLabel}</p>
        )}
        {report.place && (
          <p className="flex items-start gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0]">
            <HugeiconsIcon icon={Location01Icon} size={16} className="mt-0.5 flex-shrink-0" aria-hidden />
            <span className="line-clamp-1">{report.place}</span>
          </p>
        )}
        <p className="mt-auto pt-2 text-sm font-medium text-[#5a5a5a] dark:text-[#9aa3b2]">
          {formatDate(report.createdAt)}
          {report.distance != null && (
            <span className="text-kadesh">
              {' · '}
              {report.distance < 1
                ? `a ${Math.round(report.distance * 1000)} m`
                : `a ${report.distance.toFixed(1)} km`}
            </span>
          )}
        </p>
      </div>
    </article>
  );
}

const SKELETON_TITLE_WIDTHS = ['58%', '44%', '52%'] as const;
const SKELETON_PLACE_WIDTHS = ['66%', '74%', '54%'] as const;

/** Silueta de `ReportCard`, con sus mismas medidas. */
function ReportCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
      <Bone kind="box" radius={0} className="aspect-[4/3]" />
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <Bone kind="title" slot={28} width={boneWidth(SKELETON_TITLE_WIDTHS, index)} />
        <Bone kind="line" slot={20} width={64} />
        <Bone kind="line" slot={20} width={boneWidth(SKELETON_PLACE_WIDTHS, index)} />
        <Bone kind="line" slot={20} width={150} className="mt-auto pt-2" />
      </div>
    </div>
  );
}

export default function RecentReportsSection() {
  const rootRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<RecentReportStatus | null>(null);
  const {
    coords,
    permissionDenied,
    isLocating,
    request: handleUseLocation,
  } = useRememberedLocation();
  const { reports, isNearby, loading, refreshing } = useRecentReports(coords, status);

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
          <SkeletonRegion
            label="Cargando reportes"
            className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[0, 1, 2].map((index) => (
              <ReportCardSkeleton key={index} index={index} />
            ))}
          </SkeletonRegion>
        ) : reports.length > 0 ? (
          <div
            data-report-grid
            className={cn(
              'mb-10 grid grid-cols-1 gap-6 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3',
              refreshing && 'opacity-50'
            )}
          >
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
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

        <div className="text-center">
          <Link
            href={status ? `${Routes.animals.index}?status=${status}` : Routes.animals.index}
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
          >
            Ver todos en el mapa
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
