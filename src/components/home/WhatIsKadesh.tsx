'use client';

import { useRef } from 'react';
import { HOME_DEFINITION } from 'kadesh/components/home/constants';
import { gsap, useGSAP, ScrollTrigger, HOME_EASE } from 'kadesh/components/home/gsap-register';

const AUDIENCES = [
  {
    who: 'Quien busca un animal',
    job: 'Reporta o encuentra perros y gatos perdidos o en adopción cerca de ti.',
  },
  {
    who: 'Rescatistas y refugios',
    job: 'Publican casos, coordinan ayuda y visibilizan cada rescate ante la comunidad.',
  },
  {
    who: 'Veterinarias',
    job: 'Aparecen en el directorio local para quien necesita atención ahora.',
  },
] as const;

export default function WhatIsKadesh() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-about-lead]', {
          y: 20,
          filter: 'blur(8px)',
          opacity: 0,
          duration: 0.6,
          ease: HOME_EASE,
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 78%',
            once: true,
          },
        });

        gsap.from('[data-about-item]', {
          y: 16,
          opacity: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: HOME_EASE,
          scrollTrigger: {
            trigger: '[data-about-list]',
            start: 'top 85%',
            once: true,
          },
        });
      });

      return () => {
        mm.revert();
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === rootRef.current) t.kill();
        });
      };
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="que-es-kadesh"
      className="w-full bg-white py-24 dark:bg-night"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl">
          ¿Qué es KADESH?
        </h2>

        <p
          data-about-lead
          className="text-lg leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0] sm:text-xl"
        >
          {HOME_DEFINITION}
        </p>

        <p className="mt-6 font-semibold text-kadesh">
          Tecnología moderna. Corazón compasivo. Misión espiritual.
        </p>

        <dl data-about-list className="mt-14 grid gap-10 sm:grid-cols-3">
          {AUDIENCES.map((item) => (
            <div key={item.who} data-about-item>
              <dt className="text-sm font-semibold text-[#121212] dark:text-white">
                {item.who}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
                {item.job}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
