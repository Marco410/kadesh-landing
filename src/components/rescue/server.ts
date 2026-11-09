import type { PublicRescueAnimal, PublicRescueOrganization, RescueAlly } from './types';

/**
 * Consultas de espacios de rescate desde el servidor (sin sesión): portada (aliados), `/aliados`,
 * `/organizaciones`, el perfil público y el sitemap. El backend solo devuelve organizaciones
 * verificadas a quien no tiene sesión. Si el API falla devuelven vacío para no romper la página.
 *
 * Las imágenes del API son URLs firmadas que caducan en 1 h: por eso se revalida cada 30 min.
 */

const REVALIDATE_SECONDS = 30 * 60;

const PUBLIC_ORG_FIELDS = `
  id
  name
  slug
  type
  description
  city
  state
  species
  capacity
  whatsapp
  email
  websiteUrl
  facebookUrl
  instagramUrl
  tiktokUrl
  donationUrl
  donationInfo
  needs
  isAlly
  allySince
  verifiedAt
  logo {
    url
  }
  cover {
    url
  }
  publishedCount
  adoptedCount
  inAdoptionCount
  updatedAt
`;

const BY_SLUG_QUERY = `
  query PublicRescueOrganization($slug: String!) {
    rescueOrganization(where: { slug: $slug }) {
      ${PUBLIC_ORG_FIELDS}
    }
  }
`;

const ORG_ANIMALS_QUERY = `
  query PublicRescueAnimals($slug: String!, $take: Int!) {
    animals(
      where: { organization: { slug: { equals: $slug } }, duplicateOf: null }
      orderBy: [{ createdAt: desc }]
      take: $take
    ) {
      id
      slug
      name
      sex
      age
      animal_type {
        name
      }
      animal_breed {
        breed
      }
      logs(orderBy: [{ date_status: desc }], take: 1) {
        status
        date_status
        city
        state
      }
      multimedia(orderBy: [{ order: asc }], take: 1) {
        image {
          url
        }
      }
    }
  }
`;

const ALLIES_QUERY = `
  query RescueAllies($take: Int) {
    rescueAllies(take: $take) {
      total
      allies {
        id
        name
        slug
        type
        city
        state
        logoUrl
        allySince
        publishedCount
        adoptedCount
      }
    }
  }
`;

const DIRECTORY_QUERY = `
  query RescueDirectory {
    rescueOrganizations(
      where: { status: { equals: "verified" } }
      orderBy: [{ name: asc }]
      take: 500
    ) {
      id
      name
      slug
      type
      city
      state
      species
      isAlly
      logo {
        url
      }
      publishedCount
      adoptedCount
      inAdoptionCount
    }
  }
`;

const SITEMAP_QUERY = `
  query RescueOrganizationsForSitemap {
    rescueOrganizations(where: { status: { equals: "verified" } }, take: 1000) {
      slug
      updatedAt
    }
  }
`;

type GraphqlResponse<T> = { data?: T; errors?: Array<{ message?: string }> };

async function queryGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
  revalidate = REVALIDATE_SECONDS,
): Promise<T | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      next: { revalidate },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as GraphqlResponse<T>;
    if (payload.errors?.length) {
      console.error('Rescue GraphQL errors:', payload.errors);
      return payload.data ?? null;
    }
    return payload.data ?? null;
  } catch (error) {
    console.error('Rescue GraphQL fetch failed:', error);
    return null;
  }
}

/** Perfil público. `null` si no existe o aún no está verificada. */
export async function fetchPublicRescueOrg(slug: string): Promise<PublicRescueOrganization | null> {
  if (!slug) return null;
  const data = await queryGraphql<{ rescueOrganization: PublicRescueOrganization | null }>(BY_SLUG_QUERY, { slug });
  return data?.rescueOrganization ?? null;
}

export async function fetchPublicRescueAnimals(slug: string, take = 60): Promise<PublicRescueAnimal[]> {
  if (!slug) return [];
  const data = await queryGraphql<{ animals: PublicRescueAnimal[] }>(ORG_ANIMALS_QUERY, { slug, take });
  return data?.animals ?? [];
}

export type RescueAlliesResult = { total: number; allies: RescueAlly[] };

export async function fetchRescueAllies(take?: number): Promise<RescueAlliesResult> {
  const data = await queryGraphql<{ rescueAllies: RescueAlliesResult }>(ALLIES_QUERY, { take: take ?? null });
  return data?.rescueAllies ?? { total: 0, allies: [] };
}

export type RescueDirectoryItem = Pick<
  PublicRescueOrganization,
  'id' | 'name' | 'slug' | 'type' | 'city' | 'state' | 'species' | 'isAlly' | 'logo' | 'publishedCount' | 'adoptedCount' | 'inAdoptionCount'
>;

export async function fetchRescueDirectory(): Promise<RescueDirectoryItem[]> {
  const data = await queryGraphql<{ rescueOrganizations: RescueDirectoryItem[] }>(DIRECTORY_QUERY, {});
  return (data?.rescueOrganizations ?? []).filter((org) => Boolean(org.slug));
}

export type SitemapRescueOrg = { slug: string; updatedAt: string | null };

export async function fetchRescueOrgsForSitemap(): Promise<SitemapRescueOrg[]> {
  const data = await queryGraphql<{ rescueOrganizations: Array<{ slug: string | null; updatedAt: string | null }> }>(
    SITEMAP_QUERY,
    {},
    60 * 60,
  );
  return (data?.rescueOrganizations ?? []).filter((org): org is SitemapRescueOrg => Boolean(org.slug));
}
