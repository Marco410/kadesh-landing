import type { StoreFilters, StoreSort } from './types';

/** Products per page of `/tienda` (the API caps it at 48). */
export const STORE_PAGE_SIZE = 24;
export const STORE_REVIEWS_PAGE_SIZE = 10;
export const STORE_WISHLIST_PAGE_SIZE = 24;

/**
 * Server cache of store data. Product photos come with a URL signed for 1 h, so this must stay
 * well below that.
 */
export const STORE_REVALIDATE_SECONDS = 60;

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

// ─── Cart and checkout ──────────────────────────────────────────────────────────────────────

/** localStorage key of the cart (variants and quantities only). */
export const STORE_CART_STORAGE_KEY = 'kadesh.pet.cart';
/** localStorage key of the coupon code typed in the cart. Only a code the server accepted stays. */
export const STORE_COUPON_STORAGE_KEY = 'kadesh.pet.cart.coupon';
/** sessionStorage key of the order just placed: a reload right after lands on an empty checkout. */
export const STORE_LAST_ORDER_STORAGE_KEY = 'kadesh.pet.lastOrder';
/** How long the empty checkout offers that order (ms). */
export const STORE_LAST_ORDER_TTL_MS = 60 * 60 * 1000;
export const STORE_COUPON_CODE_MAX = 40;
/** Most units of one product per order (the backend enforces it too). */
export const STORE_CART_MAX_QUANTITY = 20;
export const STORE_CART_MAX_LINES = 50;
/** One quote per pause while the person changes quantities. */
export const STORE_QUOTE_DEBOUNCE_MS = 350;
export const STORE_ORDERS_PAGE_SIZE = 10;
export const STORE_GUEST_MIN_PASSWORD = 8;
/** Proof of a bank transfer: an image of up to 8 MB. */
export const STORE_PROOF_MAX_BYTES = 8 * 1024 * 1024;
export const STORE_PROOF_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const PAYMENT_METHOD_LABELS: Record<string, { title: string; description: string }> = {
  stripe_card: { title: 'Tarjeta de crédito o débito', description: 'Pago inmediato y seguro con Stripe.' },
  bank_transfer: {
    title: 'Transferencia bancaria',
    description: 'Te damos los datos, transfieres y subes tu comprobante. Apartamos tu pedido mientras tanto.',
  },
};

/** What the buyer reads for the state of an order. */
export function orderStatusText(order: {
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentMethod: string;
}): { label: string; tone: 'neutral' | 'warn' | 'ok' | 'bad' } {
  if (order.paymentStatus === 'refunded') return { label: 'Reembolsado', tone: 'neutral' };
  if (order.status === 'cancelled') return { label: 'Cancelado', tone: 'bad' };
  if (order.paymentStatus === 'in_review') return { label: 'Revisando tu comprobante', tone: 'warn' };
  if (order.paymentStatus !== 'paid') {
    return { label: order.paymentMethod === 'bank_transfer' ? 'Falta tu transferencia' : 'Falta el pago', tone: 'warn' };
  }
  if (order.fulfillmentStatus === 'delivered') return { label: 'Entregado', tone: 'ok' };
  if (order.fulfillmentStatus === 'shipped') return { label: 'En camino', tone: 'ok' };
  if (order.fulfillmentStatus === 'partial') return { label: 'Una parte va en camino', tone: 'ok' };
  if (order.fulfillmentStatus === 'returned') return { label: 'Devuelto', tone: 'neutral' };
  return { label: 'Preparando tu pedido', tone: 'ok' };
}
