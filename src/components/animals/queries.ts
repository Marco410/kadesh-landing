import { gql } from '@apollo/client';

// TODO: Replace with actual GraphQL query when backend is ready
// For now, we'll use mock data structure
export const GET_ANIMALS_QUERY = gql`
  query GetAnimals($skip: Int!, $take: Int, $orderBy: [AnimalOrderByInput!]!, $where: AnimalWhereInput!) {
    animals(skip: $skip, take: $take, orderBy: $orderBy, where: $where) {
      name
      id
      slug
      createdAt
      user {
        id
        name
        lastName
        username
      }
      animal_breed {
        breed
        animal_type {
          name
        }
      }
      logs {
        id
        last_seen
        lat
        lng
        notes
        status
        createdAt
      }
      multimedia(orderBy: [{ order: asc }]) {
        order
        image {
          url
        }
      }
    }
  }
`;

export const GET_ANIMALS_COUNT_QUERY = gql`
  query GetAnimalsCount($where: AnimalWhereInput!) {
    animalsCount(where: $where)
  }
`;

// Keep old query for backward compatibility if needed
export const GET_LOST_ANIMALS_QUERY = gql`
  query GetLostAnimals($take: Int, $skip: Int!, $where: LostAnimalWhereInput) {
    lostAnimals(take: $take, skip: $skip, where: $where) {
      id
      name
      type
      breed
      status
      location
      latitude
      longitude
      image {
        url
      }
      description
      createdAt
      updatedAt
      contactPhone
      contactEmail
    }
    lostAnimalsCount
  }
`;

// Queries for creating animals
export const GET_NEARBY_ANIMALS_QUERY = gql`
  query GetNearbyAnimals($input: NearbyAnimalsInput!) {
    getNearbyAnimals(input: $input) {
      success
      message
      total
      animals {
        id
        slug
        name
        distance
        sex
        lat
        lng
        address
        city
        state
        country
        status
        animal_breed {
          id
          breed
        }
        animal_type {
          id
          name
        }
        user {
          name
          profileImage {
            url
          }
        }
        createdAt
        multimedia {
          id
          url
          order
        }
      }
    }
  }
`;

export const GET_ANIMAL_TYPES_QUERY = gql`
  query GetAnimalTypes($orderBy: [AnimalTypeOrderByInput!]!) {
    animalTypes(orderBy: $orderBy) {
      name
      id
      order
    }
  }
`;

export const GET_ANIMAL_BREEDS_QUERY = gql`
  query GetAnimalBreeds($where: AnimalBreedWhereInput!, $orderBy: [AnimalBreedOrderByInput!]!) {
    animalBreeds(where: $where, orderBy: $orderBy) {
      animal_type {
        name
      }
      breed
      id
    }
  }
`;

// Mutations
export const CREATE_ANIMAL_MUTATION = gql`
  mutation CreateAnimal($data: AnimalCreateInput!) {
    createAnimal(data: $data) {
      id
      slug
      animal_breed {
        breed
        id
        animal_type {
          id
          name
        }
      }
      logs {
        id
      }
      multimedia {
        id
      }
      name
      user {
        id
      }
    }
  }
`;

export const CREATE_ANIMAL_LOG_MUTATION = gql`
  mutation CreateAnimalLog($data: AnimalLogCreateInput!) {
    createAnimalLog(data: $data) {
      id
      lat
      lng
      animal {
        id
        name
        slug
      }
      notes
      status
      last_seen
      createdAt
    }
  }
`;

export interface CreateAnimalLogVariables {
  data: {
    animal: { connect: { id: string } };
    status: string;
    notes: string;
    lat: string;
    lng: string;
    address: string;
    city: string;
    state: string;
    country: string;
    last_seen: boolean;
    date_status: string;
  };
}

export interface CreateAnimalLogResponse {
  createAnimalLog: {
    id: string;
    lat: string | null;
    lng: string | null;
    animal: {
      id: string;
      name: string;
      slug?: string | null;
    };
    notes: string | null;
    status: string;
    last_seen: boolean | null;
    createdAt: string;
  };
}

export const DELETE_ANIMAL_LOG_MUTATION = gql`
  mutation DeleteAnimalLog($where: AnimalLogWhereUniqueInput!) {
    deleteAnimalLog(where: $where) {
      id
    }
  }
`;

export interface DeleteAnimalLogVariables {
  where: {
    id: string;
  };
}

