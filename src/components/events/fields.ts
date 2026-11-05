/**
 * Campos de `PetEvent` que usan la tarjeta, la ficha y el panel. Texto plano para que lo compartan
 * las consultas del servidor (`server.ts`) y las de Apollo (`queries.ts`).
 */
export const EVENT_CARD_FIELDS = `
  id
  slug
  title
  category
  city
  state
  stateCode
  timeZone
  placeLabel
  neighborhood
  scope
  reachKm
  isFree
  price
  priceNote
  capacity
  status
  firstStartsAt
  lastEndsAt
  nextStartsAt
  nextEndsAt
  sessionsCount
  interestedCount
  goingCount
  isFull
  multimedia(orderBy: [{ order: asc }], take: 1) {
    id
    order
    image {
      url
    }
  }
`;

export const EVENT_DETAIL_FIELDS = `
  id
  slug
  title
  category
  species
  description
  requirements
  organizerName
  contactPhone
  lat
  lng
  placeLabel
  address
  neighborhood
  city
  state
  stateCode
  timeZone
  scope
  reachKm
  isFree
  price
  priceNote
  capacity
  registrationUrl
  registrationWhatsapp
  facebookUrl
  instagramUrl
  tiktokUrl
  xUrl
  websiteUrl
  status
  cancelReason
  firstStartsAt
  lastEndsAt
  nextStartsAt
  nextEndsAt
  interestedCount
  goingCount
  isFull
  createdAt
  updatedAt
  petPlace {
    id
    name
    slug
  }
  sessions(orderBy: [{ startsAt: asc }]) {
    id
    startsAt
    endsAt
  }
  multimedia(orderBy: [{ order: asc }]) {
    id
    order
    image {
      url
    }
  }
`;
