import type { AdContext, AdPlacement, PublicAd } from './types';

/** Most ads one slot rotates through. */
export const MAX_ADS_PER_SLOT = 4;

/** A zone ad that matches weighs this much more than a national one with the same weight. */
const ZONE_BOOST = 2;

/** Distance in km between two points (haversine). */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function point(lat: number | null | undefined, lng: number | null | undefined) {
  return typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

/** Whether a slot could show a zone ad (then it is worth knowing where the visitor is). */
export function needsVisitorLocation(ads: PublicAd[], placement: AdPlacement): boolean {
  return ads.some((ad) => ad.geoScope === 'radius' && ad.placements.includes(placement));
}

type Eligible = { ad: PublicAd; score: number };

/**
 * The ads one slot may show, in rotation order:
 * 1. the ones with this placement, never the ad of the page on screen;
 * 2. zone ads only within their radius of `reference` (the page's place, or the visitor's);
 * 3. paid ones first, shuffled by weight (a zone match counts double); Kadesh's own only when
 *    nothing else applies.
 */
export function pickAds(
  ads: PublicAd[],
  placement: AdPlacement,
  context: AdContext,
  reference: { lat: number; lng: number } | null,
  random: () => number = Math.random,
): PublicAd[] {
  const eligible: Eligible[] = [];
  for (const ad of ads) {
    if (!ad.placements.includes(placement)) continue;
    if (context.targetId && ad.targetId === context.targetId) continue;
    let boost = 1;
    if (ad.geoScope === 'radius') {
      const center = point(ad.lat, ad.lng);
      if (!center || !reference || ad.radiusKm == null) continue;
      if (distanceKm(center, reference) > ad.radiusKm) continue;
      boost = ZONE_BOOST;
    }
    // Weighted shuffle (Efraimidis–Spirakis): higher weight, more likely to come first.
    const weight = Math.max(1, ad.weight) * boost;
    eligible.push({ ad, score: Math.pow(random(), 1 / weight) });
  }
  const paid = eligible.filter((entry) => entry.ad.kind !== 'house');
  const pool = paid.length > 0 ? paid : eligible;
  return pool
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ADS_PER_SLOT)
    .map((entry) => entry.ad);
}

/** The point zone ads are measured from on this screen, if the page knows one. */
export function contextPoint(context: AdContext) {
  return point(context.lat ?? null, context.lng ?? null);
}