export interface DeleteAnimalLogResponse {
  deleteAnimalLog: {
    id: string;
  };
}

export const CREATE_ANIMAL_MULTIMEDIA_MUTATION = gql`
  mutation CreateAnimalMultimedias($data: [AnimalMultimediaCreateInput!]!) {
    createAnimalMultimedias(data: $data) {
      animal {
        id
        name
      }
      id
      image {
        url
      }
    }
  }
`;

export const UPDATE_ANIMAL_MUTATION = gql`
  mutation UpdateAnimal($where: AnimalWhereUniqueInput!, $data: AnimalUpdateInput!) {
    updateAnimal(where: $where, data: $data) {
      id
      slug
    }
  }
`;

export const UPDATE_ANIMAL_LOG_MUTATION = gql`
  mutation UpdateAnimalLog($where: AnimalLogWhereUniqueInput!, $data: AnimalLogUpdateInput!) {
    updateAnimalLog(where: $where, data: $data) {
      id
    }
  }
`;

export const UPDATE_ANIMAL_MULTIMEDIAS_MUTATION = gql`
  mutation UpdateAnimalMultimedias($data: [AnimalMultimediaUpdateArgs!]!) {
    updateAnimalMultimedias(data: $data) {
      id
      order
    }
  }
`;

export const DELETE_ANIMAL_MULTIMEDIAS_MUTATION = gql`
  mutation DeleteAnimalMultimedias($where: [AnimalMultimediaWhereUniqueInput!]!) {
    deleteAnimalMultimedias(where: $where) {
      id
    }
  }
`;

export const GET_ANIMAL_QUERY = gql`
  query GetAnimal($where: AnimalWhereUniqueInput!, $orderBy: [AnimalLogOrderByInput!]!) {
    animal(where: $where) {
      slug
      animal_breed {
        id
        breed
        animal_type {
          id
          name
        }
      }
      createdAt
      contactNumber
      contactNumber2
      sourceUrl
      reportedBy
      id
      animal_viewsCount
      duplicateOf {
        id
        slug
      }
      logs (orderBy: $orderBy)  {
        address
        city
        placeLabel
        country
        createdAt
        id
        last_seen
        lat
        lng
        notes
        state
        status
        date_status
      }
      multimedia(orderBy: [{ order: asc }]) {
        id
        order
        image {
          url
        }
      }
      name
      sex
      physical_description
      age
      color
      size
      user {
        id
        name
        email
        phone
        username
        verified
        profileImage {
          url
        }
        secondLastName
        lastName
        createdAt
      }
    }
  }
`;

// Mock data for development
export const MOCK_LOST_ANIMALS = [
  {
    id: '1',
    name: 'Max',
    type: 'perro' as const,
    breed: 'Husky Siberiano',
    status: 'perdido' as const,
    location: 'Ciudad de México, CDMX',
    latitude: 19.4326,
    longitude: -99.1332,
    image: { url: '/images/ss/husky.png' },
    description: 'Perro husky de 3 años, muy amigable. Se perdió en la colonia Roma.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    contactPhone: '+52 55 1234 5678',
    isFavorite: false,
  },
  {
    id: '2',
    name: 'Luna',
    type: 'gato' as const,
    breed: 'Persa',
    status: 'en_adopcion' as const,
    location: 'Guadalajara, Jalisco',
    latitude: 20.6597,
    longitude: -103.3496,
    image: { url: '/images/ss/cat.png' },
    description: 'Gata persa de 2 años, busca hogar amoroso.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    contactEmail: 'luna@example.com',
    isFavorite: false,
  },
  {
    id: '3',
    name: 'Rocky',
    type: 'conejo' as const,
    breed: 'Holandés',
    status: 'perdido' as const,
    location: 'Monterrey, Nuevo León',
    latitude: 25.6866,
    longitude: -100.3161,
    image: { url: '/images/ss/bunny.png' },
    description: 'Conejo pequeño, se perdió en el parque.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    contactPhone: '+52 81 9876 5432',
    isFavorite: false,
  },
  {
    id: '4',
    name: 'Bella',
    type: 'perro' as const,
    breed: 'Labrador',
    status: 'perdido' as const,
    location: 'Puebla, Puebla',
    latitude: 19.0414,
    longitude: -98.2063,
    image: { url: '/images/ss/husky.png' },
    description: 'Labrador dorado, muy juguetón.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    contactPhone: '+52 222 1234 5678',
    isFavorite: false,
  },
  {
    id: '5',
    name: 'Simba',
    type: 'gato' as const,
    breed: 'Maine Coon',
    status: 'en_adopcion' as const,
    location: 'Cancún, Quintana Roo',
    latitude: 21.1619,
    longitude: -86.8515,
    image: { url: '/images/ss/cat.png' },
    description: 'Gato Maine Coon grande y cariñoso.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    contactEmail: 'simba@example.com',
    isFavorite: false,
  },
];

