import type { Metadata } from 'next';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import { eventCategory } from './constants';
import {
  eventCityText,
  eventIsPast,
  eventPlaceText,
  eventPriceText,
  eventTimeZone,
  formatEventDateWithYear,
  formatEventDayLong,
  formatEventTime,
  formatSessionRange,
  upcomingSessions,
} from './format';
import { cityKey, stateByCode } from './mexicoStates';
import { eventSocialLinks } from './socialLinks';
import type { EventFeedItem, PetEvent } from './types';

export const EVENTS_INDEX_TITLE = 'Eventos para mascotas';
export const EVENTS_INDEX_DESCRIPTION =
  'Campañas de esterilización, jornadas de vacunación, ferias de adopción y más eventos para mascotas en México. Encuentra los de tu estado o municipio.';
export const EVENTS_INDEX_CANONICAL = `${SITE_URL}${Routes.events.index}`;
export const EVENTS_OG_IMAGE = '/og-image.png';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const DESCRIPTION_MAX = 160;
/** Google pide un `Event` por fecha; con eventos semanales se limita. */
const MAX_JSON_LD_SESSIONS = 10;

type JsonLd = Record<string, unknown>;

export function eventCanonicalUrl(slug: string): string {
  return `${SITE_URL}${Routes.events.detail(slug)}`;
}

/** La portada del CMS es una URL firmada que caduca: se comparte por `/eventos/<slug>/og`. */
export function eventShareImageUrl(event: Pick<PetEvent, 'slug'>): string {
  return event.slug ? `${SITE_URL}${Routes.events.image(event.slug)}` : `${SITE_URL}${EVENTS_OG_IMAGE}`;
}

