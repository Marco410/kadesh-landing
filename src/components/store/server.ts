import {
  STORE_BEST_SELLERS_SIZE,
  STORE_NAV_ENABLED,
  STORE_REVALIDATE_SECONDS,
  STORE_REVIEWS_PAGE_SIZE,
  STORE_SHOWCASE_REVALIDATE_SECONDS,
  STORE_SHOWCASE_SIZE,
} from './constants';
import { STORE_ITEM_FIELDS, STORE_REVIEW_FIELDS } from './fields';
import { storeCatalogInput } from './searchParams';
import type {
  StoreCatalog,
  StoreFacets,
  StoreFilters,
  StoreItem,
  StoreProduct,
  StoreReviews,
  StoreShowcaseItem,
} from './types';

/**
 * Store queries from the server (no session): `/tienda` and the product page. Cached for a
 * minute (`STORE_REVALIDATE_SECONDS`), below the 1 h signature of product photos. If the API
 * fails they answer empty so the page does not break.
 */

const CATALOG_QUERY = `
  query StoreCatalog($input: StoreCatalogInput) {
    storeCatalog(input: $input) {
      total
      items { ${STORE_ITEM_FIELDS} }
    }
  }
`;

const FACETS_QUERY = `
  query StoreCatalogFacets {
    storeCatalogFacets {
      enabled
      total
      categories { id slug name parentSlug imageUrl count }
      brands { id slug name logoUrl count }
      minPriceCents
      maxPriceCents
    }
  }
`;

const PRODUCT_QUERY = `
  query StoreCatalogProduct($slug: String!) {
    storeCatalogProduct(slug: $slug) {
      item { ${STORE_ITEM_FIELDS} }
      description
      metaTitle
      metaDescription
      images { url alt }
      variants { id title sku priceCents compareAtPriceCents inStock stockLeft }
      animalTypes
      ratingBreakdown
      related { ${STORE_ITEM_FIELDS} }
      shippingFlatCents
      freeShippingMinCents
      returnDays
    }
  }
`;

const REVIEWS_QUERY = `
  query StoreCatalogReviews($productId: ID!, $take: Int, $skip: Int) {
    storeCatalogReviews(productId: $productId, take: $take, skip: $skip) {
      total
      items { ${STORE_REVIEW_FIELDS} }
    }
  }
`;

type GraphqlResponse<T> = { data?: T; errors?: Array<{ message?: string }> };

async function queryGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
  revalidate: number = STORE_REVALIDATE_SECONDS,
): Promise<T | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      next: { revalidate },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as GraphqlResponse<T>;
    if (payload.errors?.length) console.error('Store GraphQL errors:', payload.errors);
    return payload.data ?? null;
  } catch (error) {
    console.error('Store GraphQL fetch failed:', error);
    return null;
  }
}

export async function fetchStoreCatalog(filters: StoreFilters): Promise<StoreCatalog> {
  const data = await queryGraphql<{ storeCatalog: StoreCatalog }>(CATALOG_QUERY, {
    input: storeCatalogInput(filters),
  });
  return data?.storeCatalog ?? { total: 0, items: [] };
}

/**
 * The «Los más vendidos» box: products sold at least once, most sold first. Before the first sales
 * it shows the newest instead, so the column is never empty (and never calls something a best
 * seller that has not sold). One request, cached like the rest of the catalog.
 */
export async function fetchStoreBestSellers(): Promise<{ kind: 'best_selling' | 'newest'; items: StoreItem[] }> {
  const take = STORE_BEST_SELLERS_SIZE;
  const sold = await queryGraphql<{ storeCatalog: StoreCatalog }>(CATALOG_QUERY, {
    input: { soldOnly: true, sort: 'best_selling', take, skip: 0 },
  });
  const soldItems = sold?.storeCatalog.items ?? [];
  if (soldItems.length >= 3) return { kind: 'best_selling', items: soldItems };
  const newest = await queryGraphql<{ storeCatalog: StoreCatalog }>(CATALOG_QUERY, {
    input: { sort: 'newest', take, skip: 0 },
  });
  return { kind: 'newest', items: newest?.storeCatalog.items ?? [] };
}

