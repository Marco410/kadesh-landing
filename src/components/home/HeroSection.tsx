'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Logo from '../shared/Logo';
import { HugeiconsIcon } from '@hugeicons/react';
import { HospitalLocationIcon, GlobalSearchIcon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { gsap, useGSAP, HOME_EASE } from 'kadesh/components/home/gsap-register';

export default function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-hero-title]', {
          clipPath: 'inset(0 100% 0 0)',
          duration: 0.85,
          ease: HOME_EASE,
        });
        gsap.from('[data-hero-copy]', {
          y: 18,
          opacity: 0,
          duration: 0.5,
          delay: 0.18,
          ease: HOME_EASE,
        });
        gsap.from('[data-hero-actions]', {
          y: 16,
          opacity: 0,
          duration: 0.45,
          delay: 0.32,
          ease: HOME_EASE,
        });
        gsap.from('[data-hero-mark]', {
          scale: 0.92,
          opacity: 0,
          duration: 0.7,
          delay: 0.22,
          ease: HOME_EASE,
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="inicio"
      className="kadesh-hero-wash relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-16 lg:flex-row">
          <div className="flex-1 text-center lg:text-left">
            <h1
              data-hero-title
              className="mb-6 text-5xl font-black leading-[0.95] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl"
            >
              Conectando vidas.
              <br />
              <span className="text-white/80">Rescatando almas.</span>
            </h1>

            <p
              data-hero-copy
              className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl lg:mx-0"
            >
              KADESH es el santuario digital para encontrar animales perdidos, apoyar
              rescatistas y conectar con veterinarias y refugios.
            </p>

            <div
              data-hero-actions
              className="mb-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link
                href={Routes.veterinaries.index}
                className="group inline-flex min-w-[220px] items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-base font-semibold text-kadesh shadow-[0_8px_24px_rgba(15,35,80,0.18)] transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,35,80,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-lg"
              >
                <HugeiconsIcon
                  className="h-6 w-6 flex-shrink-0"
                  icon={HospitalLocationIcon}
                />
                <span>Ver veterinarias cercanas</span>
              </Link>

              <Link
                href={Routes.animals.index}
                className="group inline-flex min-w-[220px] items-center justify-center gap-3 rounded-2xl border border-white/35 bg-white/10 px-7 py-4 text-base font-semibold text-white backdrop-blur-sm transition-[transform,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-lg"
              >
                <HugeiconsIcon
                  icon={GlobalSearchIcon}
                  className="h-6 w-6 flex-shrink-0 text-white"
                />
                <span>Animales perdidos cerca de ti</span>
              </Link>
            </div>

            <Link
              href="/comunidad"
              className="text-sm font-medium text-white/80 underline decoration-white/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
            >
              Únete a la comunidad KADESH →
            </Link>
          </div>

          <div data-hero-mark className="flex flex-1 justify-center lg:justify-end">
            <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80 lg:h-96 lg:w-96">
              <div className="kadesh-logo-glow pointer-events-none absolute inset-6 rounded-full bg-white blur-3xl" />
              <Logo size={150} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
