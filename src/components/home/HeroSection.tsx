'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRightIcon, HospitalLocationIcon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { getStatusColor } from 'kadesh/components/animals/constants';
import HeroMap from 'kadesh/components/home/HeroMap';

const ANIMAL_JOBS = [
  {
    href: `${Routes.animals.new}?status=lost`,
    label: 'Perdí una mascota',
    status: 'lost',
  },
  {
    href: `${Routes.animals.new}?status=found`,
    label: 'Encontré una mascota',
    status: 'found',
  },
  {
    href: `${Routes.animals.new}?status=in_adoption`,
    label: 'Quiero dar en adopción',
    status: 'in_adoption',
  },
  {
    href: `${Routes.animals.index}?status=in_adoption`,
    label: 'Quiero adoptar',
    status: 'in_adoption',
  },
] as const;

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="kadesh-hero relative flex min-h-[92vh] w-full items-center overflow-hidden"
    >
      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 px-4 py-28 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,30rem)] lg:gap-20 xl:gap-28 lg:px-8 lg:py-32">
        <div className="max-w-2xl text-center lg:text-left">
          <h1 className="kadesh-hero-in mb-6 text-5xl font-black leading-[0.95] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
            Conectando vidas.
            <br />
            Rescatando almas.
          </h1>

          <p className="kadesh-hero-in kadesh-hero-in-delay-1 mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl lg:mx-0">
            Encuentra veterinarias cerca de ti. Da de alta una mascota que
            perdiste, encontraste, quieres dar en adopción o adoptar.
          </p>

          <div className="kadesh-hero-in kadesh-hero-in-delay-2 mx-auto mb-8 flex w-full max-w-lg flex-col gap-5 lg:mx-0">
            <Link
              href={Routes.veterinaries.index}
              className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-base font-semibold text-kadesh shadow-[0_8px_24px_rgba(15,35,80,0.18)] transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,35,80,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-lg"
            >
              <HugeiconsIcon
                className="h-6 w-6 flex-shrink-0"
                icon={HospitalLocationIcon}
              />
              <span>Ver veterinarias cercanas</span>
              <HugeiconsIcon
                className="h-5 w-5 flex-shrink-0"
                icon={ArrowRightIcon}
              />
            </Link>

            <nav aria-label="Dar de alta o buscar un animal">
              <p className="mb-3 text-left text-sm font-semibold text-white">
                Da de alta o busca un animal
              </p>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ANIMAL_JOBS.map((job) => (
                  <li key={job.label}>
                    <Link
                      href={job.href}
                      className="flex min-h-12 items-center gap-3 rounded-xl border border-white/40 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <span
                        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: getStatusColor(job.status) }}
                        aria-hidden
                      />
                      <span>{job.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <Link
            href="/comunidad"
            className="kadesh-hero-in kadesh-hero-in-delay-3 text-sm font-medium text-white/80 underline decoration-white/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
          >
            Únete a la comunidad KADESH →
          </Link>
        </div>

        <HeroMap />
      </div>

      <div className="kadesh-hero-fade" />
    </section>
  );
}
