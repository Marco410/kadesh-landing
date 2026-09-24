"use client";

import { useQuery } from '@apollo/client';
import { GET_ANIMAL_QUERY } from '../../queries';
import { sortMultimediaByOrder } from 'kadesh/components/animals/sortMultimedia';
import { isAnimalKeystoneId } from 'kadesh/components/animals/animalSlug';

export interface AnimalDetail {
  id: string;
  slug?: string | null;
  name: string;
  sex?: string | null;
  physical_description?: string | null;
  age?: string | null;
  color?: string | null;
  size?: string | null;
  createdAt: string;
  contactNumber?: string | null;
  animal_breed: {
    id?: string;
    breed: string;
    animal_type: {
      id?: string;
      name: string;
    };
  };
  multimedia: Array<{
    id?: string;
    order?: number | null;
    image: {
      url: string;
    };
  }>;
  logs: Array<{
    id: string;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    state?: string | null;
    createdAt: string;
    last_seen?: string | null;
    lat?: number | null;
    lng?: number | null;
    notes?: string | null;
    status: string;
    date_status?: string;
  }>;
  user: {
    id: string;
    createdAt: string;
    name: string;
    lastName?: string | null;
    secondLastName?: string | null;
    username: string;
    email?: string | null;
    phone?: string | null;
    verified?: boolean | null;
    profileImage?: {
      url: string;
    } | null;
  };
}

interface GetAnimalQueryResponse {
  animal: AnimalDetail | null;
}

interface GetAnimalQueryVariables {
  where: {
    id?: string;
    slug?: string;
  };
  orderBy: Array<{
    date_status?: 'asc' | 'desc';
  }>;
}

export function useAnimalDetail(animalKey: string) {
  const { data, loading, error, refetch } = useQuery<GetAnimalQueryResponse, GetAnimalQueryVariables>(
    GET_ANIMAL_QUERY,
    {
      variables: {
        where: isAnimalKeystoneId(animalKey)
          ? { id: animalKey }
          : { slug: animalKey },
        orderBy: [
          {
            date_status: 'desc',
          },
        ],
      },
      fetchPolicy: 'cache-and-network',
      skip: !animalKey,
    }
  );

  const raw = data?.animal || null;
  const animal = raw
    ? { ...raw, multimedia: sortMultimediaByOrder(raw.multimedia) }
    : null;
  
/*   // Sort logs by createdAt descending (most recent first)
  const sortedLogs = animal?.logs
    ? [...animal.logs].sort((a, b) => {
        const dateA = new Date(a.date_status || '').getTime();
        const dateB = new Date(b.date_status || '').getTime();
        return dateB - dateA;
      })
    : [];
 */
  return {
    animal,
    logs: animal?.logs,  
    contactNumber: animal?.contactNumber,
    loading,
    error,
    refetch,
  };
}



