import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
  Task01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { RESCUE_ORG_TYPE_OPTIONS } from 'kadesh/components/rescue/constants';
import RescueJourney from './RescueJourney';

/** Lo que la vitrina no cuenta: el equipo, las solicitudes y el perfil verificado. */
const RESCUE_POINTS = [
  {
    icon: UserGroupIcon,
    title: 'Tu equipo, con roles.',
    body: 'Administración, coordinación, voluntariado y hogar temporal: cada quien ve y actualiza lo que le toca.',
  },
  {
    icon: Task01Icon,
    title: 'Solicitudes de adopción en orden.',
    body: '«Quiero adoptarlo» llega con un cuestionario y el compromiso de esterilizar, y la familia ve en qué va la suya.',
  },
  {
    icon: CheckmarkBadge01Icon,
    title: 'Un perfil que te consigue apoyo.',
    body: 'Ya verificado, tu página muestra a tus animales en adopción, tus historias con final feliz y cómo ayudarte.',
  },
] as const;

/**
 * «Espacios de rescate» en la portada: qué es, para quién y qué hace, con la vitrina de una ficha
 * de ejemplo y el botón para activar. Va antes de Aliados, que queda como su prueba.
 */
export default function RescueSpacesSection() {
  return (
    <section
      id="espacios-de-rescate"
      aria-labelledby="espacios-de-rescate-heading"
      className="w-full scroll-mt-20 overflow-hidden bg-[#f7f8fa] py-24 dark:bg-night-raised"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-20 px-4 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:px-8">
        <div className="max-w-xl">
          <h2
            id="espacios-de-rescate-heading"
            className="mb-5 text-4xl font-black tracking-[-0.03em] text-balance text-[#121212] dark:text-white sm:text-5xl"
          >
            Tu rescate en orden, desde que llega hasta que se va a casa
          </h2>
          <p className="text-lg leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
            Si rescatas, activa gratis tu espacio de rescate. Ahí llevas con tu equipo la ficha y la cartilla de
            cada animal, lo publicas en adopción a nombre de tu espacio y revisas las solicitudes. Cuando encuentra
            familia, su cartilla completa pasa a la cuenta de quien lo adopta.
          </p>

          <ul aria-label="Para quién es" className="mt-6 flex flex-wrap gap-2">
            {RESCUE_ORG_TYPE_OPTIONS.map((type) => (
              <li
                key={type.value}
                className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-[#3a3a3a] ring-1 ring-[#121212]/[0.06] dark:bg-white/5 dark:text-[#d0d0d0] dark:ring-white/10"
              >
                {type.label}
              </li>
            ))}
          </ul>

          <ul className="mt-10 space-y-5">
            {RESCUE_POINTS.map((point) => (
              <li key={point.title} className="flex gap-4">
                <HugeiconsIcon
                  icon={point.icon}
                  size={24}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-kadesh"
                  aria-hidden
                />
                <p className="leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
                  <strong className="font-bold text-[#121212] dark:text-white">{point.title}</strong> {point.body}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col items-start gap-x-7 gap-y-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={Routes.rescueActivate}
              className="inline-flex min-h-14 w-full items-center justify-center whitespace-nowrap rounded-2xl bg-kadesh px-8 py-4 text-lg font-bold text-white shadow-[0_10px_28px_-8px_rgba(15,35,80,0.35)] transition-[background-color,transform] duration-150 hover:-translate-y-0.5 hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh sm:w-auto"
            >
              Activar mi espacio de rescate
            </Link>
            <Link
              href={Routes.organizations.index}
              className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap font-semibold text-kadesh-700 underline-offset-4 hover:underline dark:text-kadesh-300"
            >
              Ver espacios verificados
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} aria-hidden />
            </Link>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
            Mientras verificamos tu espacio ya lo puedes usar con tu equipo. Tu perfil público aparece en cuanto
            lo verificamos.
          </p>
        </div>

        <RescueJourney />
      </div>
    </section>
  );
}
