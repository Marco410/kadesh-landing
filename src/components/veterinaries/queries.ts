import { gql } from '@apollo/client';

export const GET_NEARBY_PET_PLACES = gql`
  query GetNearbyPetPlaces($input: NearbyPetPlacesInput!, $where: PetPlaceWhereInput!) {
    getNearbyPetPlaces(input: $input) {
      message
      success
      petPlaces {
        id
        name
        slug
        description
        phone
        state
        address
        country
        cp
        createdAt
        distance
        google_opening_hours
        google_place_id
        isOpen
        lat
        lng
        municipality
        street
        views
        website
        verified
        pet_place_reviews {
          id
          rating
          review
          google_user
          google_user_photo
          createdAt
          user {
            name
            lastName
            secondLastName
            username
            email
            phone
            verified
            profileImage {
              url
            }
          }
        }
        pet_place_social_media {
          link
          social_media
          createdAt
        }
        pet_place_likes {
          id
        }
        services {
          id
          name
          slug
          description
          active
          createdAt
        }
        types {
          label
          value
        }
        user {
          id
          name
          lastName
          username
          email
          phone
          verified
          profileImage {
            url
          }
        }
        reviewsCount
        averageRating
      }
    }
    petPlacesCount(where: $where)
  }
`;

export const GET_PET_PLACE = gql`
  query PetPlace($where: PetPlaceWhereUniqueInput!) {
    petPlace(where: $where) {
      id
      name
      slug
      description
      address
      street
      state
      municipality
      country
      cp
      lat
      lng
      phone
      website
      whatsapp
      email
      emergencies
      parking
      appointmentRequired
      verified
      claimStatus
      isOpen
      views
      averageRating
      reviewsCount
      pet_place_likesCount
      createdAt
      pet_place_reviews(orderBy: [{ createdAt: desc }]) {
        id
        rating
        review
        createdAt
        google_user
        user {
          id
          name
          lastName
          username
          verified
          profileImage {
            url
          }
        }
      }
      pet_place_reviewsCount
      pet_place_schedules {
        day
        timeIni
        timeEnd
        createdAt
      }
      pet_place_social_media {
        id
        link
        social_media
      }
      services {
        id
        name
        description
        slug
        active
      }
      types {
        label
        value
      }
      user {
        id
        name
        lastName
        secondLastName
        username
        verified
        profileImage {
          url
        }
      }
    }
  }
`;

export const CREATE_PET_PLACE_REVIEW_MUTATION = gql`
  mutation CreatePetPlaceReview($data: ReviewCreateInput!) {
    createReview(data: $data) {
      id
      rating
      review
      createdAt
      user {
        id
        name
        lastName
        profileImage {
          url
        }
      }
    }
  }
`;

export interface CreatePetPlaceReviewVariables {
  data: {
    rating: number;
    review?: string | null;
    pet_place: { connect: { id: string } };
    user: { connect: { id: string } };
    google_user?: string | null;
  };
}

export interface CreatePetPlaceReviewResponse {
  createReview: {
    id: string;
    rating: number | null;
    review: string | null;
    createdAt: string;
    user: { id: string; name: string; lastName: string | null; profileImage: { url: string } | null } | null;
  };
}

export const DELETE_PET_PLACE_REVIEW_MUTATION = gql`
  mutation DeletePetPlaceReview($where: PetPlaceReviewWhereUniqueInput!) {
    deletePetPlaceReview(where: $where) {
      id
    }
  }
`;

export interface DeletePetPlaceReviewVariables {
  where: { id: string };
}

export interface DeletePetPlaceReviewResponse {
  deletePetPlaceReview: { id: string };
}

export const CLAIM_PET_PLACE_MUTATION = gql`
  mutation ClaimPetPlace($input: ClaimPetPlaceInput!) {
    claimPetPlace(input: $input) {
      success
      message
      claimStatus
      petPlaceId
    }
  }
`;

export interface ClaimPetPlaceVariables {
  input: {
    petPlaceId: string;
    role: string;
    phone: string;
    notes?: string | null;
  };
}

