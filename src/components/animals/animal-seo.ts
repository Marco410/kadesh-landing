import type { Metadata } from 'next';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import { ANIMAL_TYPE_LABELS, getStatusLabel } from './constants';
import { animalCoverUrl, type AnimalShareData } from './server';

const DESCRIPTION_MAX = 200;

export type AnimalShareFacts = {
  name: string;
  status: string;
  statusLabel: string;
  typeLabel: string;
  breed: string;
  /** Sexo, edad, color y tamaño, ya en español y sin vacíos. */
  traits: string[];
  /** Mismos datos sin prefijos ("Café", "Grande"), para la tarjeta de imagen. */
  shortTraits: string[];
  location: string;
  seenAt: string;
};

function sexLabel(sex?: string | null): string {
  if (sex === 'male') return 'Macho';
  if (sex === 'female') return 'Hembra';
  return '';
}

function formatSeenAt(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Mexico_City',
  }).format(date);
}

/** Datos básicos y estado activo (último log); nunca incluye contacto ni dirección exacta. */
export function animalShareFacts(animal: AnimalShareData): AnimalShareFacts {
  const log = animal.logs?.[0];
  const status = log?.status || 'register';
  const typeName = animal.animal_breed?.animal_type?.name || '';
  const typeLabel = ANIMAL_TYPE_LABELS[typeName] || typeName;
  const breed = animal.animal_breed?.breed?.trim() || '';

  return {
    name: animal.name?.trim() || typeLabel || 'Animal',
    status,
    statusLabel: getStatusLabel(status),
    typeLabel,
    breed,
    traits: [
      sexLabel(animal.sex),
      animal.age?.trim() || '',
      animal.color?.trim() ? `Color ${animal.color.trim().toLowerCase()}` : '',
      animal.size?.trim() ? `Tamaño ${animal.size.trim().toLowerCase()}` : '',
    ].filter(Boolean),
    shortTraits: [
      sexLabel(animal.sex),
      animal.age?.trim() || '',
      animal.color?.trim() || '',
      animal.size?.trim() || '',
    ].filter(Boolean),
    location: [log?.city, log?.state].filter(Boolean).join(', '),
    seenAt: formatSeenAt(log?.date_status || log?.createdAt),
  };
}

export function animalCanonicalPath(animal: { id: string; slug?: string | null }) {
  return Routes.animals.detail(animal.slug || animal.id);
}

export function animalShareImageUrl(animal: AnimalShareData): string {
  const key = animal.slug || animal.id;
  return `${SITE_URL}${Routes.animals.image(key)}`;
}

function animalTitle(facts: AnimalShareFacts): string {
  const city = facts.location.split(',')[0]?.trim();
  return `${facts.name} · ${facts.statusLabel}${city ? ` en ${city}` : ''}`;
}

function animalDescription(facts: AnimalShareFacts): string {
  const kind = [facts.typeLabel, facts.breed]
    .filter((part, index, all) => part && all.indexOf(part) === index)
    .join(' ');
  const profile = [kind, ...facts.traits].filter(Boolean).join(' · ');

  const sentences = [
    `${facts.statusLabel}${profile ? `: ${profile}` : ''}.`,
    facts.location
      ? `Última ubicación: ${facts.location}${facts.seenAt ? ` (${facts.seenAt})` : ''}.`
      : '',
    'Comparte para ayudar en KADESH.',
  ].filter(Boolean);

  const text = sentences.join(' ');
  return text.length > DESCRIPTION_MAX
    ? `${text.slice(0, DESCRIPTION_MAX - 1).trim()}…`
    : text;
}

export function buildMissingAnimalMetadata(): Metadata {
  return {
    title: 'Animal no encontrado',
    description: 'Este reporte no existe o ya no está disponible.',
    robots: { index: false, follow: false },
  };
}

export function buildAnimalMetadata(animal: AnimalShareData): Metadata {
  const facts = animalShareFacts(animal);
  const title = animalTitle(facts);
  const description = animalDescription(facts);
  const path = animalCanonicalPath(animal);
  const url = `${SITE_URL}${path}`;
  const imageUrl = animalShareImageUrl(animal);
  const imageAlt = animalCoverUrl(animal)
    ? `${facts.name}, ${facts.statusLabel.toLowerCase()}`
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
