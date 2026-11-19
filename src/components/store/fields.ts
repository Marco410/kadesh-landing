/** Field selections shared by the server fetches (`server.ts`) and the Apollo documents (`queries.ts`). */

export const STORE_ITEM_FIELDS = `
  id
  slug
  name
  shortDescription
  seller
  priceCents
  compareAtPriceCents
  currency
  inStock
  coverUrl
  coverAlt
  ratingAverage
  ratingCount
  isFeatured
  variantsCount
  singleVariantId
  category { slug name }
  brand { slug name }
  affiliateUrl
  priceCheckedAt
`;

export const STORE_REVIEW_FIELDS = `
  id
  rating
  title
  body
  verifiedPurchase
  adminReply
  status
  createdAt
  author {
    name
    username
    avatarUrl
    level { level key label }
  }
`;

export const STORE_QUOTE_FIELDS = `
  lines {
    variantId
    productId
    slug
    name
    variantTitle
    coverUrl
    unitPriceCents
    compareAtPriceCents
    quantity
    requestedQuantity
    lineTotalCents
    maxQuantity
    issue
  }
  itemsCount
  subtotalCents
  shippingCents
  totalCents
  couponCode
  couponApplied
  couponDiscountCents
  couponMessage
  currency
  freeShippingMinCents
  missingForFreeShippingCents
  canCheckout
  messages
  paymentMethods
  returnPolicy
`;

export const STORE_ADDRESS_FIELDS = `
  id
  label
  recipientName
  phone
  street
  exteriorNumber
  interiorNumber
  neighborhood
  city
  stateCode
  stateName
  postalCode
  references
  isDefault
`;

export const STORE_TRANSFER_FIELDS = `
  bankName
  beneficiary
  clabe
  note
  reference
  amountCents
  expiresAt
`;

export const STORE_ORDER_SUMMARY_FIELDS = `
  number
  createdAt
  status
  paymentStatus
  fulfillmentStatus
  paymentMethod
  totalCents
  itemsCount
  firstItemName
  coverUrl
  expiresAt
`;
