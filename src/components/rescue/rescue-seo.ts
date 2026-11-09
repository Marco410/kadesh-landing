import type { Metadata } from 'next';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import { rescueSpeciesPhrase, rescueTypeLabel } from './constants';
import type { PublicRescueOrganization } from './types';

/**
 * SEO de los espacios de rescate: `/organizaciones`, `/organizaciones/<slug>` y `/aliados`.
 * El logo y la portada del API son URLs firmadas que caducan: para compartir y para el JSON-LD se
 * usan las rutas estables `/organizaciones/<slug>/og` (tarjeta) y `…/og?formato=logo` (logo).
 */

type JsonLd = Record<string, unknown>;

/** El layout agrega « | KADESH»: con esto el `<title>` queda en ~60 caracteres. */
const TITLE_MAX = 52;
const DESCRIPTION_MAX = 160;

export const RESCUE_DIRECTORY_TITLE = 'Rescatistas, refugios y hogares temporales en México';
export const RESCUE_DIRECTORY_DESCRIPTION =
  'Rescatistas, refugios, hogares temporales y asociaciones verificadas por KADESH. Adopta, dona o hazte voluntario con quienes rescatan cerca de ti.';
export const ALLIES_TITLE = 'Aliados KADESH: rescatistas y refugios de México';
export const ALLIES_DESCRIPTION =
  'Los rescatistas, refugios y hogares temporales que rescatan de la mano con KADESH. Conócelos y adopta, dona o súmate como voluntario.';
export const RESCUE_OG_IMAGE = '/og-image.png';

const TYPE_PLURAL: Record<string, string> = {
  independent: 'Rescatistas independientes',
  shelter: 'Refugios y santuarios',
  foster_home: 'Hogares temporales',
  collective: 'Colectivos',
  civil_association: 'Asociaciones civiles y fundaciones',
};

