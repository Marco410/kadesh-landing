import { Routes } from 'kadesh/core/routes';
import { DEFAULT_STORE_FILTERS, STORE_PAGE_SIZE, STORE_SORT_OPTIONS } from './constants';
import type { StoreCatalogInput, StoreFilters, StoreSeller, StoreSort } from './types';

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

/** `/tienda?q=&categoria=&marca=&vende=&oferta=1&orden=` → filters. Unknown values fall back. */
export function parseStoreSearchParams(params: RawParams): StoreFilters {
  const seller = first(params.vende);
  const sort = first(params.orden) as StoreSort;
  return {
    search: first(params.q).slice(0, 80),
    category: first(params.categoria) || null,
    brand: first(params.marca) || null,
    seller: seller === 'kadesh' || seller === 'mercado_libre' ? (seller as StoreSeller) : null,
    onSale: first(params.oferta) === '1',
    sort: STORE_SORT_OPTIONS.some((option) => option.value === sort) ? sort : DEFAULT_STORE_FILTERS.sort,
  };
}

/** The URL of a set of filters. Defaults are left out so `/tienda` stays clean. */
export function storeListingHref(filters: StoreFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set('q', filters.search);
  if (filters.category) params.set('categoria', filters.category);
  if (filters.brand) params.set('marca', filters.brand);
  if (filters.seller) params.set('vende', filters.seller);
  if (filters.onSale) params.set('oferta', '1');
  if (filters.sort !== DEFAULT_STORE_FILTERS.sort) params.set('orden', filters.sort);
  const query = params.toString();
  return query ? `${Routes.store.index}?${query}` : Routes.store.index;
}

/** Any view other than the clean `/tienda` (a filter or another order): kept out of the index. */
export function isStoreVariantView(filters: StoreFilters): boolean {
  return hasStoreFilters(filters) || filters.sort !== DEFAULT_STORE_FILTERS.sort;
}

export function hasStoreFilters(filters: StoreFilters): boolean {
  return Boolean(filters.search || filters.category || filters.brand || filters.seller || filters.onSale);
}

/** The API input for a set of URL filters. The server's first page and the browser's «Ver más» share it. */
export function storeCatalogInput(filters: StoreFilters, skip = 0): StoreCatalogInput {
  return {
    search: filters.search || null,
    categorySlug: filters.category,
    brandSlug: filters.brand,
    seller: filters.seller,
    onSale: filters.onSale || null,
    sort: filters.sort,
    take: STORE_PAGE_SIZE,
    skip,
  };
}