const SHOWCASE_QUERY = `
  query StoreShowcase($input: StoreCatalogInput) {
    storeCatalog(input: $input) {
      items { id slug name priceCents compareAtPriceCents coverUrl coverAlt }
    }
  }
`;

/**
 * A few featured products for small boxes outside the store (veterinary page, blog). Only the
 * fields the box paints; the same cached response for every page that shows it, kept 10 min
 * (`STORE_SHOWCASE_REVALIDATE_SECONDS`) so it does not shorten the blog's 10 min window. Empty while
 * the store is closed or hidden from the header (`STORE_NAV_ENABLED`), so no request is made then.
 */
export async function fetchStoreShowcase(take = STORE_SHOWCASE_SIZE): Promise<StoreShowcaseItem[]> {
  if (!STORE_NAV_ENABLED) return [];
  const data = await queryGraphql<{ storeCatalog: { items: StoreShowcaseItem[] } }>(SHOWCASE_QUERY, {
    // Only products marked «Destacado» in the admin: with none, the box does not show.
    input: { featured: true, sort: 'featured', take, skip: 0 },
  }, STORE_SHOWCASE_REVALIDATE_SECONDS);
  return data?.storeCatalog.items ?? [];
}

const EMPTY_FACETS: StoreFacets = {
  enabled: false,
  total: 0,
  categories: [],
  brands: [],
  minPriceCents: 0,
  maxPriceCents: 0,
};

/** Categories, brands and whether the store is open. */
export async function fetchStoreFacets(): Promise<StoreFacets> {
  const data = await queryGraphql<{ storeCatalogFacets: StoreFacets }>(FACETS_QUERY, {});
  return data?.storeCatalogFacets ?? EMPTY_FACETS;
}

export async function fetchStoreProduct(slug: string): Promise<StoreProduct | null> {
  if (!slug) return null;
  const data = await queryGraphql<{ storeCatalogProduct: StoreProduct | null }>(PRODUCT_QUERY, { slug });
  return data?.storeCatalogProduct ?? null;
}

/** First page of published reviews of a product. */
export async function fetchStoreReviews(productId: string): Promise<StoreReviews> {
  const data = await queryGraphql<{ storeCatalogReviews: Omit<StoreReviews, 'mine'> }>(REVIEWS_QUERY, {
    productId,
    take: STORE_REVIEWS_PAGE_SIZE,
    skip: 0,
  });
  return { total: data?.storeCatalogReviews.total ?? 0, items: data?.storeCatalogReviews.items ?? [], mine: null };
}

const SITEMAP_QUERY = `
  query StoreCatalogSitemap($input: StoreCatalogInput) {
    storeCatalog(input: $input) {
      items { slug }
    }
  }
`;

/** Pages of the catalog's max `take`; the store will not have more products than this for a while. */
const SITEMAP_PAGE = 48;
const SITEMAP_MAX = 960;

/**
 * Slugs of every product on sale, for the sitemap (only the slug, 48 per request). Empty while the
 * store is closed, so the sitemap does not list pages that answer 404.
 */
export async function fetchStoreProductsForSitemap(): Promise<string[]> {
  const out: string[] = [];
  for (let skip = 0; skip < SITEMAP_MAX; skip += SITEMAP_PAGE) {
    const data = await queryGraphql<{ storeCatalog: { items: Array<{ slug: string }> } }>(SITEMAP_QUERY, {
      input: { sort: 'newest', take: SITEMAP_PAGE, skip },
    });
    const rows = data?.storeCatalog.items ?? [];
    out.push(...rows.map((row) => row.slug).filter(Boolean));
    if (rows.length < SITEMAP_PAGE) break;
  }
  return out;
}