export interface ClaimPetPlaceResponse {
  claimPetPlace: {
    success: boolean;
    message: string;
    claimStatus: string | null;
    petPlaceId: string | null;
  };
}

export const UPDATE_MY_PET_PLACE_MUTATION = gql`
  mutation UpdateMyPetPlace($input: UpdateMyPetPlaceInput!) {
    updateMyPetPlace(input: $input) {
      success
      message
      petPlaceId
    }
  }
`;

export interface UpdateMyPetPlaceVariables {
  input: {
    petPlaceId: string;
    name?: string;
    description?: string;
    phone?: string;
    whatsapp?: string;
    website?: string;
    street?: string;
    municipality?: string;
    state?: string;
    country?: string;
    cp?: string;
    address?: string;
    emergencies?: boolean;
    email?: string;
    parking?: boolean;
    appointmentRequired?: boolean;
    socialMedia?: Array<{ social_media: string; link: string }>;
    types?: string[];
    serviceIds?: string[];
    schedules?: Array<{ day: string; timeIni: number; timeEnd: number }>;
  };
}

export interface UpdateMyPetPlaceResponse {
  updateMyPetPlace: {
    success: boolean;
    message: string;
    petPlaceId: string | null;
  };
}

export const GET_MY_PET_PLACES_QUERY = gql`
  query GetMyPetPlaces(
    $where: PetPlaceWhereInput!
    $orderBy: [PetPlaceOrderByInput!]!
  ) {
    petPlaces(where: $where, orderBy: $orderBy) {
      id
      name
      slug
      description
      phone
      whatsapp
      website
      street
      municipality
      state
      country
      cp
      address
      emergencies
      parking
      appointmentRequired
      email
      verified
      claimStatus
      claimPhone
      claimedAt
      types {
        id
        label
        value
      }
      services {
        id
        name
        slug
        description
        active
      }
      requested_services {
        id
        name
        description
        status
      }
      patients {
        id
        name
        lastName
        phone
        email
      }
      pet_place_schedules {
        id
        day
        timeIni
        timeEnd
      }
      pet_place_social_media {
        id
        link
        social_media
      }
    }
  }
`;

export interface MyPetPlace {
  id: string;
  name: string;
  slug?: string | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  street: string | null;
  municipality: string | null;
  state: string | null;
  country: string | null;
  cp: string | null;
  address: string | null;
  emergencies: boolean | null;
  parking: boolean | null;
  appointmentRequired: boolean | null;
  email: string | null;
  verified: boolean | null;
  claimStatus: string | null;
  claimPhone: string | null;
  claimedAt: string | null;
  types?: Array<{
    id: string;
    label: string | null;
    value: string | null;
  }> | null;
  services?: Array<{
    id: string;
    name: string | null;
    slug: string | null;
    description: string | null;
    active: boolean | null;
  }> | null;
  requested_services?: Array<{
    id: string;
    name: string | null;
    description: string | null;
    status: string | null;
  }> | null;
  patients?: Array<ClinicPatient> | null;
  pet_place_schedules?: Array<{
    id: string;
    day: string;
    timeIni: number | string | null;
    timeEnd: number | string | null;
  }> | null;
  pet_place_social_media: Array<{
    id: string;
    link: string | null;
    social_media: string | null;
  }>;
}

export interface ClinicPatient {
  id: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
}

export interface GetMyPetPlacesResponse {
  petPlaces: MyPetPlace[];
}

export interface GetMyPetPlacesVariables {
  where: {
    user: { id: { equals: string } };
  };
  orderBy: Array<{ createdAt?: "asc" | "desc" }>;
}

export const GET_PET_PLACE_LIKES_QUERY = gql`
  query GetPetPlaceLikes(
    $countWhere: PetPlaceLikeWhereInput!
    $mineWhere: PetPlaceLikeWhereInput!
  ) {
    petPlaceLikesCount(where: $countWhere)
    petPlaceLikes(where: $mineWhere, take: 1) {
      id
    }
  }
`;