function truncate(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trim()}…`;
}

/** "Sábado 8 de noviembre, 9:00 · Morelia, Michoacán · Gratis. <descripción>" */
export function eventDescription(event: PetEvent): string {
  const tz = eventTimeZone(event);
  const next = event.nextStartsAt ?? event.firstStartsAt;
  const when = next ? `${formatEventDayLong(next, tz)}, ${formatEventTime(next, tz)}` : '';
  const facts = [when, eventCityText(event), eventPriceText(event)].filter(Boolean).join(' · ');
  return truncate(`${facts}. ${event.description}`);
}

/** "Campaña de esterilización gratis en Morelia | KADESH" → título sin la marca (la pone el layout). */
/** El layout agrega « | KADESH»: con esto el `<title>` queda en ~60 caracteres. */
const TITLE_MAX = 52;

/** "10 nov" de la próxima fecha (en la zona del evento). */
function shortDate(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', timeZone })
    .format(new Date(iso))
    .replace(/\./g, '')
    .replace(/ de /g, ' ');
}

/**
 * Título para buscadores, con lo que la gente escribe: «Campaña de esterilización en Morelia ·
 * Gratis · 10 nov». Primero el título y la ciudad; «Gratis» y la fecha se agregan si caben (y si el
 * título no los dice ya). El `<h1>` sigue siendo el título que puso quien organiza.
 */
export function eventPageTitle(event: PetEvent, now = new Date()): string {
  const title = event.title.trim();
  const lower = title.toLowerCase();
  const city = event.city?.trim();
  const base = city && !lower.includes(city.toLowerCase()) ? `${title} en ${city}` : title;
  const extras: string[] = [];
  if (event.isFree && !/gratis|gratuit/i.test(title)) extras.push('Gratis');
  const next = event.status === 'approved' ? upcomingSessions(event.sessions ?? [], now)[0] : null;
  if (next) extras.push(shortDate(next.startsAt, eventTimeZone(event)));
  let result = base;
  for (const extra of extras) {
    if (`${result} · ${extra}`.length <= TITLE_MAX) result = `${result} · ${extra}`;
  }
  return result;
}

export function buildEventMetadata(event: PetEvent): Metadata {
  const title = eventPageTitle(event);
  const description = eventDescription(event);
  const canonical = Routes.events.detail(event.slug ?? event.id);
  const image = eventShareImageUrl(event);
  const past = eventIsPast(event);
  return {
    title,
    description,
    alternates: { canonical },
    // Un evento cancelado o que ya pasó se deja de indexar (la ficha sigue abierta para quien tenga el link).
    robots: event.status === 'cancelled' || past ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${title} | KADESH`,
      description,
      url: canonical,
      siteName: 'KADESH',
      locale: 'es_MX',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | KADESH`,
      description,
      images: [image],
    },
  };
}

export function buildMissingEventMetadata(): Metadata {
  return {
    title: 'Evento no disponible',
    description: 'Este evento no existe o todavía está en revisión.',
    robots: { index: false, follow: true },
  };
}

/** Lugar de un listado: todo México, un estado o un municipio de ese estado. */
export type EventsPlace = {
  state: { slug: string; name: string } | null;
  city: { key: string; name: string } | null;
};

/** "Morelia, Michoacán", "Michoacán" o null (todo México). */
export function eventsPlaceName(place: EventsPlace): string | null {
  if (place.city && place.state) {
    return place.city.name.localeCompare(place.state.name, 'es', { sensitivity: 'base' }) === 0
      ? place.city.name
      : `${place.city.name}, ${place.state.name}`;
  }
  return place.state?.name ?? null;
}

export function eventsPlacePath(place: EventsPlace): string {
  return place.state ? Routes.events.place(place.state.slug, place.city?.key) : Routes.events.index;
}

/**
 * Metadatos de `/eventos` y de las páginas por estado y municipio (`/eventos/en/…`). Una página de
 * lugar sin eventos próximos no se indexa (sería una página vacía).
 */
export function buildEventsListingMetadata(place: EventsPlace, total: number): Metadata {
  const placeName = eventsPlaceName(place);
  const title = placeName ? `Eventos para mascotas en ${placeName}` : EVENTS_INDEX_TITLE;
  const description = placeName
    ? total > 0
      ? `Campañas de esterilización, jornadas de vacunación y ferias de adopción en ${placeName}: ${total} ${total === 1 ? 'evento próximo' : 'eventos próximos'} con fecha, lugar y costo.`
      : `Campañas de esterilización, jornadas de vacunación y ferias de adopción en ${placeName}. Activa tus alertas y te avisamos cuando haya una.`
    : EVENTS_INDEX_DESCRIPTION;
  const path = eventsPlacePath(place);
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: placeName && total === 0 ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${title} | KADESH`,
      description,
      url: path,
      siteName: 'KADESH',
      locale: 'es_MX',
      type: 'website',
      images: [{ url: EVENTS_OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title: `${title} | KADESH`, description, images: [EVENTS_OG_IMAGE] },
  };
}

function eventLocation(event: PetEvent): JsonLd {
  return {
    '@type': 'Place',
    name: eventPlaceText(event) || eventCityText(event) || 'México',
    address: {
      '@type': 'PostalAddress',
      streetAddress: event.address?.trim() || undefined,
      addressLocality: event.city?.trim() || undefined,
      addressRegion: event.state?.trim() || undefined,
      addressCountry: 'MX',
    },
    geo: Number.isFinite(event.lat) && Number.isFinite(event.lng)
      ? { '@type': 'GeoCoordinates', latitude: event.lat, longitude: event.lng }
      : undefined,
  };
}

function eventOffers(event: PetEvent, url: string): JsonLd {
  return {
    '@type': 'Offer',
    price: event.isFree ? 0 : event.price ?? undefined,
    priceCurrency: 'MXN',
    availability: event.isFull ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    url: event.registrationUrl?.trim() || url,
    validFrom: event.createdAt ?? undefined,
  };
}

