/**
 * Ads of Kadesh Pet, from `activeAds` in kadesh-back (see its models/Pet/Ad/README.md). The values
 * of `kind`, `placement` and `tone` are the same as there: change them there first.
 */

export const AD_PLACEMENT = {
  ANIMAL_DETAIL: 'animal_detail',
  VET_DETAIL: 'vet_detail',
  BLOG: 'blog',
  STORE: 'store',
} as const;

export type AdPlacement = (typeof AD_PLACEMENT)[keyof typeof AD_PLACEMENT];

export type PublicAd = {
  id: string;
  /** house | store_product | pet_place | animal | brand */
  kind: string;
  title: string;
  body: string;
  brandLabel: string;
  ctaLabel: string;
  /** orange | green | sky | violet | neutral */
  tone: string;
  imageUrl: string | null;
  /** A path of this site (`/animales/…`) or an outside https link. */
  href: string;
  placements: string[];
  weight: number;
  /** The animal, product or clinic it promotes: its own page does not show it. */
  targetId: string | null;
  /** national | radius */
  geoScope: string;
  lat: number | null;
  lng: number | null;
  radiusKm: number | null;
};

/** Where the screen is, to choose zone ads: the animal's or clinic's location on its page. */
export type AdContext = {
  /** Id of the animal, product or clinic on screen. */
  targetId?: string | null;
  lat?: number | null;
  lng?: number | null;
};
