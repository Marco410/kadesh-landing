import type { Metadata } from 'next';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import { formatPetPlaceTypeLabels } from './constants';
import type { PetPlaceShareData } from './server';

const DESCRIPTION_MAX = 200;

export type PetPlaceShareFacts = {
  name: string;
  typeLabel: string;
  location: string;
  city: string;
  ratingLine: string;
  emergencies: boolean;
  verified: boolean;
  descriptionSnippet: string;
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

/**
 * Las fichas importadas de Google traían una descripción automática en inglés («Place located at
 * …. Rating: 4.2/5») o la de ahora («Ubicada en …»): no describen nada, así que no se usan.
 */
export function isImportedDescription(text: string | null | undefined): boolean {
  const value = text?.trim() ?? '';
  return /^place located at /i.test(value) || /^ubicada en [^.]*\.?$/i.test(value);
}

/** Datos públicos para título, descripción y tarjeta OG. */
export function petPlaceShareFacts(place: PetPlaceShareData): PetPlaceShareFacts {
  const typeLabel = formatPetPlaceTypeLabels(place.types) || 'Veterinaria';
  const city = place.municipality?.trim() || '';
  const location = [place.municipality, place.state].filter(Boolean).join(', ');
  const rating =
    place.averageRating != null && !Number.isNaN(place.averageRating)
      ? place.averageRating
      : null;
  const reviews = place.reviewsCount ?? 0;
  const ratingLine =
    rating != null
      ? `${rating.toFixed(1)}${reviews > 0 ? ` · ${reviews} reseña${reviews === 1 ? '' : 's'}` : ''}`
      : reviews > 0
        ? `${reviews} reseña${reviews === 1 ? '' : 's'}`
        : '';
  const descriptionSnippet = isImportedDescription(place.description)
    ? ''
    : place.description?.trim().replace(/\s+/g, ' ') || '';

  return {
    name: place.name?.trim() || typeLabel,
    typeLabel,
    location,
    city,
    ratingLine,
    emergencies: Boolean(place.emergencies),
    verified: Boolean(place.verified),
    descriptionSnippet,
  };
}

export function petPlaceCanonicalPath(place: {
  id: string;
  slug?: string | null;
}): string {
  return Routes.veterinaries.detail(place.slug || place.id);
}

export function petPlaceShareImageUrl(place: {
  id: string;
  slug?: string | null;
}): string {
  return `${SITE_URL}${Routes.veterinaries.image(place.slug || place.id)}`;
}

function petPlaceTitle(facts: PetPlaceShareFacts): string {
  if (facts.city) {
    return `${facts.name} · ${facts.typeLabel} en ${facts.city}`;
  }
  return `${facts.name} · ${facts.typeLabel}`;
}

function petPlaceDescription(facts: PetPlaceShareFacts): string {
  if (facts.descriptionSnippet) {
    const prefix = facts.location ? `${facts.typeLabel} en ${facts.location}. ` : '';
    return truncate(`${prefix}${facts.descriptionSnippet}`, DESCRIPTION_MAX);
  }

  const parts = [
    facts.location ? `${facts.typeLabel} en ${facts.location}.` : `${facts.typeLabel} en KADESH.`,
    facts.ratingLine ? `${facts.ratingLine}.` : '',
    facts.emergencies ? 'Urgencias 24/7.' : '',
    'Horarios, contacto y cómo llegar en KADESH.',
  ].filter(Boolean);

  return truncate(parts.join(' '), DESCRIPTION_MAX);
}

export function buildMissingPetPlaceMetadata(): Metadata {
  return {
    title: 'Lugar no encontrado',
    description: 'Esta ficha no existe o ya no está disponible.',
    robots: { index: false, follow: false },
  };
}

export function buildPetPlaceMetadata(place: PetPlaceShareData): Metadata {
  const facts = petPlaceShareFacts(place);
  const title = petPlaceTitle(facts);
  const description = petPlaceDescription(facts);
  const path = petPlaceCanonicalPath(place);
  const url = `${SITE_URL}${path}`;
  const imageUrl = petPlaceShareImageUrl(place);
  const imageAlt = facts.location
    ? `${facts.name}, ${facts.typeLabel.toLowerCase()} en ${facts.location}`
    : `${facts.name} en KADESH`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | KADESH`,
      description,
      url,
      siteName: 'KADESH',
      locale: 'es_MX',
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | KADESH`,
      description,
      images: [imageUrl],
    },
  };
}