export interface GetPetPlaceLikesResponse {
  petPlaceLikesCount: number;
  petPlaceLikes: Array<{ id: string }>;
}

export interface GetPetPlaceLikesVariables {
  countWhere: {
    pet_place: { id: { equals: string } };
  };
  mineWhere: {
    AND: Array<{
      pet_place?: { id: { equals: string } };
      user?: { id: { equals: string } };
    }>;
  };
}

export const CREATE_PET_PLACE_LIKE_MUTATION = gql`
  mutation CreatePetPlaceLike($data: PetPlaceLikeCreateInput!) {
    createPetPlaceLike(data: $data) {
      id
    }
  }
`;

export interface CreatePetPlaceLikeVariables {
  data: {
    pet_place: { connect: { id: string } };
    user: { connect: { id: string } };
  };
}

export interface CreatePetPlaceLikeResponse {
  createPetPlaceLike: { id: string };
}

export const DELETE_PET_PLACE_LIKE_MUTATION = gql`
  mutation DeletePetPlaceLike($where: PetPlaceLikeWhereUniqueInput!) {
    deletePetPlaceLike(where: $where) {
      id
    }
  }
`;

export interface DeletePetPlaceLikeVariables {
  where: { id: string };
}

export interface DeletePetPlaceLikeResponse {
  deletePetPlaceLike: { id: string };
}

export const CREATE_PET_PLACE_APPOINTMENT_MUTATION = gql`
  mutation CreatePetPlaceAppointment($data: PetPlaceAppointmentCreateInput!) {
    createPetPlaceAppointment(data: $data) {
      id
      startsAt
      endsAt
      status
      petName
      pet_place {
        id
        name
      }
    }
  }
`;

export interface PetPlaceAppointmentCreateInput {
  pet_place: { connect: { id: string } };
  startsAt: string;
  endsAt: string;
  service?: { connect: { id: string } };
  petName?: string;
  petSpecies?: string;
  notes?: string;
}

export interface CreatePetPlaceAppointmentVariables {
  data: PetPlaceAppointmentCreateInput;
}

export interface CreatedPetPlaceAppointment {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string | null;
  petName: string | null;
  pet_place: { id: string; name: string | null } | null;
}

export interface CreatePetPlaceAppointmentResponse {
  createPetPlaceAppointment: CreatedPetPlaceAppointment | null;
}

export const GET_MY_APPOINTMENTS_QUERY = gql`
  query MyAppointments {
    authenticatedItem {
      ... on User {
        id
        my_appointments(orderBy: [{ startsAt: desc }]) {
          id
          startsAt
          endsAt
          status
          petName
          petSpecies
          pet_place {
            id
            name
            slug
          }
        }
      }
    }
  }
`;

export interface MyAppointment {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string | null;
  petName: string | null;
  petSpecies: string | null;
  pet_place: {
    id: string;
    name: string | null;
    slug?: string | null;
  } | null;
}

export interface GetMyAppointmentsResponse {
  authenticatedItem: {
    id: string;
    my_appointments: MyAppointment[];
  } | null;
}

export const CANCEL_PET_PLACE_APPOINTMENT_MUTATION = gql`
  mutation CancelAppointment($id: ID!, $data: PetPlaceAppointmentUpdateInput!) {
    updatePetPlaceAppointment(where: { id: $id }, data: $data) {
      id
      status
    }
  }
`;

export interface CancelPetPlaceAppointmentVariables {
  id: string;
  data: {
    status: "cancelled";
    cancelReason?: string;
  };
}

export interface CancelPetPlaceAppointmentResponse {
  updatePetPlaceAppointment: {
    id: string;
    status: string | null;
  } | null;
}

export const GET_PET_PLACE_SERVICES_QUERY = gql`
  query PetPlaceServicesCatalog {
    petPlaceServices(orderBy: [{ name: asc }]) {
      id
      name
      slug
      description
      active
      status
    }
  }
`;

