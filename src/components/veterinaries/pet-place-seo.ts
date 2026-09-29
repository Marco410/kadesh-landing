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
  const descriptionSnippet = place.description?.trim().replace(/\s+/g, ' ') || '';

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
