'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Location01Icon,
  Note01Icon,
  SentIcon,
  Share08Icon,
} from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import ReportLink from 'kadesh/components/animals/ReportLink';
import { gsap, useGSAP, HOME_EASE } from 'kadesh/components/home/gsap-register';

/**
 * El paso 4 usa la versión «Ayuda a otros» mientras no exista el estado «Reencontrado».
 * Cuando exista, cámbialo por «Márcalo como reencontrado».
 */
const STEPS = [
  {
    number: '1',
    title: 'Repórtalo',
    description:
      'Sube una foto, el tipo de animal y el último lugar donde lo viste. Toma 2 minutos.',
    icon: SentIcon,
  },
  {
    number: '2',
    title: 'Aparece en el mapa',
    description:
      'Vecinos, rescatistas y veterinarias de tu zona pueden verlo y escribirte.',
    icon: Location01Icon,
  },
  {
    number: '3',
    title: 'Sigue el caso',
    description:
      'Agrega actualizaciones, fotos y comentarios en la bitácora de su ficha para que la comunidad sepa cómo va.',
    icon: Note01Icon,
  },
  {
    number: '4',
    title: 'Ayuda a otros',
    description:
      'Comparte reportes de tu zona: un mensaje puede ser el que lo traiga de vuelta.',
    icon: Share08Icon,
  },
] as const;

export default function HowItWorksSection() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-step]', {
          y: 24,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: HOME_EASE,
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 75%',
            once: true,
          },
        });

        gsap.from('[data-step-line]', {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 0.8,
          delay: 0.2,
          ease: HOME_EASE,
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 75%',
            once: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="como-funciona"
      className="w-full bg-white py-24 dark:bg-night"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl">
            De perdido a reencontrado en 4 pasos
          </h2>
        </div>

        <ol className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.number} data-step className="relative">
              {index < STEPS.length - 1 && (
                <div
                  data-step-line
                  className="pointer-events-none absolute top-7 left-[calc(100%-0.5rem)] z-0 hidden h-px w-[calc(100%-2rem)] origin-left bg-kadesh/30 lg:block"
                />
              )}
              <div className="relative z-10">
                <div className="mb-5 flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-kadesh text-xl font-black text-white">
                    {step.number}
                  </span>
                  <HugeiconsIcon
                    icon={step.icon}
                    size={28}
                    className="text-kadesh"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-[#121212] dark:text-white">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-col items-center gap-5 text-center">
          <ReportLink
            href={`${Routes.animals.new}?status=lost`}
            className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-red-600 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Reportar mascota perdida
          </ReportLink>
          <p className="text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
            ¿Quieres adoptar?{' '}
            <Link
              href={`${Routes.animals.index}?status=in_adoption`}
              className="font-semibold text-kadesh-700 underline-offset-4 hover:underline dark:text-kadesh-300"
            >
              Ver animales en adopción
            </Link>
            {' · '}¿Eres rescatista?{' '}
            <ReportLink
              href={`${Routes.animals.new}?status=rescued`}
              className="font-semibold text-kadesh-700 underline-offset-4 hover:underline dark:text-kadesh-300"
            >
              Publica tus casos
            </ReportLink>
          </p>
        </div>
      </div>
    </section>
  );
}
