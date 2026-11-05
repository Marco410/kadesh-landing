import type { EventInterestKind, EventScope, EventStatus } from './constants';

export interface EventSession {
  id: string;
  startsAt: string;
  endsAt: string;
}

export interface EventPhoto {
  id: string;
  order: number | null;
  image: { url: string | null } | null;
}

/** Lo que muestran la tarjeta, la ficha y el panel (campos públicos de `PetEvent`). */
export interface PetEvent {
  id: string;
  slug: string | null;
  title: string;
  category: string;
  species: string[] | null;
  description: string;
  requirements: string | null;
  organizerName: string | null;
  contactPhone: string | null;
  lat: number;
  lng: number;
  placeLabel: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  stateCode: string | null;
  timeZone: string | null;
  scope: EventScope;
  reachKm: number | null;
  isFree: boolean;
  price: number | null;
  priceNote: string | null;
  capacity: number | null;
  registrationUrl: string | null;
  registrationWhatsapp: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  xUrl: string | null;
  websiteUrl: string | null;
  status: EventStatus;
  cancelReason: string | null;
  firstStartsAt: string | null;
  lastEndsAt: string | null;
  nextStartsAt: string | null;
  nextEndsAt: string | null;
  interestedCount: number | null;
  goingCount: number | null;
  isFull: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  /** Solo en la tarjeta. */
  sessionsCount?: number | null;
  sessions: EventSession[];
  multimedia: EventPhoto[];
  petPlace: { id: string; name: string | null; slug: string | null } | null;
}

/** Ficha vista por quien la publicó: además, su estado de revisión. */
export interface OwnPetEvent extends PetEvent {
  reviewNote: string | null;
  myInterest?: EventInterestKind | null;
  user: { id: string } | null;
}

export interface EventFeedItem {
  event: PetEvent;
  nextStartsAt: string | null;
  nextEndsAt: string | null;
  distanceKm: number | null;
}

export interface EventsFeed {
  total: number;
  items: EventFeedItem[];
}

export interface EventCityFacet {
  key: string;
  name: string;
  count: number;
}

export interface EventStateFacet {
  code: string;
  slug: string;
  name: string;
  count: number;
  cities: EventCityFacet[];
}

export interface EventsFeedFilters {
  state?: string | null;
  city?: string | null;
  category?: string | null;
  to?: string | null;
  lat?: number | null;
  lng?: number | null;
  radiusKm?: number | null;
  sort?: 'date' | 'distance' | null;
  past?: boolean | null;
  take?: number;
  skip?: number;
}

/** Una fecha en el formulario: día y horas en la zona horaria del evento. */
export interface EventSessionDraft {
  key: string;
  date: string;
  startTime: string;
  /** Igual a `date` salvo que dure varios días. */
  endDate: string;
  endTime: string;
}

export interface EventFormValues {
  title: string;
  category: string;
  species: string[];
  description: string;
  requirements: string;
  organizerName: string;
  contactPhone: string;
  lat: string;
  lng: string;
  placeLabel: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  scope: EventScope;
  reachKm: number;
  isFree: boolean;
  price: string;
  priceNote: string;
  capacity: string;
  registrationUrl: string;
  registrationWhatsapp: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  xUrl: string;
  websiteUrl: string;
  sessions: EventSessionDraft[];
}

export interface PetEventInput {
  title: string;
  category: string;
  species: string[];
  description: string;
  requirements: string | null;
  organizerName: string | null;
  contactPhone: string | null;
  petPlaceId?: string | null;
  lat: number;
  lng: number;
  placeLabel: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  scope: EventScope;
  reachKm: number | null;
  isFree: boolean;
  price: number | null;
  priceNote: string | null;
  capacity: number | null;
  registrationUrl: string | null;
  registrationWhatsapp: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  xUrl: string | null;
  websiteUrl: string | null;
  sessions: Array<{ startsAt: string; endsAt: string }>;
}

export interface PetEventMutationResult {
  success: boolean;
  message: string;
  event: { id: string; slug: string | null; status: EventStatus } | null;
}
