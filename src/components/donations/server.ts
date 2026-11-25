import {
  DONATIONS_ENABLED,
  DONATION_WALL_HOME,
  DONATION_WALL_PAGE,
  DONATIONS_REVALIDATE_SECONDS,
  DONOR_RANKING_TAKE,
} from './constants';
import type { DonationsBoard } from './types';

/**
 * Wall, donor top and summary of «Dame una patita» for server pages (`/donaciones` and the home
 * page), in ONE request every 10 min. Nothing here changes per visitor, so the browser never asks
 * again. On failure it answers an empty board and the sections show their empty state.
 */

const WALL_FIELDS = `
  items {
    id
    displayName
    unitCount
    message
    paidAt
  }
  hasMore
`;

const RANKING_FIELDS = `
  rank
  displayName
  units
  donations
`;

const BOARD_QUERY = `
  query DonationsBoard($wallTake: Int, $rankingTake: Int) {
    wall: donationWall(take: $wallTake) { ${WALL_FIELDS} }
    rankingMonth: donorRanking(period: "month", take: $rankingTake) { ${RANKING_FIELDS} }
    rankingAllTime: donorRanking(period: "all_time", take: $rankingTake) { ${RANKING_FIELDS} }
    summary: donationSummary { supporters units wallMessages }
  }
`;

const HOME_QUERY = `
  query DonationsHome($wallTake: Int) {
    wall: donationWall(take: $wallTake) { ${WALL_FIELDS} }
    summary: donationSummary { supporters units wallMessages }
  }
`;

export const EMPTY_DONATIONS_BOARD: DonationsBoard = {
  wall: { items: [], hasMore: false },
  rankingMonth: [],
  rankingAllTime: [],
  summary: { supporters: 0, units: 0, wallMessages: 0 },
};

async function postQuery<T>(query: string, variables: Record<string, unknown>, label: string): Promise<T | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // Off: the backend may not have these queries yet.
  if (!apiUrl || !DONATIONS_ENABLED) return null;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: DONATIONS_REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: T; errors?: Array<{ message?: string }> };
    if (payload.errors?.length) {
      console.error(`${label} GraphQL errors:`, payload.errors);
      return null;
    }
    return payload.data ?? null;
  } catch (error) {
    console.error(`${label} fetch failed:`, error);
    return null;
  }
}

/** Everything `/donaciones` shows: first page of the wall, both tops and the summary. */
export async function fetchDonationsBoard(): Promise<DonationsBoard> {
  const data = await postQuery<Partial<DonationsBoard>>(
    BOARD_QUERY,
    { wallTake: DONATION_WALL_PAGE, rankingTake: DONOR_RANKING_TAKE },
    'DonationsBoard',
  );
  return {
    wall: data?.wall ?? EMPTY_DONATIONS_BOARD.wall,
    rankingMonth: data?.rankingMonth ?? [],
    rankingAllTime: data?.rankingAllTime ?? [],
    summary: data?.summary ?? EMPTY_DONATIONS_BOARD.summary,
  };
}

/** The home section: the latest three messages and the summary. */
export async function fetchDonationsHome(): Promise<Pick<DonationsBoard, 'wall' | 'summary'>> {
  const data = await postQuery<Partial<DonationsBoard>>(HOME_QUERY, { wallTake: DONATION_WALL_HOME }, 'DonationsHome');
  return {
    wall: data?.wall ?? EMPTY_DONATIONS_BOARD.wall,
    summary: data?.summary ?? EMPTY_DONATIONS_BOARD.summary,
  };
}