export interface PetPlaceServiceCatalogItem {
  id: string;
  name: string | null;
  slug: string | null;
  description: string | null;
  active: boolean | null;
  status: string | null;
}

export interface GetPetPlaceServicesResponse {
  petPlaceServices: PetPlaceServiceCatalogItem[];
}

export const GET_CLINIC_APPOINTMENTS_QUERY = gql`
  query ClinicAppointments(
    $where: PetPlaceAppointmentWhereInput!
    $orderBy: [PetPlaceAppointmentOrderByInput!]!
  ) {
    petPlaceAppointments(where: $where, orderBy: $orderBy) {
      id
      startsAt
      endsAt
      status
      petName
      petSpecies
      notes
      ownerNotes
      cancelReason
      service {
        id
        name
      }
      customer {
        id
        name
        lastName
        email
        phone
      }
    }
  }
`;

export interface ClinicAppointment {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string | null;
  petName: string | null;
  petSpecies: string | null;
  notes: string | null;
  ownerNotes: string | null;
  cancelReason: string | null;
  service: { id: string; name: string | null } | null;
  customer: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

export interface GetClinicAppointmentsResponse {
  petPlaceAppointments: ClinicAppointment[];
}

export interface GetClinicAppointmentsVariables {
  where: Record<string, unknown>;
  orderBy: Array<{ startsAt?: "asc" | "desc" }>;
}

export const UPDATE_PET_PLACE_APPOINTMENT_MUTATION = gql`
  mutation UpdateClinicAppointment(
    $id: ID!
    $data: PetPlaceAppointmentUpdateInput!
  ) {
    updatePetPlaceAppointment(where: { id: $id }, data: $data) {
      id
      status
      ownerNotes
      cancelReason
    }
  }
`;

export interface UpdatePetPlaceAppointmentVariables {
  id: string;
  data: {
    status?: string;
    cancelReason?: string;
    ownerNotes?: string;
  };
}

export interface UpdatePetPlaceAppointmentResponse {
  updatePetPlaceAppointment: {
    id: string;
    status: string | null;
    ownerNotes: string | null;
    cancelReason: string | null;
  } | null;
}

export const REQUEST_PET_PLACE_SERVICE_MUTATION = gql`
  mutation RequestPetPlaceService($input: RequestPetPlaceServiceInput!) {
    requestPetPlaceService(input: $input) {
      success
      message
      serviceId
      status
    }
  }
`;

export interface RequestPetPlaceServiceVariables {
  input: {
    petPlaceId: string;
    name: string;
    description?: string;
  };
}

export interface RequestPetPlaceServiceResponse {
  requestPetPlaceService: {
    success: boolean;
    message: string;
    serviceId: string | null;
    status: string | null;
  };
}

export const CREATE_PET_PLACE_PATIENT_MUTATION = gql`
  mutation CreatePetPlacePatient($input: CreatePetPlacePatientInput!) {
    createPetPlacePatient(input: $input) {
      success
      message
      created
      patient {
        id
        name
        lastName
        phone
        email
      }
    }
  }
`;

export interface CreatePetPlacePatientVariables {
  input: {
    petPlaceId: string;
    name: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
}

export interface CreatePetPlacePatientResponse {
  createPetPlacePatient: {
    success: boolean;
    message: string;
    created: boolean;
    patient: ClinicPatient | null;
  };
}

export const CREATE_CLINIC_APPOINTMENT_MUTATION = gql`
  mutation CreateClinicAppointment($input: CreateClinicAppointmentInput!) {
    createClinicAppointment(input: $input) {
      success
      message
      appointmentId
    }
  }
`;

export interface CreateClinicAppointmentVariables {
  input: {
    petPlaceId: string;
    customerId: string;
    startsAt: string;
    endsAt: string;
    serviceId?: string;
    petName?: string;
    petSpecies?: string;
    notes?: string;
  };
}

export interface CreateClinicAppointmentResponse {
  createClinicAppointment: {
    success: boolean;
    message: string;
    appointmentId: string | null;
  };
}
