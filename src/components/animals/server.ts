import { isAnimalKeystoneId } from './animalSlug';
import { sortMultimediaByOrder } from './sortMultimedia';

const REVALIDATE_SECONDS = 60;

const ANIMAL_SHARE_QUERY = `
  query GetAnimalForShare($where: AnimalWhereUniqueInput!) {
    animal(where: $where) {
      id
      slug
      folio
      name
      sex
      age
      color
      size
      physical_description
      contactNumber
      animal_type {
        name
      }
      duplicateOf {
        id
        slug
      }
      animal_breed {
        breed
        animal_type {
          name
        }
      }
      multimedia(orderBy: [{ order: asc }]) {
        order
        image {
          url
        }
      }
      logs(orderBy: [{ date_status: desc }], take: 1) {
        status
        city
        placeLabel
        state
        date_status
        createdAt
      }
    }
  }
`;

export type AnimalShareData = {
  id: string;
  slug?: string | null;
  /** Folio del cartel (KP-01234). */
  folio?: number | null;
  name?: string | null;
  physical_description?: string | null;
  contactNumber?: string | null;
  animal_type?: { name?: string | null } | null;
  sex?: string | null;
  age?: string | null;
  color?: string | null;
  size?: string | null;
  duplicateOf?: { id: string; slug?: string | null } | null;
  animal_breed?: {
    breed?: string | null;
    animal_type?: { name?: string | null } | null;
  } | null;
  multimedia?: Array<{ order?: number | null; image?: { url?: string | null } | null }> | null;
  logs?: Array<{
    status: string;
    city?: string | null;
    placeLabel?: string | null;
    state?: string | null;
    date_status?: string | null;
    createdAt?: string | null;
  }> | null;
};

type AnimalShareResponse = {
  data?: { animal: AnimalShareData | null };
  errors?: Array<{ message?: string }>;
};

/** Datos mínimos para compartir un animal; solo servidor. */
export async function fetchAnimalForShare(
  key: string,
): Promise<AnimalShareData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || !key) {
    return null;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: ANIMAL_SHARE_QUERY,
        variables: {
          where: isAnimalKeystoneId(key) ? { id: key } : { slug: key },
        },
      }),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as AnimalShareResponse;
    if (payload.errors?.length) {
      console.error('Animal GraphQL errors:', payload.errors);
      return null;
    }

    return payload.data?.animal ?? null;
  } catch (error) {
    console.error('Animal GraphQL fetch failed:', error);
    return null;
  }
}

const ANIMAL_BY_FOLIO_QUERY = `
  query AnimalByFolio($folio: Int!) {
    animal(where: { folio: $folio }) {
      id
      slug
    }
  }
`;

/** Slug del reporte de un folio (el QR del cartel). El slug no cambia: caché de 1 h. Solo servidor. */
export async function fetchAnimalKeyByFolio(folio: number): Promise<string | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: ANIMAL_BY_FOLIO_QUERY, variables: { folio } }),
      next: { revalidate: 60 * 60 },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      data?: { animal: { id: string; slug?: string | null } | null };
    };
    const animal = payload.data?.animal;
    return animal ? animal.slug || animal.id : null;
  } catch (error) {
    console.error('Animal by folio fetch failed:', error);
    return null;
  }
}

/** URL de la portada (primera imagen por orden) tal como la entrega el CMS. */
export function animalCoverUrl(animal: AnimalShareData): string | null {
  const [cover] = sortMultimediaByOrder(animal.multimedia);
  return cover?.image?.url || null;
}

const SITEMAP_ANIMALS_QUERY = `
  query AnimalsForSitemap($take: Int!, $skip: Int!) {
    animals(where: { duplicateOf: null }, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
      id
      slug
      createdAt
    }
  }
`;

const SITEMAP_PAGE = 1000;
const SITEMAP_MAX = 10000;

export type SitemapAnimal = { path: string; createdAt: string | null };

/** Fichas de animales para el sitemap (sin los reportes unidos a otro). Solo servidor. */
export async function fetchAnimalsForSitemap(): Promise<SitemapAnimal[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];
  const out: SitemapAnimal[] = [];
  try {
    for (let skip = 0; skip < SITEMAP_MAX; skip += SITEMAP_PAGE) {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: SITEMAP_ANIMALS_QUERY, variables: { take: SITEMAP_PAGE, skip } }),
        next: { revalidate: 60 * 60 },
      });
      if (!response.ok) break;
      const payload = (await response.json()) as {
        data?: { animals: Array<{ id: string; slug: string | null; createdAt: string | null }> | null };
      };
      const rows = payload.data?.animals ?? [];
      out.push(...rows.map((row) => ({ path: `/animales/${row.slug || row.id}`, createdAt: row.createdAt })));
      if (rows.length < SITEMAP_PAGE) break;
    }
  } catch (error) {
    console.error('Animals sitemap fetch failed:', error);
  }
  return out;
}