type JsonLd = Record<string, unknown>;

function streetAddress(place: PetPlaceShareData): string | undefined {
  const value = place.street?.trim() || place.address?.split(',')[0]?.trim();
  return value || undefined;
}

/**
 * JSON-LD de la ficha: `VeterinaryCare` (negocio local) con dirección, coordenadas, teléfono y,
 * si tiene reseñas en KADESH, su calificación (nunca la de Google), más las migas.
 */
export function buildPetPlaceJsonLd(place: PetPlaceShareData): JsonLd {
  const facts = petPlaceShareFacts(place);
  const url = `${SITE_URL}${petPlaceCanonicalPath(place)}`;
  const lat = Number(place.lat);
  const lng = Number(place.lng);
  const reviews = place.reviewsCount ?? 0;
  const rating = place.averageRating;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VeterinaryCare',
        '@id': `${url}#lugar`,
        name: facts.name,
        url,
        image: petPlaceShareImageUrl(place),
        description: petPlaceSummary(place),
        telephone: place.phone?.trim() ? `+52${place.phone.replace(/\D/g, '').slice(-10)}` : undefined,
        sameAs: place.website?.trim() ? [place.website.trim()] : undefined,
        address: {
          '@type': 'PostalAddress',
          streetAddress: streetAddress(place),
          addressLocality: place.municipality?.trim() || undefined,
          addressRegion: place.state?.trim() || undefined,
          postalCode: place.cp?.trim() || undefined,
          addressCountry: 'MX',
        },
        geo:
          Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)
            ? { '@type': 'GeoCoordinates', latitude: lat, longitude: lng }
            : undefined,
        aggregateRating:
          reviews > 0 && rating != null && !Number.isNaN(rating)
            ? { '@type': 'AggregateRating', ratingValue: Number(rating.toFixed(1)), reviewCount: reviews, bestRating: 5, worstRating: 1 }
            : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Veterinarias', item: `${SITE_URL}${Routes.veterinaries.index}` },
          { '@type': 'ListItem', position: 3, name: facts.name, item: url },
        ],
      },
    ],
  };
}

/**
 * Resumen que se entiende solo (lo citan buscadores e IA y llega en el HTML aunque la ficha se
 * pinte en el navegador): «Veterinaria Durango: veterinaria en Francisco I. Madero 505, Zona
 * Centro, Durango, Durango. Teléfono 618 123 4567. Atiende urgencias 24/7.»
 */
export function petPlaceSummary(place: PetPlaceShareData): string {
  const facts = petPlaceShareFacts(place);
  const where = [streetAddress(place), place.municipality?.trim(), place.state?.trim()]
    .filter((part, index, all) => part && all.indexOf(part) === index)
    .join(', ');
  const phone = place.phone?.replace(/\D/g, '').slice(-10) ?? '';
  const parts = [
    `${facts.name}: ${facts.typeLabel.toLowerCase()}${where ? ` en ${where}` : ''}.`,
    phone.length === 10 ? `Teléfono ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}.` : '',
    facts.emergencies ? 'Atiende urgencias 24/7.' : '',
    (place.reviewsCount ?? 0) > 0 && place.averageRating != null
      ? `Calificación en KADESH: ${place.averageRating.toFixed(1)} de 5 (${place.reviewsCount} ${place.reviewsCount === 1 ? 'reseña' : 'reseñas'}).`
      : '',
    facts.descriptionSnippet ? truncate(facts.descriptionSnippet, 280) : '',
  ];
  return parts.filter(Boolean).join(' ');
}
