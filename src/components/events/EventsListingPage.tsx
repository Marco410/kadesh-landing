import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, ArrowRight01Icon, Calendar03Icon, Notification03Icon } from '@hugeicons/core-free-icons';
import JsonLd from 'kadesh/components/blog/JsonLd';
import { Footer, Navigation } from 'kadesh/components/layout';
import { Routes } from 'kadesh/core/routes';
import { EVENT_ALERTS, EVENTS_PAGE_SIZE } from './constants';
import EventsIndexClient, { type EventsIndexFilters } from './EventsIndexClient';
import { EVENTS_FAQ, buildEventsListingJsonLd, eventsPlaceName, type EventsPlace } from './events-seo';
import { eventTimeZone, formatEventDateWithYear, whenUntil } from './format';
import { fetchEventFacets, fetchEventsFeed } from './server';
import type { EventsFeed, EventStateFacet } from './types';

/** Datos de un listado (los piden la página y sus metadatos; `fetch` los comparte en la misma petición). */
export async function loadEventsListing(filters: EventsIndexFilters): Promise<{ feed: EventsFeed; facets: EventStateFacet[] }> {
  const [feed, facets] = await Promise.all([
    fetchEventsFeed({
      state: filters.state,
      city: filters.city,
      category: filters.category,
      to: whenUntil(filters.when),
      take: EVENTS_PAGE_SIZE,
      skip: 0,
    }),
    fetchEventFacets(),
  ]);
  return { feed, facets };
}

/**
 * Frase con datos de un lugar (lo que citan buscadores e IA): cuántos eventos hay, en cuántos
 * municipios y cuál es el próximo, con fecha y año.
 */
function placeFacts(place: EventsPlace, feed: EventsFeed, facets: EventStateFacet[]): string {
  const placeName = eventsPlaceName(place);
  if (!placeName) return '';
  if (feed.total === 0) {
    return `Por ahora no hay eventos próximos publicados en ${placeName}. Activa tus alertas de zona y te avisamos en cuanto haya uno, o publica el tuyo.`;
  }
  const cities = !place.city ? facets.find((facet) => facet.slug === place.state?.slug)?.cities.length ?? 0 : 0;
  const parts = [
    `Hay ${feed.total} ${feed.total === 1 ? 'evento próximo' : 'eventos próximos'} en ${placeName}${
      cities > 1 ? `, en ${cities} municipios` : ''
    }.`,
  ];
  const next = feed.items[0];
  if (next?.nextStartsAt) {
    const where = !place.city && next.event.city ? ` en ${next.event.city}` : '';
    parts.push(
      `El próximo es «${next.event.title}»${where}, el ${formatEventDateWithYear(next.nextStartsAt, eventTimeZone(next.event))}.`,
    );
  }
  return parts.join(' ');
}

const chipLinkClass =
  'inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#dcdcdc] bg-white px-3.5 text-sm font-semibold text-[#3a3a3a] transition-colors hover:border-kadesh dark:border-white/15 dark:bg-night dark:text-[#d0d0d0]';

/**
 * Listado de eventos: `/eventos` (todo México) y las páginas por estado y municipio
 * (`/eventos/en/<estado>` y `/eventos/en/<estado>/<municipio>`). Lo pinta el servidor con su JSON-LD;
 * los filtros y «Cerca de mí» los maneja `EventsIndexClient`.
 */
