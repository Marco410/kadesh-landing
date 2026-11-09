'use client';

import { useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkBadge01Icon,
  FavouriteIcon,
  File01Icon,
  Home09Icon,
  InjectionIcon,
  Megaphone01Icon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons';
import { gsap, useGSAP } from 'kadesh/components/home/gsap-register';
import { rescueStage } from 'kadesh/components/rescue/constants';

const stageChip = (value: string) => {
  const stage = rescueStage(value);
  return { label: stage?.label ?? '', tone: stage?.tone ?? '' };
};

/**
 * El recorrido de un animal de ejemplo dentro de un espacio de rescate. Cada paso es algo que la
 * plataforma hace hoy; las etiquetas de etapa son las de la ficha interna (`PET_RESCUE_STAGE_OPTIONS`).
 */
const JOURNEY = [
  {
    title: 'Llegó al espacio',
    meta: '3 sep · Ana lo tiene en hogar temporal',
    icon: Home09Icon,
    chip: stageChip('intake'),
  },
  {
    title: 'Vacuna múltiple',
    meta: '10 sep · Recordatorio del refuerzo por WhatsApp',
    icon: InjectionIcon,
    chip: stageChip('treatment'),
  },
  {
    title: 'En adopción',
    meta: '24 sep · Publicado a nombre de Refugio Colibrí',
    icon: Megaphone01Icon,
    chip: stageChip('available'),
  },
  {
    title: 'Solicitud aprobada',
    meta: '2 oct · Familia Ruiz',
    icon: CheckmarkBadge01Icon,
    chip: stageChip('reserved'),
  },
  {
    title: 'Ya está en casa',
    meta: '6 oct · Su cartilla pasó a la cuenta de su familia',
    icon: FavouriteIcon,
    chip: {
      label: 'Adoptado',
      tone: 'bg-kadesh-50 text-kadesh-700 dark:bg-kadesh/15 dark:text-kadesh-200',
    },
  },
] as const;

const LAST = JOURNEY.length - 1;

/** Segundos entre un paso y el siguiente en la entrada. */
const STEP_GAP = 0.7;

/**
 * Vitrina de «Espacios de rescate» en la portada: la ficha de ejemplo de Bruno recorre su camino
 * (llega, cartilla, en adopción, solicitud, a casa) al entrar en pantalla, y su cartilla viaja del
 * refugio a su familia. Sin JS o con «reducir movimiento» se ve el estado final completo.
 */
export default function RescueJourney() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const steps = gsap.utils.toArray<HTMLElement>('[data-journey-step]');
        const segments = gsap.utils.toArray<HTMLElement>('[data-journey-segment]');
        const chips = gsap.utils.toArray<HTMLElement>('[data-journey-chip]');
        const cartilla = rootRef.current?.querySelector<HTMLElement>('[data-journey-cartilla]');
        const track = rootRef.current?.querySelector<HTMLElement>('[data-journey-track]');

        gsap.set(steps, { autoAlpha: 0, y: 14 });
        gsap.set(segments, { scaleY: 0 });
        gsap.set(chips, { autoAlpha: 0 });
        gsap.set(chips[0], { autoAlpha: 1 });
        gsap.set('[data-journey-toast]', { autoAlpha: 0, y: 10, scale: 0.96 });

        // GSAP no lee `cubic-bezier()` (HOME_EASE) sin CustomEase: `expo.out` es la misma curva.
        const tl = gsap.timeline({
          defaults: { ease: 'expo.out' },
          scrollTrigger: { trigger: rootRef.current, start: 'top 70%', once: true },
        });

        steps.forEach((step, index) => {
          const at = index * STEP_GAP;
          tl.to(step, { autoAlpha: 1, y: 0, duration: 0.6 }, at);
          if (index > 0) {
            tl.to(chips[index - 1], { autoAlpha: 0, duration: 0.2 }, at);
            tl.to(chips[index], { autoAlpha: 1, duration: 0.4 }, at + 0.1);
          }
        });
        segments.forEach((segment, index) => {
          tl.to(segment, { scaleY: 1, duration: STEP_GAP - 0.1, ease: 'power1.inOut' }, index * STEP_GAP + 0.15);
        });
        tl.to('[data-journey-toast]', { autoAlpha: 1, y: 0, scale: 1, duration: 0.7 }, STEP_GAP + 0.25);

        if (cartilla && track) {
          tl.from(
            cartilla,
            {
              x: () => -(track.offsetWidth - cartilla.offsetWidth),
              duration: 1.1,
              ease: 'power2.inOut',
            },
            LAST * STEP_GAP + 0.35,
          );
        }
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <figure
      ref={rootRef}
      role="img"
      aria-label="Ejemplo de la ficha de un animal en un espacio de rescate: llega, recibe su vacuna con recordatorio por WhatsApp, se publica en adopción, se aprueba una solicitud y su cartilla pasa a la cuenta de su familia."
      className="relative mx-auto w-full max-w-xl lg:mr-0"
    >
      {/* Brillo de marca detrás de la ficha, como en el panel. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 bg-[radial-gradient(60%_55%_at_70%_35%,color-mix(in_srgb,var(--color-kadesh)_14%,transparent),transparent_70%)] dark:bg-[radial-gradient(60%_55%_at_70%_35%,color-mix(in_srgb,var(--color-kadesh)_22%,transparent),transparent_70%)]"
      />

      <div className="relative rounded-3xl bg-white font-dash shadow-[0_2px_6px_rgba(15,35,80,0.06),0_32px_64px_-28px_rgba(15,35,80,0.32)] ring-1 ring-[#121212]/[0.06] dark:bg-night dark:shadow-[0_32px_64px_-28px_rgba(0,0,0,0.6)] dark:ring-white/10">
        <span className="absolute -top-3 left-6 rounded-full bg-[#121212] px-2.5 py-1 text-xs font-semibold text-white dark:bg-white dark:text-[#121212]">
          Ejemplo
        </span>

        <div className="flex items-center gap-4 border-b border-[#121212]/[0.06] p-5 pt-6 dark:border-white/10 sm:px-6">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-kadesh-50 text-kadesh-700 dark:bg-kadesh/15 dark:text-kadesh-200">
            <HugeiconsIcon icon={FavouriteIcon} size={24} strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold tracking-[-0.02em] text-[#121212] dark:text-white">Bruno</p>
            <p className="text-sm leading-snug text-[#5a5a5a] dark:text-[#b0b0b0]">Perro mestizo · Refugio Colibrí</p>
          </div>
          {/* Las etapas se apilan en la misma celda; sin animación se ve solo la última. */}
          <span className="grid shrink-0 justify-items-end">
            {JOURNEY.map((step, index) => (
              <span
                key={step.chip.label}
                data-journey-chip
                className={`[grid-area:1/1] whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${step.chip.tone} ${index === LAST ? '' : 'opacity-0'}`}
              >
                {step.chip.label}
              </span>
            ))}
          </span>
        </div>

        <ol className="p-5 sm:px-6">
          {JOURNEY.map((step, index) => (
            <li key={step.title} data-journey-step className="relative flex gap-4 pb-6 last:pb-1">
              {index < LAST && (
                <span
                  data-journey-segment
                  className="absolute top-10 bottom-1 left-[17.5px] w-px origin-top bg-kadesh/35"
                />
              )}
              <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-kadesh text-white shadow-[0_4px_10px_-2px_rgba(15,35,80,0.25)]">
                <HugeiconsIcon icon={step.icon} size={18} strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <p className="font-semibold leading-snug text-[#121212] dark:text-white">{step.title}</p>
                <p className="mt-0.5 text-sm leading-snug text-[#5a5a5a] dark:text-[#b0b0b0]">{step.meta}</p>

                {index === LAST && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold sm:gap-2">
                    <span className="min-w-0 truncate rounded-full bg-[#f1f3f6] px-2.5 py-1 text-[#3a3a3a] dark:bg-white/10 dark:text-[#d0d0d0]">
                      Refugio Colibrí
                    </span>
                    <span data-journey-track className="relative flex h-7 min-w-10 flex-1 items-center">
                      <span className="h-px w-full bg-[repeating-linear-gradient(90deg,color-mix(in_srgb,var(--color-kadesh)_45%,transparent)_0_4px,transparent_4px_8px)]" />
                      <span
                        data-journey-cartilla
                        className="absolute right-0 flex size-7 items-center justify-center rounded-lg bg-white text-kadesh-700 shadow-[0_4px_12px_-2px_rgba(15,35,80,0.3)] ring-1 ring-kadesh/20 dark:bg-night-raised dark:text-kadesh-200"
                      >
                        <HugeiconsIcon icon={File01Icon} size={15} strokeWidth={1.8} />
                      </span>
                    </span>
                    <span className="min-w-0 truncate rounded-full bg-kadesh-50 px-2.5 py-1 text-kadesh-700 dark:bg-kadesh/15 dark:text-kadesh-200">
                      Familia Ruiz
                    </span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* El recordatorio que le llega al hogar temporal, como una notificación encima de la ficha. */}
      <div
        data-journey-toast
        className="absolute -top-16 right-4 hidden w-64 items-start gap-3 rounded-2xl bg-white p-3.5 font-dash shadow-[0_2px_6px_rgba(15,35,80,0.08),0_20px_40px_-16px_rgba(15,35,80,0.35)] ring-1 ring-[#121212]/[0.06] sm:flex lg:-right-10 dark:bg-night-raised dark:ring-white/10"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
          <HugeiconsIcon icon={WhatsappIcon} size={17} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 text-sm leading-snug">
          <span className="block font-semibold text-[#121212] dark:text-white">Recordatorio</span>
          <span className="block text-[#5a5a5a] dark:text-[#b0b0b0]">El refuerzo de Bruno es en 3 días.</span>
        </span>
      </div>
    </figure>
  );
}