function eventOrganizer(event: PetEvent): JsonLd {
  // Perfiles de quien organiza (no los links de un evento de Facebook).
  const sameAs = eventSocialLinks(event)
    .filter((link) => link.text !== link.label)
    .map((link) => link.url);
  // Google recomienda `organizer.url`: el sitio web o, si no hay, su primer perfil.
  const url = event.websiteUrl?.trim() || sameAs[0] || undefined;
  if (event.petPlace?.name) {
    return {
      '@type': 'Organization',
      name: event.petPlace.name,
      url: event.petPlace.slug ? `${SITE_URL}${Routes.veterinaries.detail(event.petPlace.slug)}` : undefined,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
    };
  }
  if (event.organizerName?.trim()) {
    return {
      '@type': 'Organization',
      name: event.organizerName.trim(),
      url,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
    };
  }
  return { '@type': 'Organization', '@id': ORGANIZATION_ID, name: 'KADESH', url: SITE_URL };
}

/** Migas del lugar de un evento: su estado y su municipio, con su página. */
export function eventPlaceCrumbs(event: Pick<PetEvent, 'stateCode' | 'city'>): Array<{ name: string; href: string }> {
  const state = stateByCode(event.stateCode);
  if (!state) return [];
  const crumbs = [{ name: state.name, href: Routes.events.place(state.slug) }];
  const key = cityKey(event.city);
  const city = event.city?.trim();
  if (key && city && city.localeCompare(state.name, 'es', { sensitivity: 'base' }) !== 0) {
    crumbs.push({ name: city, href: Routes.events.place(state.slug, key) });
  }
  return crumbs;
}

/** Un `Event` por cada fecha próxima (Google lo pide así para eventos que se repiten). */
export function buildEventJsonLd(event: PetEvent): JsonLd {
  const url = eventCanonicalUrl(event.slug ?? event.id);
  const image = eventShareImageUrl(event);
  const upcoming = upcomingSessions(event.sessions ?? []);
  const sessions = (upcoming.length > 0 ? upcoming : (event.sessions ?? []).slice(-1)).slice(0, MAX_JSON_LD_SESSIONS);
  const status = event.status === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled';
  const description = truncate(event.description, 500);
  const category = eventCategory(event.category);

  const events = sessions.map((session, index) => ({
    '@type': 'Event',
    '@id': `${url}#fecha-${index + 1}`,
    name: event.title,
    description,
    startDate: session.startsAt,
    endDate: session.endsAt,
    eventStatus: status,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: eventLocation(event),
    image: [image],
    url,
    isAccessibleForFree: event.isFree,
    offers: eventOffers(event, url),
    organizer: eventOrganizer(event),
    maximumAttendeeCapacity: event.capacity ?? undefined,
    about: { '@type': 'Thing', name: category.title },
    inLanguage: 'es-MX',
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...events,
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { name: 'Inicio', item: `${SITE_URL}/` },
          { name: 'Eventos', item: EVENTS_INDEX_CANONICAL },
          ...eventPlaceCrumbs(event).map((crumb) => ({ name: crumb.name, item: `${SITE_URL}${crumb.href}` })),
          { name: event.title, item: url },
        ].map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, ...crumb })),
      },
    ],
  };
}

