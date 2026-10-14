const REVALIDATE_SECONDS = 60 * 60;

const PET_LANDING_STATS_QUERY = `
  query PetLandingStats {
    petLandingStats {
      animals
      animalsLost
      animalsHome
      animalsInAdoption
      veterinaries
      veterinariesVerified
      cities
    }
  }
`;

export type PetLandingStats = {
  animals: number;
  animalsLost: number;
  animalsHome: number;
  animalsInAdoption: number;
  veterinaries: number;
  veterinariesVerified: number;
  cities: number;
};

type PetLandingStatsResponse = {
  data?: { petLandingStats: PetLandingStats | null };
  errors?: Array<{ message?: string }>;
};

/** Cifras agregadas para el hero; solo servidor. Devuelve null si el API falla para no romper la portada. */
export async function fetchPetLandingStats(): Promise<PetLandingStats | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return null;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: PET_LANDING_STATS_QUERY }),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as PetLandingStatsResponse;
    if (payload.errors?.length) {
      console.error('PetLandingStats GraphQL errors:', payload.errors);
      return null;
    }

    return payload.data?.petLandingStats ?? null;
  } catch (error) {
    console.error('PetLandingStats GraphQL fetch failed:', error);
    return null;
  }
}
