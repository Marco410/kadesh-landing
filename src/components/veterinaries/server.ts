import { isPetPlaceKeystoneId } from './petPlaceSlug';

const REVALIDATE_SECONDS = 60;

const PET_PLACE_SHARE_QUERY = `
  query GetPetPlaceForShare($where: PetPlaceWhereUniqueInput!) {
    petPlace(where: $where) {
      id
      name
      slug
      description
      address
      street
      municipality
      state
      country
      phone
      emergencies
      verified
      averageRating
      reviewsCount
      types {
        label
        value
      }
    }
  }
`;

export type PetPlaceShareData = {
  id: string;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  address?: string | null;
  street?: string | null;
  municipality?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  emergencies?: boolean | null;
  verified?: boolean | null;
  averageRating?: number | null;
  reviewsCount?: number | null;
  types?: Array<{ label?: string | null; value?: string | null }> | null;
};

type PetPlaceShareResponse = {
  data?: { petPlace: PetPlaceShareData | null };
  errors?: Array<{ message?: string }>;
};

/** Datos mínimos para compartir una ficha; solo servidor. */
export async function fetchPetPlaceForShare(
  key: string,
): Promise<PetPlaceShareData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || !key) {
    return null;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: PET_PLACE_SHARE_QUERY,
        variables: {
          where: isPetPlaceKeystoneId(key) ? { id: key } : { slug: key },
        },
      }),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as PetPlaceShareResponse;
    if (payload.errors?.length) {
      console.error('PetPlace GraphQL errors:', payload.errors);
      return null;
    }

    return payload.data?.petPlace ?? null;
  } catch (error) {
    console.error('PetPlace GraphQL fetch failed:', error);
    return null;
  }
}