/** «Refugios y santuarios», para agrupar y filtrar. */
export function rescueTypePluralLabel(type: string | null | undefined): string {
  return (type && TYPE_PLURAL[type]) || 'Otros espacios de rescate';
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trim()}…`;
}

function plural(count: number, one: string, many: string): string {
  return `${count.toLocaleString('es-MX')} ${count === 1 ? one : many}`;
}

/** «Morelia, Michoacán» (sin repetir cuando la ciudad y el estado se llaman igual). */
export function rescueLocation(org: { city?: string | null; state?: string | null }): string {
  const city = org.city?.trim();
  const state = org.state?.trim();
  if (city && state && city.localeCompare(state, 'es', { sensitivity: 'base' }) !== 0) return `${city}, ${state}`;
  return city || state || '';
}

/** Solo links `http(s)`: lo escribe la organización y no debe colarse un `javascript:`. */
export function safeExternalUrl(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if ((url.protocol !== 'https:' && url.protocol !== 'http:') || !url.hostname.includes('.')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const PHONE_RE = /\+?\d[\d\s().-]{6,}\d/g;
const CONTACT_MARK = '\u0000';

/**
 * Quita de un texto libre (la descripción) las frases con correos o teléfonos, antes de usarlo en
 * metadatos o JSON-LD. Se quita la frase entera para no dejar «Escríbenos a o al…».
 */
export function stripContactInfo(text: string | null | undefined): string {
  return (text ?? '')
    .replace(EMAIL_RE, CONTACT_MARK)
    .replace(PHONE_RE, CONTACT_MARK)
    .split(/\n+/)
    .flatMap((line) => line.match(/\S.*?(?:[.!?]+(?=\s|$)|$)/g) ?? [])
    .filter((sentence) => !sentence.includes(CONTACT_MARK))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** «noviembre de 2026», para «Aliado KADESH desde …». */
export function rescueMonthYear(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'America/Mexico_City' }).format(date);
}

/**
 * Resumen que se entiende solo (lo citan buscadores e IA), sin datos de contacto:
 * «Patitas Felices: refugio o santuario en Morelia, Michoacán. Espacio de rescate verificado por
 * KADESH. Rescata perros y gatos. Ha publicado 40 animales en KADESH: 12 en adopción y 25 adoptados.»
 */
export function rescueOrgSummary(org: PublicRescueOrganization): string {
  const where = rescueLocation(org);
  const parts = [
    `${org.name}: ${rescueTypeLabel(org.type).toLowerCase()}${where ? ` en ${where}` : ''}.`,
    org.isAlly
      ? `Espacio de rescate verificado y Aliado KADESH${rescueMonthYear(org.allySince) ? ` desde ${rescueMonthYear(org.allySince)}` : ''}.`
      : 'Espacio de rescate verificado por KADESH.',
  ];
  const species = rescueSpeciesPhrase(org.species);
  if (species) parts.push(`Rescata ${species}.`);
  if (org.publishedCount > 0) {
    const details = [
      org.inAdoptionCount > 0 ? `${org.inAdoptionCount.toLocaleString('es-MX')} en adopción` : '',
      org.adoptedCount > 0 ? plural(org.adoptedCount, 'adoptado', 'adoptados') : '',
    ].filter(Boolean);
    parts.push(
      `Ha publicado ${plural(org.publishedCount, 'animal', 'animales')} en KADESH${details.length ? `: ${details.join(' y ')}` : ''}.`,
    );
  }
  return parts.join(' ');
}

export function rescueOrgCanonicalUrl(slug: string): string {
  return `${SITE_URL}${Routes.organizations.detail(slug)}`;
}

/** Tarjeta para compartir (1200×630), estable aunque la portada del API caduque. */
export function rescueOrgShareImageUrl(slug: string): string {
  return `${SITE_URL}${Routes.organizations.image(slug)}`;
}

/** Logo cuadrado (512×512) servido por la misma ruta; con iniciales si no hay logo. */
export function rescueOrgLogoImageUrl(slug: string): string {
  return `${SITE_URL}${Routes.organizations.image(slug)}?formato=logo`;
}

/** «Patitas Felices · Refugio o santuario en Morelia», recortado para que quepa. */
export function rescueOrgTitle(org: Pick<PublicRescueOrganization, 'name' | 'type' | 'city'>): string {
  const name = org.name.trim();
  const city = org.city?.trim();
  const type = rescueTypeLabel(org.type);
  const candidates = [
    city ? `${name} · ${type} en ${city}` : `${name} · ${type}`,
    city ? `${name} en ${city}` : '',
    name,
  ].filter(Boolean);
  return candidates.find((title) => title.length <= TITLE_MAX) ?? truncate(name, TITLE_MAX);
}

export function rescueOrgDescription(org: PublicRescueOrganization): string {
  const about = stripContactInfo(org.description);
  if (!about) return truncate(rescueOrgSummary(org), DESCRIPTION_MAX);
  const where = rescueLocation(org);
  return truncate(`${rescueTypeLabel(org.type)}${where ? ` en ${where}` : ''}. ${about}`, DESCRIPTION_MAX);
}

export function buildRescueOrgMetadata(org: PublicRescueOrganization): Metadata {
  const title = rescueOrgTitle(org);
  const description = rescueOrgDescription(org);
  const url = rescueOrgCanonicalUrl(org.slug);
  const image = rescueOrgShareImageUrl(org.slug);
  const where = rescueLocation(org);
  const alt = where ? `${org.name}, ${rescueTypeLabel(org.type).toLowerCase()} en ${where}` : `${org.name} en KADESH`;
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
      images: [{ url: image, width: 1200, height: 630, alt }],
    },
    twitter: { card: 'summary_large_image', title: `${title} | KADESH`, description, images: [image] },
  };
}

export function buildMissingRescueOrgMetadata(): Metadata {
  return {
    title: 'Espacio de rescate no disponible',
    description: 'Este espacio de rescate no existe o todavía está en revisión.',
    robots: { index: false, follow: true },
  };
}

/** Metadatos de una página de listado (`/organizaciones`, `/aliados`), con canónica propia. */
export function buildRescueListingMetadata({
  path,
  title,
  description,
  absoluteTitle = false,
}: {
  path: string;
  title: string;
  description: string;
  /** Para títulos que ya dicen «KADESH» (sin el « | KADESH» del layout). */
  absoluteTitle?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = absoluteTitle ? title : `${title} | KADESH`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'KADESH',
      locale: 'es_MX',
      type: 'website',
      images: [{ url: RESCUE_OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [RESCUE_OG_IMAGE] },
  };
}

/** Redes y sitio web de la organización, solo los que son links válidos. */
export function rescueOrgSameAs(
  org: Pick<PublicRescueOrganization, 'websiteUrl' | 'facebookUrl' | 'instagramUrl' | 'tiktokUrl'>,
): string[] {
  return [org.websiteUrl, org.facebookUrl, org.instagramUrl, org.tiktokUrl]
    .map((value) => safeExternalUrl(value))
    .filter((url): url is string => Boolean(url));
}

/** JSON-LD del perfil: `ProfilePage` cuyo tema es la organización (`NGO`), más las migas. */
export function buildRescueOrgJsonLd(org: PublicRescueOrganization): JsonLd {
  const url = rescueOrgCanonicalUrl(org.slug);
  const sameAs = rescueOrgSameAs(org);
  const about = stripContactInfo(org.description);
  const hasPlace = Boolean(org.city?.trim() || org.state?.trim());
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NGO',
        '@id': `${url}#organizacion`,
        name: org.name,
        url,
        description: truncate(about || rescueOrgSummary(org), 500),
        image: rescueOrgShareImageUrl(org.slug),
        logo: org.logo?.url
          ? { '@type': 'ImageObject', url: rescueOrgLogoImageUrl(org.slug), width: 512, height: 512 }
          : undefined,
        sameAs: sameAs.length > 0 ? sameAs : undefined,
        address: hasPlace
          ? {
              '@type': 'PostalAddress',
              addressLocality: org.city?.trim() || undefined,
              addressRegion: org.state?.trim() || undefined,
              addressCountry: 'MX',
            }
          : undefined,
        areaServed: { '@type': 'Country', name: 'México' },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${url}#page`,
        url,
        name: org.name,
        inLanguage: 'es-MX',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: { '@id': `${url}#organizacion` },
        dateModified: org.updatedAt ?? undefined,
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { name: 'Inicio', item: `${SITE_URL}/` },
          { name: 'Organizaciones', item: `${SITE_URL}${Routes.organizations.index}` },
          { name: org.name, item: url },
        ].map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, ...crumb })),
      },
    ],
  };
}