// Animal Comments Queries and Mutations
export const GET_ANIMAL_COMMENTS_QUERY = gql`
  query GetAnimalComments($where: AnimalCommentWhereInput!, $orderBy: [AnimalCommentOrderByInput!]) {
    animalComments(where: $where, orderBy: $orderBy) {
      id
      comment
      kind
      createdAt
      animal {
        id
        name
      }
      user {
        id
        name
        lastName
        secondLastName
        username
        email
        verified
        profileImage {
          url
        }
        createdAt
      }
    }
  }
`;

export interface AnimalCommentUser {
  id: string;
  name: string;
  lastName?: string | null;
  secondLastName?: string | null;
  username: string;
  email?: string | null;
  verified?: boolean | null;
  profileImage?: {
    url: string;
  } | null;
  createdAt: string;
}

export interface AnimalCommentAnimal {
  id: string;
  name: string;
}

/** `duplicate_report`: iba a publicar el mismo animal. `possible_match`: cree que es el de su reporte. */
export type AnimalCommentKind = 'comment' | 'duplicate_report' | 'possible_match';

export interface AnimalComment {
  id: string;
  comment: string;
  kind?: AnimalCommentKind | null;
  animal: AnimalCommentAnimal;
  user: AnimalCommentUser | null;
  createdAt: string;
}

export interface GetAnimalCommentsResponse {
  animalComments: AnimalComment[];
}

export interface GetAnimalCommentsVariables {
  where: {
    animal: {
      id: {
        equals: string;
      };
    };
  };
  orderBy?: Array<{
    createdAt?: 'asc' | 'desc';
  }>;
}

export const CREATE_ANIMAL_COMMENT_MUTATION = gql`
  mutation CreateAnimalComment($data: AnimalCommentCreateInput!) {
    createAnimalComment(data: $data) {
      comment
      createdAt
      id
      user {
        name
      }
    }
  }
`;

export interface CreateAnimalCommentVariables {
  data: {
    comment: string;
    kind?: AnimalCommentKind;
    animal: {
      connect: {
        id: string;
      };
    };
    user: {
      connect: {
        id: string;
      };
    } | null;
  };
}

export interface CreateAnimalCommentResponse {
  createAnimalComment: {
    id: string;
    comment: string;
    createdAt: string;
    user: {
      name: string;
    };
  };
}

export const DELETE_ANIMAL_COMMENT_MUTATION = gql`
  mutation DeleteAnimalComment($where: AnimalCommentWhereUniqueInput!) {
    deleteAnimalComment(where: $where) {
      comment
      createdAt
      id
    }
  }
`;

export interface DeleteAnimalCommentVariables {
  where: {
    id: string;
  };
}

export interface DeleteAnimalCommentResponse {
  deleteAnimalComment: {
    id: string;
    comment: string;
    createdAt: string;
  };
}

/**
 * Reportes parecidos al que se está llenando. `kind: duplicate` es el mismo animal ya reportado;
 * `kind: match` es el otro lado de la historia (perdido ↔ encontrado). `level: likely` es
 * «muy probable» (70+ puntos), `possible` desde 45. Nunca trae teléfonos ni nombres de personas.
 */
export const FIND_ANIMAL_REPORT_DUPLICATES = gql`
  query FindAnimalReportDuplicates(
    $phone: String
    $phone2: String
    $animalTypeId: ID
    $name: String
    $sourceUrl: String
    $lat: Float
    $lng: Float
    $status: String
    $sex: String
    $color: String
    $breedId: ID
    $description: String
    $lostDate: DateTime
    $excludeAnimalId: ID
  ) {
    findAnimalReportDuplicates(
      phone: $phone
      phone2: $phone2
      animalTypeId: $animalTypeId
      name: $name
      sourceUrl: $sourceUrl
      lat: $lat
      lng: $lng
      status: $status
      sex: $sex
      color: $color
      breedId: $breedId
      description: $description
      lostDate: $lostDate
      excludeAnimalId: $excludeAnimalId
    ) {
      id
      name
      slug
      url
      score
      level
      kind
      reasons
      distanceKm
      status
      placeLabel
      city
      reportedAt
      coverUrl
      reportedBy
      isMine
    }
  }
`;

