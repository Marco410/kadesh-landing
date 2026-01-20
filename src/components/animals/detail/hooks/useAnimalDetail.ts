"use client";

import { useQuery } from '@apollo/client';
import { GET_ANIMAL_QUERY } from '../../queries';

export interface AnimalDetail {
  id: string;
  name: string;
  sex?: string | null;
  physical_description?: string | null;
  age?: string | null;
  color?: string | null;
  size?: string | null;
  createdAt: string;
  animal_breed: {
    breed: string;
    animal_type: {
      name: string;
    };
  };
  multimedia: Array<{
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
    date_status?: string | null;
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
    id: string;
  };
}

export function useAnimalDetail(animalId: string) {
  const { data, loading, error, refetch } = useQuery<GetAnimalQueryResponse, GetAnimalQueryVariables>(
    GET_ANIMAL_QUERY,
    {
      variables: {
        where: {
          id: animalId,
        },
      },
      fetchPolicy: 'cache-and-network',
      skip: !animalId,
    }
  );

  const animal = data?.animal || null;
  
  // Sort logs by createdAt descending (most recent first)
  const sortedLogs = animal?.logs
    ? [...animal.logs].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
    : [];

  return {
    animal,
    logs: sortedLogs,
    loading,
    error,
    refetch,
  };
}



