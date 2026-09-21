import { isAnimalKeystoneId } from './animalSlug';
import { sortMultimediaByOrder } from './sortMultimedia';

const REVALIDATE_SECONDS = 60;

const ANIMAL_SHARE_QUERY = `
  query GetAnimalForShare($where: AnimalWhereUniqueInput!) {
    animal(where: $where) {
      id
      slug
      name
      sex
      age
      color
      size
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
  name?: string | null;
  sex?: string | null;
  age?: string | null;
  color?: string | null;
  size?: string | null;
  animal_breed?: {
    breed?: string | null;
    animal_type?: { name?: string | null } | null;
  } | null;
  multimedia?: Array<{ order?: number | null; image?: { url?: string | null } | null }> | null;
  logs?: Array<{
    status: string;
    city?: string | null;
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

/** URL de la portada (primera imagen por orden) tal como la entrega el CMS. */
export function animalCoverUrl(animal: AnimalShareData): string | null {
  const [cover] = sortMultimediaByOrder(animal.multimedia);
  return cover?.image?.url || null;
}