/** `CollectionPage` + `ItemList` + migas, para `/organizaciones` y `/aliados`. */
export function buildRescueListingJsonLd({
  path,
  name,
  description,
  crumb,
  orgs,
}: {
  path: string;
  name: string;
  description: string;
  crumb: string;
  orgs: Array<{ slug?: string | null; name: string }>;
}): JsonLd {
  const url = `${SITE_URL}${path}`;
  const items = orgs
    .filter((org): org is { slug: string; name: string } => Boolean(org.slug))
    .map((org, index) => ({ '@type': 'ListItem', position: index + 1, url: rescueOrgCanonicalUrl(org.slug), name: org.name }));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        name,
        description,
        url,
        inLanguage: 'es-MX',
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#itemlist`,
        name,
        numberOfItems: items.length,
        itemListElement: items,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: crumb, item: url },
        ],
      },
    ],
  };
}

/** Lo que dice la tarjeta para compartir (`/organizaciones/<slug>/og`). */
export type RescueShareFacts = {
  name: string;
  typeLabel: string;
  place: string;
  isAlly: boolean;
  stats: Array<{ value: string; label: string }>;
  coverUrl: string | null;
  logoUrl: string | null;
};

export function rescueShareFacts(org: PublicRescueOrganization): RescueShareFacts {
  const stats = [
    { count: org.publishedCount, one: 'animal', many: 'animales' },
    { count: org.inAdoptionCount, one: 'en adopción', many: 'en adopción' },
    { count: org.adoptedCount, one: 'adoptado', many: 'adoptados' },
  ]
    .filter((stat) => stat.count > 0)
    .map((stat) => ({ value: stat.count.toLocaleString('es-MX'), label: stat.count === 1 ? stat.one : stat.many }));
  return {
    name: truncate(org.name, 70),
    typeLabel: rescueTypeLabel(org.type),
    place: truncate(rescueLocation(org), 44),
    isAlly: Boolean(org.isAlly),
    stats,
    coverUrl: org.cover?.url ?? null,
    logoUrl: org.logo?.url ?? null,
  };
}
