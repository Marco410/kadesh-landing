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
