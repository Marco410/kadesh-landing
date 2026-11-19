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

// ─── Cart and orders ────────────────────────────────────────────────────────────────────────

/** What the browser keeps of the cart: which variant and how many. Prices come from the server. */
export type CartItem = { variantId: string; quantity: number };

export type CartLineIssue = 'unavailable' | 'out_of_stock' | 'quantity_reduced';

export type CartLine = {
  variantId: string;
  productId: string | null;
  slug: string | null;
  name: string;
  variantTitle: string | null;
  coverUrl: string | null;
  unitPriceCents: number;
  compareAtPriceCents: number | null;
  /** What can actually be bought; lower than `requestedQuantity` when stock is short. */
  quantity: number;
  requestedQuantity: number;
  lineTotalCents: number;
  maxQuantity: number;
  issue: CartLineIssue | null;
};

export type StorePaymentMethod = 'stripe_card' | 'bank_transfer';

export type CartQuote = {
  lines: CartLine[];
  itemsCount: number;
  subtotalCents: number;
  /** After a free-shipping coupon. */
  shippingCents: number;
  /** Subtotal − couponDiscountCents + shippingCents. */
  totalCents: number;
  /** The code that was sent (normalized), applied or not; `null` when none was. */
  couponCode: string | null;
  couponApplied: boolean;
  /** Off the products. 0 for a free-shipping coupon. */
  couponDiscountCents: number;
  /** Why it applied or why it did not, ready to show. */
  couponMessage: string | null;
  currency: string;
  /** 0 = shipping is never free. */
  freeShippingMinCents: number;
  missingForFreeShippingCents: number;
  canCheckout: boolean;
  messages: string[];
  paymentMethods: StorePaymentMethod[];
  returnPolicy: string;
};

/** A shipping address as the forms send it. */
export type StoreAddressInput = {
  label?: string;
  recipientName: string;
  phone: string;
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  neighborhood: string;
  city: string;
  /** INEGI code of the state ("16"). */
  state: string;
  postalCode: string;
  references?: string;
};

export type StoreAddress = {
  id: string | null;
  label: string | null;
  recipientName: string;
  phone: string;
  street: string;
  exteriorNumber: string;
  interiorNumber: string | null;
  neighborhood: string;
  city: string;
  stateCode: string;
  stateName: string;
  postalCode: string;
  references: string | null;
  isDefault: boolean;
};

export type StoreTransferInstructions = {
  bankName: string;
  beneficiary: string;
  clabe: string;
  note: string | null;
  /** The concept to write on the transfer: the order number. */
  reference: string;
  amountCents: number;
  expiresAt: string | null;
};

export type PlaceOrderCode =
  | 'STORE_CLOSED'
  | 'LOGIN_REQUIRED'
  | 'EMAIL_EXISTS'
  | 'INVALID'
  | 'CART_CHANGED'
  | 'PRICE_CHANGED'
  | 'COUPON_INVALID'
  | 'PAYMENT_UNAVAILABLE'
  | 'PAYMENT_ERROR';

export type PlaceOrderResult = {
  success: boolean;
  message: string;
  code: PlaceOrderCode | null;
  orderNumber: string | null;
  totalCents: number | null;
  stripeClientSecret: string | null;
  sessionToken: string | null;
  transfer: StoreTransferInstructions | null;
  quote: CartQuote | null;
};

export type StoreOrderSummary = {
  number: string;
  createdAt: string | null;
  status: 'open' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'in_review' | 'paid' | 'failed' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'shipped' | 'delivered' | 'returned';
  paymentMethod: StorePaymentMethod;
  totalCents: number;
  itemsCount: number;
  firstItemName: string | null;
  coverUrl: string | null;
  expiresAt: string | null;
};

export type StoreOrderLine = {
  id: string;
  productId: string | null;
  productSlug: string | null;
  name: string;
  variantTitle: string | null;
  coverUrl: string | null;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
};

export type StoreOrderShipment = {
  id: string;
  status: 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'exception' | 'returned' | 'cancelled';
  statusLabel: string;
  carrier: string | null;
  trackingCode: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  items: string[];
};

export type StoreOrderDetail = {
  summary: StoreOrderSummary;
  subtotalCents: number;
  shippingCents: number;
  couponCode: string | null;
  couponDiscountCents: number;
  customerNote: string | null;
  cancelReason: string | null;
  address: StoreAddress;
  items: StoreOrderLine[];
  shipments: StoreOrderShipment[];
  timeline: Array<{ type: string; message: string; createdAt: string | null }>;
  transfer: StoreTransferInstructions | null;
  proofUploaded: boolean;
  proofRejectedReason: string | null;
  canCancel: boolean;
  canPay: boolean;
  returnPolicy: string | null;
  supportWhatsapp: string | null;
};