export function buildEventsListingJsonLd(items: EventFeedItem[], place: EventsPlace): JsonLd {
  const placeName = eventsPlaceName(place);
  const url = `${SITE_URL}${eventsPlacePath(place)}`;
  const name = placeName ? `Eventos para mascotas en ${placeName}` : EVENTS_INDEX_TITLE;
  const list = items
    .filter((item) => Boolean(item.event.slug))
    .map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: eventCanonicalUrl(item.event.slug as string),
      name: item.event.title,
    }));
  const crumbs = [
    { name: 'Inicio', item: `${SITE_URL}/` },
    { name: 'Eventos', item: EVENTS_INDEX_CANONICAL },
    ...(place.state ? [{ name: place.state.name, item: `${SITE_URL}${Routes.events.place(place.state.slug)}` }] : []),
    ...(place.state && place.city
      ? [{ name: place.city.name, item: `${SITE_URL}${Routes.events.place(place.state.slug, place.city.key)}` }]
      : []),
  ];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        name,
        description: placeName
          ? `Campañas de esterilización, jornadas de vacunación y ferias de adopción en ${placeName}.`
          : EVENTS_INDEX_DESCRIPTION,
        url,
        inLanguage: 'es-MX',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        ...(placeName
          ? {
              about: {
                '@type': place.city ? 'City' : 'State',
                name: place.city?.name ?? place.state?.name,
                containedInPlace: { '@type': 'Country', name: 'México' },
              },
            }
          : {}),
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#itemlist`,
        name: placeName ? `Próximos eventos en ${placeName}` : 'Próximos eventos para mascotas',
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: list.length,
        itemListElement: list,
      },
      ...(placeName
        ? []
        : [
            {
              '@type': 'FAQPage',
              '@id': `${url}#faq`,
              mainEntity: EVENTS_FAQ.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: item.answer },
              })),
            },
          ]),
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: crumbs.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, ...crumb })),
      },
    ],
  };
}

/** Lo que dice la tarjeta para compartir (`/eventos/<slug>/og`). */
export type EventShareFacts = {
  category: string;
  categoryLabel: string;
  title: string;
  /** "Cancelado" o "Terminó"; null si sigue en pie. */
  status: string | null;
  /** Próxima fecha (o la última, si ya pasó): "Mar 10 nov · 9:00 – 14:00". */
  when: string;
  /** "y 4 fechas más". */
  moreDates: string;
  place: string;
  price: string;
  isFree: boolean;
  coverUrl: string | null;
};