export type SimilarReportKind = 'duplicate' | 'match';
export type SimilarReportReason =
  | 'same_source'
  | 'same_phone'
  | 'same_name'
  | 'similar_name'
  | 'very_close'
  | 'close'
  | 'same_sex'
  | 'same_color'
  | 'same_breed'
  | 'similar_description'
  | 'same_date';

export interface SimilarReport {
  id: string;
  name: string;
  slug: string | null;
  url: string;
  score: number;
  level: 'likely' | 'possible';
  kind: SimilarReportKind;
  reasons: SimilarReportReason[];
  distanceKm: number | null;
  status: string | null;
  placeLabel: string | null;
  city: string | null;
  reportedAt: string | null;
  coverUrl: string | null;
  reportedBy: string | null;
  /** Es un reporte de quien está llenando el formulario. */
  isMine: boolean;
}

export interface FindSimilarReportsVariables {
  phone?: string | null;
  phone2?: string | null;
  animalTypeId?: string | null;
  name?: string | null;
  sourceUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
  status?: string | null;
  sex?: string | null;
  color?: string | null;
  breedId?: string | null;
  description?: string | null;
  lostDate?: string | null;
  excludeAnimalId?: string | null;
}

export interface FindSimilarReportsResponse {
  findAnimalReportDuplicates: SimilarReport[];
}

// Solicitudes para quedarse con un reporte («Es mi mascota»).
export type AnimalClaimStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface AnimalClaim {
  id: string;
  status: AnimalClaimStatus;
  message: string;
  phone?: string | null;
  claimantName?: string | null;
  rejectReason?: string | null;
  createdAt: string;
  evidence?: { url: string } | null;
  claimant?: { id: string } | null;
}

/** El acceso del backend ya filtra: quien reclamó, quien atiende el reporte o un admin. */
export const GET_ANIMAL_CLAIMS_QUERY = gql`
  query GetAnimalClaims($animalId: ID!) {
    animalClaims(
      where: { animal: { id: { equals: $animalId } } }
      orderBy: [{ createdAt: desc }]
    ) {
      id
      status
      message
      phone
      claimantName
      rejectReason
      createdAt
      evidence {
        url
      }
      claimant {
        id
      }
    }
  }
`;

export interface GetAnimalClaimsResponse {
  animalClaims: AnimalClaim[];
}

export const CREATE_ANIMAL_CLAIM_MUTATION = gql`
  mutation CreateAnimalClaim($data: AnimalClaimCreateInput!) {
    createAnimalClaim(data: $data) {
      id
      status
    }
  }
`;

export interface CreateAnimalClaimVariables {
  data: {
    animal: { connect: { id: string } };
    message: string;
    phone: string;
    evidence?: { upload: File };
  };
}

export interface AnimalClaimResult {
  success: boolean;
  message: string;
  animalSlug: string | null;
}

export const RESOLVE_ANIMAL_CLAIM_MUTATION = gql`
  mutation ResolveAnimalClaim($claimId: ID!, $approve: Boolean!, $reason: String) {
    resolveAnimalClaim(claimId: $claimId, approve: $approve, reason: $reason) {
      success
      message
      animalSlug
    }
  }
`;

export const CANCEL_ANIMAL_CLAIM_MUTATION = gql`
  mutation CancelAnimalClaim($claimId: ID!) {
    cancelAnimalClaim(claimId: $claimId) {
      success
      message
      animalSlug
    }
  }
`;

export const CREATE_ANIMAL_VIEW_MUTATION = gql`
  mutation CreateAnimalView($data: AnimalViewCreateInput!) {
    createAnimalView(data: $data) {
      id
      animal {
        id
      }
      user {
        id
      }
    }
  }
`;

export interface CreateAnimalViewVariables {
  data: {
    animal: {
      connect: {
        id: string;
      };
    };
    user: {
      connect: {
        id: string;
      };
    } | null;
  };
}

export interface CreateAnimalViewResponse {
  createAnimalView: {
    id: string;
    animal: {
      id: string;
    };
    user: {
      id: string;
    } | null;
  };
}
