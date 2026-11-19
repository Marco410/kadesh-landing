/** Shapes of the public store API (`storeCatalog*` in kadesh-back). Money is in MXN cents. */

/** Who sells it. Kadesh's own and dropshipped products are both `kadesh`. */
export type StoreSeller = 'kadesh' | 'mercado_libre';

export type StoreRef = { slug: string; name: string };

export type StoreItem = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  seller: StoreSeller;
  priceCents: number;
  /** Previous price; only present when it is higher than `priceCents`. */
  compareAtPriceCents: number | null;
  currency: string;
  inStock: boolean;
  /** Signed for 1 h when it is an uploaded photo. */
  coverUrl: string | null;
  coverAlt: string | null;
  ratingAverage: number;
  ratingCount: number;
  isFeatured: boolean;
  category: StoreRef | null;
  brand: StoreRef | null;
  /** Only for `mercado_libre`: the outbound affiliate link. */
  affiliateUrl: string | null;
  /** Only for `mercado_libre`: when its price was last checked (ISO 8601). */
  priceCheckedAt: string | null;
};

export type StoreCatalog = { total: number; items: StoreItem[] };

export type StoreImage = { url: string; alt: string | null };

export type StoreVariant = {
  id: string;
  title: string | null;
  sku: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  inStock: boolean;
  /** Units left, only when stock is counted and running low. */
  stockLeft: number | null;
};

export type StoreProduct = {
  item: StoreItem;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  images: StoreImage[];
  variants: StoreVariant[];
  animalTypes: string[];
  /** Published reviews with 1, 2, 3, 4 and 5 stars, in that order. */
  ratingBreakdown: number[];
  related: StoreItem[];
};

export type StoreFacetCategory = {
  id: string;
  slug: string;
  name: string;
  parentSlug: string | null;
  imageUrl: string | null;
  count: number;
};

export type StoreFacetBrand = { id: string; slug: string; name: string; logoUrl: string | null; count: number };

export type StoreFacets = {
  enabled: boolean;
  total: number;
  categories: StoreFacetCategory[];
  brands: StoreFacetBrand[];
  minPriceCents: number;
  maxPriceCents: number;
};

export type StoreReviewAuthor = {
  name: string;
  username: string | null;
  avatarUrl: string | null;
  level: { level: number; key: string; label: string } | null;
};

export type StoreReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  verifiedPurchase: boolean;
  adminReply: string | null;
  /** `hidden` only ever reaches its author, in `mine`. */
  status: 'published' | 'hidden';
  createdAt: string | null;
  author: StoreReviewAuthor | null;
};

export type StoreReviews = { total: number; items: StoreReview[]; mine: StoreReview | null };

export type StoreSort = 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'best_selling';

/** Filters of `/tienda`, as they live in the URL. */
export type StoreFilters = {
  search: string;
  category: string | null;
  brand: string | null;
  seller: StoreSeller | null;
  onSale: boolean;
  sort: StoreSort;
};

/** `StoreCatalogInput` of the API. */
export type StoreCatalogInput = {
  search?: string | null;
  categorySlug?: string | null;
  brandSlug?: string | null;
  seller?: string | null;
  onSale?: boolean | null;
  sort?: string | null;
  take?: number;
  skip?: number;
};