export default function EventsListingPage({
  filters,
  place,
  feed,
  facets,
}: {
  filters: EventsIndexFilters;
  place: EventsPlace;
  feed: EventsFeed;
  facets: EventStateFacet[];
}) {
  const placeName = eventsPlaceName(place);
  const facts = placeFacts(place, feed, facets);
  const stateFacet = place.state ? facets.find((facet) => facet.slug === place.state?.slug) ?? null : null;

  return (
    <>
      <JsonLd data={buildEventsListingJsonLd(feed.items, place)} />
      <div className="min-h-screen bg-white dark:bg-[#121212]">
        <Navigation />

        <header className="bg-kadesh-50 px-4 pt-32 pb-14 dark:bg-kadesh/10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {place.state ? (
              <nav aria-label="Ruta" className="mb-5 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                <ol className="flex flex-wrap items-center gap-1.5">
                  <li>
                    <Link href={Routes.events.index} className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300">
                      Eventos
                    </Link>
                  </li>
                  <li aria-hidden>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                  </li>
                  <li>
                    {place.city ? (
                      <Link
                        href={Routes.events.place(place.state.slug)}
                        className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
                      >
                        {place.state.name}
                      </Link>
                    ) : (
                      <span aria-current="page">{place.state.name}</span>
                    )}
                  </li>
                  {place.city ? (
                    <>
                      <li aria-hidden>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                      </li>
                      <li aria-current="page">{place.city.name}</li>
                    </>
                  ) : null}
                </ol>
              </nav>
            ) : (
              <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-kadesh-700 dark:bg-white/10 dark:text-kadesh-300">
                <HugeiconsIcon icon={Calendar03Icon} size={16} strokeWidth={1.8} aria-hidden="true" />
                Eventos
              </p>
            )}
            <h1 className="mb-4 max-w-3xl text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl">
              {placeName ? `Eventos para mascotas en ${placeName}` : 'Eventos para mascotas cerca de ti'}
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
              {facts ? `${facts} ` : null}
              Campañas de esterilización, jornadas de vacunación, ferias de adopción y colectas que organiza la
              comunidad{placeName ? '' : ' en México'}. Cada evento lo revisa el equipo de Kadesh antes de publicarse, y si
              activas tus alertas te avisamos de los que hay en tu zona (máximo {EVENT_ALERTS.MAX_PER_DAY} al día).
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={Routes.events.new}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
              >
                <HugeiconsIcon icon={Add01Icon} size={18} aria-hidden="true" />
                Publicar un evento
              </Link>
              <Link
                href={Routes.notifications.alerts}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-kadesh-200 bg-white px-6 font-semibold text-kadesh-700 hover:border-kadesh dark:border-white/15 dark:bg-transparent dark:text-kadesh-300"
              >
                <HugeiconsIcon icon={Notification03Icon} size={18} aria-hidden="true" />
                Avísame de eventos en mi zona
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-10 pb-20 sm:px-6 lg:px-8">
          <EventsIndexClient initialFeed={feed} facets={facets} filters={filters} />

          {/* Enlaces a las páginas por lugar: ayudan a buscadores a encontrarlas y a la gente a saltar. */}
          {!place.state && facets.length > 0 ? (
            <section aria-labelledby="eventos-por-estado" className="mt-16">
              <h2 id="eventos-por-estado" className="mb-4 text-xl font-bold text-[#121212] dark:text-white">
                Eventos por estado
              </h2>
              <ul className="flex flex-wrap gap-2">
                {facets.map((facet) => (
                  <li key={facet.slug}>
                    <Link href={Routes.events.place(facet.slug)} className={chipLinkClass}>
                      {facet.name} <span className="text-[#5a5a5a] dark:text-[#9aa3b2]">({facet.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {place.state && !place.city && stateFacet && stateFacet.cities.length > 0 ? (
            <section aria-labelledby="eventos-por-municipio" className="mt-16">
              <h2 id="eventos-por-municipio" className="mb-4 text-xl font-bold text-[#121212] dark:text-white">
                Eventos por municipio en {place.state.name}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {stateFacet.cities.map((city) => (
                  <li key={city.key}>
                    <Link href={Routes.events.place(stateFacet.slug, city.key)} className={chipLinkClass}>
                      {city.name} <span className="text-[#5a5a5a] dark:text-[#9aa3b2]">({city.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {!place.state ? (
            <section aria-labelledby="eventos-faq" className="mt-20 max-w-3xl">
              <h2 id="eventos-faq" className="mb-6 text-2xl font-black tracking-[-0.02em] text-[#121212] dark:text-white sm:text-3xl">
                Preguntas frecuentes sobre los eventos
              </h2>
              <dl className="space-y-6">
                {EVENTS_FAQ.map((item) => (
                  <div key={item.question}>
                    <dt className="text-lg font-bold text-[#121212] dark:text-white">{item.question}</dt>
                    <dd className="mt-1.5 leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </main>

        <Footer />
      </div>
    </>
  );
}
