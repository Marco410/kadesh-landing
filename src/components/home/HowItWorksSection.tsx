'use client';

import { useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SentIcon,
  UserGroupIcon,
  FavouriteIcon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import { gsap, useGSAP, HOME_EASE } from 'kadesh/components/home/gsap-register';

const STEPS = [
  {
    number: '1',
    title: 'Reporta',
    description:
      'Reporta un animal perdido o en situación vulnerable. Tu información puede salvar una vida.',
    icon: SentIcon,
  },
  {
    number: '2',
    title: 'Conecta',
    description:
      'Conecta con rescatistas, veterinarias y refugios en tu área. La red se fortalece con cada conexión.',
    icon: UserGroupIcon,
  },
  {
    number: '3',
    title: 'Ayuda',
    description:
      'Apoya con donaciones, voluntariado o compartiendo información. Cada acción cuenta.',
    icon: FavouriteIcon,
  },
  {
    number: '4',
    title: 'Adopta',
    description:
      'Encuentra el compañero perfecto o ayuda a encontrar un hogar. Cada adopción es una historia de esperanza.',
    icon: CheckmarkCircle02Icon,
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
      className="w-full bg-white py-24 dark:bg-[#121212]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl">
            Cómo funciona KADESH
          </h2>
          <p className="text-lg text-[#5a5a5a] dark:text-[#b0b0b0]">
            Cuatro pasos para reportar, conectar, ayudar y adoptar en México.
          </p>
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
      </div>
    </section>
  );
}
