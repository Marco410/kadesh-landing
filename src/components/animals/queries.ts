import { gql } from '@apollo/client';

// TODO: Replace with actual GraphQL query when backend is ready
// For now, we'll use mock data structure
export const GET_ANIMALS_QUERY = gql`
  query GetAnimals($skip: Int!, $take: Int, $orderBy: [AnimalOrderByInput!]!, $where: AnimalWhereInput!) {
    animals(skip: $skip, take: $take, orderBy: $orderBy, where: $where) {
      name
      id
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
      multimedia {
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
        name
      }
      notes
      status
      last_seen
      createdAt
    }
  }
`;

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
