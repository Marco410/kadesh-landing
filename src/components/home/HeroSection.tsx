'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRightIcon, HospitalLocationIcon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { getStatusColor } from 'kadesh/components/animals/constants';
import { useChipPulse } from 'kadesh/components/animals/useChipMotion';
import { gsap, useGSAP, HOME_EASE } from 'kadesh/components/home/gsap-register';
import HeroMap from 'kadesh/components/home/HeroMap';
import type { PetLandingStats } from 'kadesh/components/home/server';
import StatsCounter from 'kadesh/components/home/StatsCounter';

const REPORT_LOST_HREF = `${Routes.animals.new}?status=lost`;

const SECONDARY_ACCESSES = [
  { href: `${Routes.animals.new}?status=found`, label: 'Encontré una mascota', status: 'found' },
  { href: `${Routes.animals.index}?status=in_adoption`, label: 'Quiero adoptar', status: 'in_adoption' },
  { href: `${Routes.animals.new}?status=in_adoption`, label: 'Dar en adopción', status: 'in_adoption' },
  { href: Routes.veterinaries.index, label: 'Veterinarias cerca de mí', status: null },
] as const;

function ReportLostCta() {
  const { ref, pulse } = useChipPulse<HTMLAnchorElement>();
  return (
    <Link
      ref={ref}
      href={REPORT_LOST_HREF}
      onPointerDown={pulse}
      className="inline-flex min-h-14 w-full origin-center items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-4 text-base font-bold text-white shadow-[0_10px_28px_rgba(127,29,29,0.35)] transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_14px_32px_rgba(127,29,29,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-lg"
    >
      <span>Reportar mascota perdida</span>
      <HugeiconsIcon className="h-5 w-5 flex-shrink-0" icon={ArrowRightIcon} />
    </Link>
  );
}

function AccessChip({ access }: { access: (typeof SECONDARY_ACCESSES)[number] }) {
  const { ref, pulse } = useChipPulse<HTMLAnchorElement>();
  return (
    <Link
      ref={ref}
      href={access.href}
      onPointerDown={pulse}
      className="flex min-h-12 h-full origin-center items-center gap-3 rounded-xl border border-white/40 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {access.status ? (
        <span
          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
          style={{ backgroundColor: getStatusColor(access.status) }}
          aria-hidden
        />
      ) : (
        <HugeiconsIcon className="h-4 w-4 flex-shrink-0" icon={HospitalLocationIcon} aria-hidden />
      )}
      <span>{access.label}</span>
    </Link>
  );
}

function SecondaryAccessNav() {
  const scope = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const chips = gsap.utils.toArray<HTMLElement>('a', scope.current);
        gsap.timeline({ defaults: { ease: HOME_EASE } }).from(chips, {
          autoAlpha: 0,
          y: 8,
          scale: 0.92,
          duration: 0.32,
          stagger: 0.05,
        });
      });
      return () => mm.revert();
    },
    { scope }
  );

  return (
    <nav aria-label="Otros accesos">
      <ul ref={scope} className="grid grid-cols-2 gap-2">
        {SECONDARY_ACCESSES.map((access) => (
          <li key={access.label}>
            <AccessChip access={access} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Por debajo de esto la cifra resta más de lo que suma y no se muestra (como en kadesh-business). */
const MIN_STAT_TO_SHOW = 10;

/** Redondea hacia abajo para presumir sin exagerar: 48,321 → "48,000+", 734 → "730+". */
function roundDownForDisplay(value: number): number {
  if (value >= 10_000) return Math.floor(value / 1_000) * 1_000;
  if (value >= 1_000) return Math.floor(value / 100) * 100;
  if (value >= 100) return Math.floor(value / 10) * 10;
  return value;
}

/**
 * Prueba social: veterinarias y ciudades. No se muestran animales registrados ni reencuentros
 * hasta que exista una cifra real de reencuentros que se vea bien.
 */
function HeroProof({ stats }: { stats: PetLandingStats }) {
  const showVets = stats.veterinaries >= MIN_STAT_TO_SHOW;
  const showCities = stats.cities >= MIN_STAT_TO_SHOW;
  if (!showVets) return null;

  return (
    <p className="kadesh-hero-in kadesh-hero-in-delay-3 mx-auto mt-10 flex max-w-lg flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-white/15 pt-6 text-base text-white/90 lg:mx-0 lg:justify-start">
      <HugeiconsIcon icon={HospitalLocationIcon} size={18} strokeWidth={2} aria-hidden />
      <strong className="font-black text-white">
        <StatsCounter value={roundDownForDisplay(stats.veterinaries)} suffix="+" />
      </strong>
      <span>veterinarias</span>
      {showCities && (
        <>
          <span>en</span>
          <strong className="font-black text-white">
            <StatsCounter value={roundDownForDisplay(stats.cities)} suffix="+" />
          </strong>
          <span>ciudades de México</span>
        </>
      )}
    </p>
  );
}

export default function HeroSection({
  stats,
}: {
  stats?: PetLandingStats | null;
}) {
  return (
    <section
      id="inicio"
      className="kadesh-hero relative flex min-h-[92vh] w-full items-center overflow-hidden"
    >
      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 px-4 py-28 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,30rem)] lg:gap-20 xl:gap-28 lg:px-8 lg:py-32">
        <div className="max-w-2xl text-center lg:text-left">
          <p className="kadesh-hero-in mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/80">
            Conectando vidas. Rescatando almas.
          </p>

          <h1 className="kadesh-hero-in mb-6 text-4xl font-black leading-[1.02] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            ¿Se perdió tu mascota? Repórtala gratis y que tu colonia la busque contigo
          </h1>

          <p className="kadesh-hero-in kadesh-hero-in-delay-1 mx-auto mb-8 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl lg:mx-0">
            Sube su foto y el último lugar donde la viste. La ponemos en el mapa
            de tu zona y la compartimos en la página de Facebook de Kadesh Pet.
          </p>

          <div className="kadesh-hero-in kadesh-hero-in-delay-2 mx-auto flex w-full max-w-lg flex-col gap-5 lg:mx-0">
            <div>
              <ReportLostCta />
              <p className="mt-3 text-sm text-white/85">
                Gratis siempre · Crear tu cuenta toma 1 minuto · Listo en 2 minutos
              </p>
            </div>
            <SecondaryAccessNav />
          </div>

          {stats && <HeroProof stats={stats} />}
        </div>

        <HeroMap />
      </div>

      <div className="kadesh-hero-fade" />
    </section>
  );
}
