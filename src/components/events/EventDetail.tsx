import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert02Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Call02Icon,
  InformationCircleIcon,
  Location01Icon,
  Navigation03Icon,
  Ticket01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { Footer, Navigation } from 'kadesh/components/layout';
import { Routes } from 'kadesh/core/routes';
import { EVENT_STATUS_LABEL, eventSpeciesLabels } from './constants';
import EventActions from './EventActions';
import EventCategoryChip from './EventCategoryChip';
import EventGallery from './EventGallery';
import EventMap from './EventMap';
import { eventPlaceCrumbs, eventSummary } from './events-seo';
import { eventSocialLinks } from './socialLinks';
import {
  eventCityText,
  eventIsPast,
  eventPlaceText,
  eventPriceText,
  eventScopeText,
  eventTimeZone,
  formatPhone,
  formatSessionRange,
  timeZoneCityLabel,
  upcomingSessions,
} from './format';
import type { PetEvent } from './types';

/** Cuántas fechas se ven antes de «Ver todas». */
const VISIBLE_SESSIONS = 5;

function Banner({ tone, title, children }: { tone: 'red' | 'amber' | 'blue'; title: string; children?: React.ReactNode }) {
  const styles = {
    red: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200',
    amber: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200',
    blue: 'border-kadesh-200 bg-kadesh-50 text-kadesh-800 dark:border-white/10 dark:bg-kadesh/10 dark:text-kadesh-200',
  }[tone];
  return (
    <div role="status" className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${styles}`}>
      <HugeiconsIcon icon={tone === 'blue' ? InformationCircleIcon : Alert02Icon} size={20} className="mt-0.5 shrink-0" aria-hidden />
      <div>
        <p className="font-bold">{title}</p>
        {children ? <div className="mt-1 text-sm">{children}</div> : null}
      </div>
    </div>
  );
}

/**
 * Ficha de un evento. La pinta el servidor (eventos publicados) y también la vista previa de quien
 * lo publicó (`preview`), cuando todavía no es público.
 */
export default function EventDetail({
  event,
  preview,
}: {
  event: PetEvent;
  preview?: { status: string; reviewNote?: string | null } | null;
}) {
  const tz = eventTimeZone(event);
  const past = eventIsPast(event);
  const upcoming = upcomingSessions(event.sessions ?? []);
  const sessions = past ? (event.sessions ?? []) : upcoming;
  const place = eventPlaceText(event);
  const cityText = eventCityText(event);
  const species = eventSpeciesLabels(event.species);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lng}`;
  const tzCity = timeZoneCityLabel(tz);
  const organizer = event.petPlace?.name || event.organizerName?.trim() || null;
  const socialLinks = eventSocialLinks(event);

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-night">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <nav aria-label="Ruta" className="mb-5 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href={Routes.events.index} className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300">
                Eventos
              </Link>
            </li>
            {eventPlaceCrumbs(event).map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-1.5">
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} aria-hidden />
                <Link href={crumb.href} className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300">
                  {crumb.name}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        {preview ? (
          <Banner
            tone={preview.status === 'rejected' ? 'red' : 'blue'}
            title={`${EVENT_STATUS_LABEL[preview.status] ?? preview.status} — solo tú ves esta página`}
          >
            {preview.status === 'rejected' && preview.reviewNote ? (
              <p>
                <strong>Lo que hay que cambiar:</strong> {preview.reviewNote}
              </p>
            ) : preview.status === 'pending' ? (
              <p>El equipo de Kadesh lo está revisando. Te avisamos en cuanto se publique.</p>
            ) : null}
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {event.slug && preview.status !== 'cancelled' ? (
                <Link href={Routes.events.edit(event.slug)} className="font-semibold underline">
                  Editar evento
                </Link>
              ) : null}
              <Link href={Routes.events.mine} className="font-semibold underline">
                Ver mis eventos
              </Link>
            </p>
          </Banner>
        ) : null}
        {event.status === 'cancelled' ? (
          <Banner tone="red" title="Este evento se canceló">
            {event.cancelReason ? <p>{event.cancelReason}</p> : null}
          </Banner>
        ) : past ? (
          <Banner tone="amber" title="Este evento ya pasó">
            <p>
              <Link href={Routes.events.index} className="font-semibold underline">
                Mira los próximos eventos
              </Link>
            </p>
          </Banner>
        ) : null}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-8">
            <EventGallery photos={event.multimedia ?? []} title={event.title} category={event.category} />

            <header>
              <EventCategoryChip category={event.category} />
              <h1 className="mt-3 text-3xl font-black tracking-[-0.02em] text-[#121212] dark:text-white sm:text-4xl">
                {event.title}
              </h1>
              {organizer || cityText ? (
                <p className="mt-2 text-[#5a5a5a] dark:text-[#b0b0b0]">
                  {organizer ? (
                    <>
                      Organiza{' '}
                      {event.petPlace?.slug ? (
                        <Link
                          href={Routes.veterinaries.detail(event.petPlace.slug)}
                          className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
                        >
                          {organizer}
                        </Link>
                      ) : (
                        <strong className="font-semibold text-[#3a3a3a] dark:text-[#e0e0e0]">{organizer}</strong>
                      )}
                    </>
                  ) : null}
                  {organizer && cityText ? ' · ' : null}
                  {cityText}
                </p>
              ) : null}
              {/* Resumen que se entiende solo (fecha con año, lugar, costo): lo citan buscadores e IA. */}
              <p data-event-summary className="mt-4 rounded-2xl bg-white p-4 text-[15px] leading-relaxed text-[#3a3a3a] shadow-[0_1px_2px_rgba(15,35,80,0.06)] dark:bg-[#1e1e1e] dark:text-[#d0d0d0]">
                {eventSummary(event)}
              </p>
            </header>

            <section aria-labelledby="evento-descripcion">
              <h2 id="evento-descripcion" className="mb-3 text-xl font-bold text-[#121212] dark:text-white">
                De qué se trata
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">{event.description}</p>
              {species.length > 0 ? (
                <p className="mt-4 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                  <strong className="text-[#3a3a3a] dark:text-[#e0e0e0]">Para:</strong> {species.join(', ')}
                </p>
              ) : null}
            </section>

            {event.requirements?.trim() ? (
              <section aria-labelledby="evento-requisitos" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-900/10">
                <h2 id="evento-requisitos" className="mb-2 text-lg font-bold text-amber-900 dark:text-amber-200">
                  Antes de ir
                </h2>
                <p className="whitespace-pre-line text-amber-900 dark:text-amber-100">{event.requirements}</p>
              </section>
            ) : null}

            <section aria-labelledby="evento-lugar">
              <h2 id="evento-lugar" className="mb-3 text-xl font-bold text-[#121212] dark:text-white">
                Dónde
              </h2>
              <p className="flex items-start gap-2 text-[#3a3a3a] dark:text-[#d0d0d0]">
                <HugeiconsIcon icon={Location01Icon} size={18} className="mt-0.5 shrink-0" aria-hidden />
                <span>
                  {place ? <strong className="block font-semibold">{place}</strong> : null}
                  {[event.address, event.neighborhood, event.city, event.state].filter(Boolean).join(', ')}
                </span>
              </p>
              <EventMap lat={event.lat} lng={event.lng} label={place || cityText} className="mt-4" />
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
              >
                <HugeiconsIcon icon={Navigation03Icon} size={18} aria-hidden />
                Cómo llegar
              </a>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-5 rounded-3xl border border-[#ececec] bg-white p-5 shadow-[0_10px_30px_rgba(15,35,80,0.06)] dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#5a5a5a] dark:text-[#9aa3b2]">
                  <HugeiconsIcon icon={Calendar03Icon} size={16} aria-hidden />
                  {past ? 'Fue' : sessions.length > 1 ? 'Fechas' : 'Cuándo'}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {sessions.slice(0, VISIBLE_SESSIONS).map((session, index) => (
                    <li
                      key={session.id}
                      className={index === 0 && !past ? 'text-lg font-bold text-[#121212] dark:text-white' : 'text-sm text-[#3a3a3a] dark:text-[#d0d0d0]'}
                    >
                      <time dateTime={session.startsAt}>{formatSessionRange(session.startsAt, session.endsAt, tz)}</time>
                    </li>
                  ))}
                </ul>
                {sessions.length > VISIBLE_SESSIONS ? (
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer font-semibold text-kadesh-700 dark:text-kadesh-300">
                      Ver las {sessions.length} fechas
                    </summary>
                    <ul className="mt-2 space-y-1.5 text-[#3a3a3a] dark:text-[#d0d0d0]">
                      {sessions.slice(VISIBLE_SESSIONS).map((session) => (
                        <li key={session.id}>
                          <time dateTime={session.startsAt}>{formatSessionRange(session.startsAt, session.endsAt, tz)}</time>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
                {tzCity ? (
                  <p className="mt-2 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">Horario de {tzCity}.</p>
                ) : null}
              </div>

              <dl className="space-y-3 border-t border-[#ececec] pt-4 text-sm dark:border-[#2a2a2a]">
                <div className="flex items-start gap-2">
                  <dt className="sr-only">Costo</dt>
                  <HugeiconsIcon icon={Ticket01Icon} size={18} className="mt-0.5 shrink-0 text-[#5a5a5a]" aria-hidden />
                  <dd className={event.isFree ? 'font-bold text-green-700 dark:text-green-400' : 'font-semibold text-[#121212] dark:text-white'}>
                    {eventPriceText(event)}
                  </dd>
                </div>
                {event.capacity ? (
                  <div className="flex items-start gap-2">
                    <dt className="sr-only">Cupo</dt>
                    <HugeiconsIcon icon={UserGroupIcon} size={18} className="mt-0.5 shrink-0 text-[#5a5a5a]" aria-hidden />
                    <dd className="text-[#3a3a3a] dark:text-[#d0d0d0]">
                      {event.isFull ? 'Cupo lleno' : `Cupo de ${event.capacity} lugares`}
                    </dd>
                  </div>
                ) : null}
                <div className="flex items-start gap-2">
                  <dt className="sr-only">Dirigido a</dt>
                  <HugeiconsIcon icon={Location01Icon} size={18} className="mt-0.5 shrink-0 text-[#5a5a5a]" aria-hidden />
                  <dd className="text-[#3a3a3a] dark:text-[#d0d0d0]">{eventScopeText(event)}</dd>
                </div>
                {event.contactPhone ? (
                  <div className="flex items-start gap-2">
                    <dt className="sr-only">Teléfono</dt>
                    <HugeiconsIcon icon={Call02Icon} size={18} className="mt-0.5 shrink-0 text-[#5a5a5a]" aria-hidden />
                    <dd>
                      <a href={`tel:+52${event.contactPhone}`} className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300">
                        {formatPhone(event.contactPhone)}
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>

              {socialLinks.length > 0 ? (
                <div className="border-t border-[#ececec] pt-4 dark:border-[#2a2a2a]">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#5a5a5a] dark:text-[#9aa3b2]">
                    Síguelos
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {socialLinks.map((link) => (
                      <li key={link.field}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow ugc"
                          aria-label={`${link.label}: ${link.text} (se abre en otra pestaña)`}
                          className="inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-full border border-[#d8dee8] bg-white px-3 text-sm font-semibold text-[#121212] transition-colors hover:border-kadesh focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-white/15 dark:bg-night dark:text-white"
                        >
                          <HugeiconsIcon icon={link.icon} size={16} aria-hidden />
                          <span className="truncate">{link.text}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {!preview ? <EventActions event={event} /> : null}
            </div>
            <p className="mt-4 px-2 text-xs leading-relaxed text-[#5a5a5a] dark:text-[#9aa3b2]">
              Kadesh revisa cada evento antes de publicarlo, pero quien lo organiza es responsable de lo que ofrece.
              Si algo no cuadra,{' '}
              <Link href={Routes.contact} className="font-semibold underline">
                avísanos
              </Link>
              .
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
