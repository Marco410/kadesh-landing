import type { PawLeaderboardEntry, PawLeaderboardPeriod } from './types';

/**
 * Ranking de huellitas para páginas del servidor (`/ranking` y la portada). Sin sesión: nunca trae
 * `isMe` en `true`; la fila propia se marca en el navegador (`RankingBoard`).
 *
 * 5 min de caché (las fotos son URLs firmadas de 1 h). El back rehace su caché en cuanto cambia un
 * saldo, así que una huellita nueva sale en el ranking a lo más en 5 min.
 * Si el API falla devuelve `[]` y la sección no se pinta.
 */
export const PAW_RANKING_REVALIDATE_SECONDS = 300;
export const PAW_RANKING_PAGE_TAKE = 50;

const PAW_LEADERBOARD_QUERY = `
  query PawLeaderboard($period: String, $take: Int) {
    pawLeaderboard(period: $period, take: $take) {
      rank
      name
      username
      avatarUrl
      points
      streakWeeks
      level {
        level
        key
        label
      }
    }
  }
`;

type Response = {
  data?: { pawLeaderboard: PawLeaderboardEntry[] | null };
  errors?: Array<{ message?: string }>;
};

export async function fetchPawLeaderboard(
  period: PawLeaderboardPeriod,
  take: number = PAW_RANKING_PAGE_TAKE,
): Promise<PawLeaderboardEntry[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: PAW_LEADERBOARD_QUERY, variables: { period, take } }),
      next: { revalidate: PAW_RANKING_REVALIDATE_SECONDS },
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as Response;
    if (payload.errors?.length) {
      console.error('PawLeaderboard GraphQL errors:', payload.errors);
      return [];
    }
    return payload.data?.pawLeaderboard ?? [];
  } catch (error) {
    console.error('PawLeaderboard fetch failed:', error);
    return [];
  }
}
