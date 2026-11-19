import type { StoreFilters, StoreSort } from './types';

/** Products per page of `/tienda` (the API caps it at 48). */
export const STORE_PAGE_SIZE = 24;
export const STORE_REVIEWS_PAGE_SIZE = 10;
export const STORE_WISHLIST_PAGE_SIZE = 24;

/**
 * Server cache of store data. Product photos come with a URL signed for 1 h, so this must stay
 * well below that.
 */
export const STORE_REVALIDATE_SECONDS = 10 * 60;

export const STORE_SEARCH_DEBOUNCE_MS = 350;
export const STORE_SEARCH_MIN_LENGTH = 2;

export const STORE_REVIEW_TITLE_MAX = 120;
export const STORE_REVIEW_BODY_MAX = 2000;

export const STORE_SORT_OPTIONS: Array<{ value: StoreSort; label: string }> = [
  { value: 'featured', label: 'Destacados' },
  { value: 'newest', label: 'Lo más nuevo' },
  { value: 'best_selling', label: 'Más vendidos' },
  { value: 'rating', label: 'Mejor calificados' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
];

export const STORE_SELLER_OPTIONS: Array<{ value: '' | 'kadesh' | 'mercado_libre'; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'kadesh', label: 'Vende Kadesh' },
  { value: 'mercado_libre', label: 'En Mercado Libre' },
];

export const DEFAULT_STORE_FILTERS: StoreFilters = {
  search: '',
  category: null,
  brand: null,
  seller: null,
  onSale: false,
  sort: 'featured',
};

/** Shown next to every outbound affiliate link. */
export const AFFILIATE_DISCLOSURE =
  'Enlace de afiliado: si compras, Kadesh recibe una comisión de Mercado Libre sin costo extra para ti.';

/** The header link to the store only shows once the store is open. */
export const STORE_NAV_ENABLED = process.env.NEXT_PUBLIC_STORE_ENABLED === 'true';
