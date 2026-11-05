import { gql } from '@apollo/client';
import { EVENT_CARD_FIELDS, EVENT_DETAIL_FIELDS } from './fields';
import type {
  EventInterestKind,
} from './constants';
import type {
  EventsFeed,
  EventsFeedFilters,
  EventStateFacet,
  OwnPetEvent,
  PetEvent,
  PetEventInput,
  PetEventMutationResult,
} from './types';

export const EVENTS_FEED_QUERY = gql`
  query PetEventsFeed($input: PetEventsFeedInput!) {
    petEventsFeed(input: $input) {
      total
      items {
        nextStartsAt
        nextEndsAt
        distanceKm
        event {
          ${EVENT_CARD_FIELDS}
        }
      }
    }
  }
`;

export interface EventsFeedResponse {
  petEventsFeed: EventsFeed;
}

export interface EventsFeedVariables {
  input: EventsFeedFilters;
}

export const EVENT_FACETS_QUERY = gql`
  query PetEventFacets {
    petEventFacets {
      code
      slug
      name
      count
      cities {
        key
        name
        count
      }
    }
  }
`;

export interface EventFacetsResponse {
  petEventFacets: EventStateFacet[];
}

/** Ficha con la sesión: el público ve las publicadas; quien la publicó, la suya en cualquier estado. */
export const EVENT_BY_SLUG_QUERY = gql`
  query PetEventBySlug($slug: String!) {
    petEvent(where: { slug: $slug }) {
      ${EVENT_DETAIL_FIELDS}
      reviewNote
      myInterest
      user {
        id
      }
    }
  }
`;

export interface EventBySlugResponse {
  petEvent: OwnPetEvent | null;
}

/** Solo lo que cambia con la sesión (para la ficha que llega del servidor sin sesión). */
export const EVENT_VIEWER_QUERY = gql`
  query PetEventViewer($id: ID!) {
    petEvent(where: { id: $id }) {
      id
      myInterest
      interestedCount
      goingCount
      isFull
      user {
        id
      }
    }
  }
`;

export interface EventViewerResponse {
  petEvent: {
    id: string;
    myInterest: EventInterestKind | null;
    interestedCount: number | null;
    goingCount: number | null;
    isFull: boolean | null;
    user: { id: string } | null;
  } | null;
}

export const MY_EVENTS_QUERY = gql`
  query MyPetEvents($userId: ID!) {
    petEvents(where: { user: { id: { equals: $userId } } }, orderBy: [{ createdAt: desc }]) {
      ${EVENT_CARD_FIELDS}
      reviewNote
      cancelReason
    }
  }
`;

export interface MyEventsResponse {
  petEvents: Array<PetEvent & { reviewNote: string | null }>;
}

export const SUBMIT_EVENT_MUTATION = gql`
  mutation SubmitPetEvent($input: PetEventInput!) {
    submitPetEvent(input: $input) {
      success
      message
      event {
        id
        slug
        status
      }
    }
  }
`;

export interface SubmitEventResponse {
  submitPetEvent: PetEventMutationResult;
}

export const UPDATE_EVENT_MUTATION = gql`
  mutation UpdateMyPetEvent($id: ID!, $input: PetEventInput!) {
    updateMyPetEvent(id: $id, input: $input) {
      success
      message
      event {
        id
        slug
        status
      }
    }
  }
`;

export interface UpdateEventResponse {
  updateMyPetEvent: PetEventMutationResult;
}

export interface EventInputVariables {
  id?: string;
  input: PetEventInput;
}

export const CANCEL_EVENT_MUTATION = gql`
  mutation CancelPetEvent($id: ID!, $reason: String) {
    cancelPetEvent(id: $id, reason: $reason) {
      success
      message
      event {
        id
        slug
        status
      }
    }
  }
`;

export interface CancelEventResponse {
  cancelPetEvent: PetEventMutationResult;
}

export const SET_EVENT_INTEREST_MUTATION = gql`
  mutation SetPetEventInterest($eventId: ID!, $kind: String) {
    setPetEventInterest(eventId: $eventId, kind: $kind) {
      success
      message
      kind
      interestedCount
      goingCount
      isFull
    }
  }
`;

export interface SetEventInterestResponse {
  setPetEventInterest: {
    success: boolean;
    message: string;
    kind: EventInterestKind | null;
    interestedCount: number;
    goingCount: number;
    isFull: boolean;
  };
}

export const CREATE_EVENT_PHOTOS_MUTATION = gql`
  mutation CreatePetEventMultimedias($data: [PetEventMultimediaCreateInput!]!) {
    createPetEventMultimedias(data: $data) {
      id
      order
      image {
        url
      }
    }
  }
`;

export const DELETE_EVENT_PHOTO_MUTATION = gql`
  mutation DeletePetEventMultimedia($id: ID!) {
    deletePetEventMultimedia(where: { id: $id }) {
      id
    }
  }
`;

export const UPDATE_EVENT_PHOTO_ORDER_MUTATION = gql`
  mutation UpdatePetEventMultimediaOrder($id: ID!, $order: Int!) {
    updatePetEventMultimedia(where: { id: $id }, data: { order: $order }) {
      id
      order
    }
  }
`;

/** Veterinarias verificadas de la persona (para "La organiza mi veterinaria"). */
export const MY_VERIFIED_PLACES_QUERY = gql`
  query MyVerifiedPetPlaces($userId: ID!) {
    petPlaces(where: { user: { id: { equals: $userId } }, claimStatus: { equals: "verified" } }, take: 20) {
      id
      name
    }
  }
`;

export interface MyVerifiedPlacesResponse {
  petPlaces: Array<{ id: string; name: string | null }>;
}
