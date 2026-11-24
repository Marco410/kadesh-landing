import 'server-only';
import type { PublicAd } from './types';

/**
 * Seconds the list of ads is kept. Below the 1 h of the signed image URLs (kadesh-back
 * `s3Common.signed.expiry`), and the backend also keeps it 5 min.
 */
export const ADS_REVALIDATE_SECONDS = 300;

const ACTIVE_ADS_QUERY = `
  query ActiveAds {
    activeAds {
      id
      kind
      title
      body
      brandLabel
      ctaLabel
      tone
      imageUrl
      href
      placements
      weight
      targetId
      geoScope
      lat
      lng
      radiusKm
    }
  }
`;

/**
 * Every live ad, fetched on the server and kept in Next's data cache: visits never ask the backend
 * for ads. Without the list (backend down), the slots show nothing.
 */
export async function fetchActiveAds(): Promise<PublicAd[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: ACTIVE_ADS_QUERY }),
      next: { revalidate: ADS_REVALIDATE_SECONDS, tags: ['active-ads'] },
    });
    if (!response.ok) return [];
    const json = (await response.json()) as { data?: { activeAds?: PublicAd[] } };
    return json.data?.activeAds ?? [];
  } catch (error) {
    console.error('[ads] activeAds fetch failed:', error);
    return [];
  }
}