function truncateLine(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

export function eventShareFacts(event: PetEvent): EventShareFacts {
  const tz = eventTimeZone(event);
  const upcoming = upcomingSessions(event.sessions ?? []);
  const shown = upcoming[0] ?? (event.sessions ?? [])[event.sessions?.length ? event.sessions.length - 1 : 0] ?? null;
  const more = Math.max(upcoming.length - 1, 0);
  const cover = [...(event.multimedia ?? [])]
    .filter((photo) => photo.image?.url)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
  return {
    category: event.category,
    categoryLabel: eventCategory(event.category).label,
    title: event.title.length > 90 ? `${event.title.slice(0, 89).trim()}…` : event.title,
    status: event.status === 'cancelled' ? 'Cancelado' : eventIsPast(event) ? 'Terminó' : null,
    when: shown ? formatSessionRange(shown.startsAt, shown.endsAt, tz) : '',
    moreDates: more > 0 ? `y ${more} ${more === 1 ? 'fecha' : 'fechas'} más` : '',
    place: truncateLine(eventCityText(event), 40),
    // Corto para que quepa en una pastilla: la nota de la cuota va en la ficha.
    price:
      event.status === 'cancelled'
        ? ''
        : event.isFree
          ? 'Gratis'
          : event.price
            ? `$${event.price.toLocaleString('es-MX')}`
            : 'Con cuota',
    isFree: event.isFree,
    coverUrl: cover?.image?.url ?? null,
  };
}

/**
 * Resumen del evento en una o dos frases que se entienden solas (lo que citan los buscadores y
 * las IA): qué, dónde, cuándo con año, costo, quién organiza y cupo.
 * «Campaña de esterilización en Explanada de la escuela, Ciudad Peluche (Michoacán). Próxima
 * fecha: martes 10 de noviembre de 2026, de 9:00 a 14:00, y 4 fechas más hasta el jueves 24 de
 * diciembre de 2026. Entrada gratis. Organiza Adopción Morelia. Cupo de 100 lugares.»
 */
export function eventSummary(event: PetEvent, now = new Date()): string {
  const tz = eventTimeZone(event);
  const kind = eventCategory(event.category).title;
  const place = event.placeLabel?.trim() || event.neighborhood?.trim();
  const where = [place, event.city?.trim()].filter(Boolean).join(', ');
  const parts: string[] = [];
  const showState = event.state && event.state.trim().toLowerCase() !== (event.city ?? '').trim().toLowerCase();
  parts.push(`${kind}${where ? ` en ${where}` : ''}${showState ? ` (${event.state})` : ''}.`);

  const sessions = [...(event.sessions ?? [])].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const upcoming = upcomingSessions(sessions, now);
  const time = (session: { startsAt: string; endsAt: string }) => {
    const sameDay = formatEventDateWithYear(session.startsAt, tz) === formatEventDateWithYear(session.endsAt, tz);
    return sameDay
      ? `${formatEventDateWithYear(session.startsAt, tz)}, de ${formatEventTime(session.startsAt, tz)} a ${formatEventTime(session.endsAt, tz)}`
      : `del ${formatEventDateWithYear(session.startsAt, tz)}, ${formatEventTime(session.startsAt, tz)}, al ${formatEventDateWithYear(session.endsAt, tz)}, ${formatEventTime(session.endsAt, tz)}`;
  };
  if (event.status === 'cancelled') {
    parts.push('Se canceló.');
  } else if (upcoming.length > 0) {
    const last = upcoming[upcoming.length - 1];
    const more = upcoming.length - 1;
    parts.push(
      `${upcoming.length > 1 ? 'Próxima fecha' : 'Fecha'}: ${time(upcoming[0])}${
        more > 0 ? `, y ${more} ${more === 1 ? 'fecha' : 'fechas'} más hasta el ${formatEventDateWithYear(last.startsAt, tz)}` : ''
      }.`,
    );
  } else if (sessions.length > 0) {
    parts.push(`Fue el ${time(sessions[sessions.length - 1]).replace(/^del /, '')}.`);
  }
  parts.push(event.isFree ? 'Entrada gratis.' : `Costo: ${eventPriceText(event)}.`);
  const organizer = event.petPlace?.name || event.organizerName?.trim();
  if (organizer) parts.push(`Organiza ${organizer}.`);
  if (event.capacity) parts.push(`Cupo de ${event.capacity} lugares.`);
  return parts.join(' ');
}

/** Preguntas de `/eventos` (visibles en la página y en su JSON-LD `FAQPage`). */
export const EVENTS_FAQ = [
  {
    question: '¿Dónde encuentro campañas de esterilización gratuitas cerca de mí?',
    answer:
      'En Kadesh Pet: en /eventos filtra por tu estado o municipio, o toca «Cerca de mí» para ver los eventos a menos de 100 km. Cada evento dice fecha, lugar, costo, cupo y requisitos, como el ayuno o la edad mínima.',
  },
  {
    question: '¿Qué eventos para mascotas se publican?',
    answer:
      'Campañas de esterilización, jornadas de vacunación y desparasitación, ferias de adopción, jornadas médicas, colectas, voluntariados y talleres. Los organizan asociaciones, refugios, veterinarias y municipios de todo México.',
  },
  {
    question: '¿Cómo me entero de los eventos de mi zona?',
    answer:
      'Activa tus alertas de zona en Kadesh Pet y deja encendido «Avisos de eventos». Te avisamos de los eventos de tu zona, tu municipio o tu estado en tus notificaciones (y en la app), como máximo 3 al día. Si marcas «Me interesa» o «Asistiré», te recordamos un día antes.',
  },
  {
    question: '¿Cómo publico un evento?',
    answer:
      'Crea tu cuenta gratis y toca «Publicar un evento»: pon qué es, dónde, las fechas, el costo y cómo registrarse. El equipo de Kadesh lo revisa antes de publicarlo y, al publicarse, avisamos a la gente de la zona, municipio o estado que elijas.',
  },
] as const;
