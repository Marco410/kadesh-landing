import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, ArrowRight01Icon, Calendar03Icon, Location01Icon } from '@hugeicons/core-free-icons';
import EventCard from 'kadesh/components/events/EventCard';
import type { HomeEvents } from 'kadesh/components/events/server';
import HomeEventsWeek from 'kadesh/components/home/HomeEventsWeek';
import { Routes } from 'kadesh/core/routes';

/**
 * «Campañas y jornadas» en la portada. Componente de servidor: los eventos llegan en el HTML (SEO).
 * Muestra todos los eventos de México de los próximos 7 días, sin filtro, en una tira por día
 * (`HomeEventsWeek`). Si la semana viene vacía, los siguientes eventos; si no hay ninguno, invita a
 * publicar. Lo de la zona de cada quien vive en `/eventos?cerca=1`.
 */
export default function UpcomingEventsSection({ events }: { events: HomeEvents }) {
  const hasWeek = events.week.length > 0;

  return (
    <section
      id="eventos"
      aria-labelledby="eventos-heading"
      className="w-full scroll-mt-20 bg-[#f7f8fa] py-24 dark:bg-night-raised"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-kadesh-700 dark:bg-white/10 dark:text-kadesh-300">
              <HugeiconsIcon icon={Calendar03Icon} size={16} strokeWidth={1.8} aria-hidden="true" />
              Eventos
            </p>
            <h2
              id="eventos-heading"
              className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl"
            >
              Campañas y jornadas para tus mascotas
            </h2>
            <p className="text-lg text-[#5a5a5a] dark:text-[#b0b0b0] sm:text-xl">
              Esterilizaciones, vacunación, ferias de adopción y más, organizadas por asociaciones, veterinarias y
              municipios. Las revisamos antes de publicarlas.
            </p>
          </div>
          <Link
            href={Routes.events.new}
            className="inline-flex min-h-12 shrink-0 items-center gap-2 self-start rounded-xl border border-kadesh-200 bg-white px-5 font-semibold text-kadesh-700 hover:border-kadesh dark:border-white/15 dark:bg-transparent dark:text-kadesh-300 lg:self-auto"
          >
            <HugeiconsIcon icon={Add01Icon} size={18} aria-hidden="true" />
            Publicar un evento
          </Link>
        </div>

        {hasWeek ? (
          <HomeEventsWeek from={events.from} events={events.week} />
        ) : events.next.length > 0 ? (
          <div>
            <p className="mb-4 text-sm font-semibold text-[#3a3a3a] dark:text-[#d0d0d0]">
              No hay eventos en los próximos 7 días. Estos son los siguientes:
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.next.map((item) => (
                <EventCard key={item.event.id} item={item} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#d8dee8] bg-white px-6 py-12 text-center dark:border-white/15 dark:bg-[#1e1e1e]">
            <p className="mb-2 text-lg font-bold text-[#121212] dark:text-white">¿Organizas una campaña?</p>
            <p className="mx-auto max-w-lg text-[#5a5a5a] dark:text-[#b0b0b0]">
              Publícala gratis en Kadesh Pet y avisamos a la gente que tiene alertas en esa zona, municipio o estado.
            </p>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`${Routes.events.index}?cerca=1`}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
          >
            <HugeiconsIcon icon={Location01Icon} size={18} aria-hidden="true" />
            Ver eventos cerca de ti
          </Link>
          <Link
            href={Routes.events.index}
            className="inline-flex min-h-12 items-center gap-2 font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
          >
            Ver todos los eventos
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
