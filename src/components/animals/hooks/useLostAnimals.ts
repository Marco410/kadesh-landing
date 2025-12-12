"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ANIMALS_QUERY, GET_ANIMALS_COUNT_QUERY, GET_ANIMAL_TYPES_QUERY } from '../queries';
import { LostAnimal, AnimalFilters, AnimalType } from '../types';

const DEFAULT_ANIMALS_PER_PAGE = 12;

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface DatabaseAnimal {
  id: string;
  name: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    lastName: string;
    username: string;
  };
  animal_breed?: {
    breed: string;
    animal_type?: {
      name: string;
    };
  };
  logs?: Array<{
    id: string;
    last_seen: boolean;
    lat: string | null;
    lng: string | null;
    notes: string | null;
    status: string;
    createdAt: string;
  }>;
  multimedia?: Array<{
    image?: {
      url: string;
    };
  }>;
}

// Transform database animal to LostAnimal format
function transformAnimal(animal: DatabaseAnimal): LostAnimal {
  // Get the most recent log with coordinates
  const lastLog = animal.logs
    ?.filter((log) => log.lat && log.lng)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  // Get the most recent log for status
  const statusLog = animal.logs
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  // Get first image from multimedia
  const image = animal.multimedia?.[0]?.image;

  // Use status directly from database (no mapping needed)
  // Database values: register, adopted, abandoned, rescued, in_family, lost, found
  return {
    id: animal.id,
    name: animal.name,
    type: (animal.animal_breed?.animal_type?.name || '').toLowerCase() as AnimalType,
    breed: animal.animal_breed?.breed || '',
    status: (statusLog?.status || 'register'),
    location: lastLog?.lat && lastLog?.lng 
      ? `${lastLog.lat}, ${lastLog.lng}` 
      : 'Ubicación no disponible',
    latitude: lastLog?.lat ? parseFloat(lastLog.lat) : undefined,
    longitude: lastLog?.lng ? parseFloat(lastLog.lng) : undefined,
    image: image ? { url: image.url } : undefined,
    description: statusLog?.notes || '',
    createdAt: animal.createdAt,
    isFavorite: false, // TODO: Implement favorites
  };
}

export function useLostAnimals(
  initialFilters?: AnimalFilters, 
  animalsPerPage?: number,
  userLocation?: { lat: number; lng: number }
) {
  const ANIMALS_PER_PAGE = animalsPerPage || DEFAULT_ANIMALS_PER_PAGE;
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<AnimalFilters>(initialFilters || {});

  // Get animal types to map Spanish names to English database values
  const { data: animalTypesData } = useQuery(GET_ANIMAL_TYPES_QUERY, {
    variables: { orderBy: [{ order: "asc" }] },
  });

  // Map Spanish type names to English database values
  const typeNameMap: Record<string, string> = {
    'perro': 'dog',
    'gato': 'cat',
    'ave': 'bird',
    'conejo': 'rabbit',
    'otro': 'other',
  };

  // Build where clause for GraphQL query
  const whereClause = useMemo(() => {
    const where: any = {};

    // Filter by animal type - map Spanish to English and use name
    if (filters.type) {
      const dbTypeName = typeNameMap[filters.type] || filters.type;
      where.animal_type = {
        name: {
          equals: dbTypeName,
        },
      };
    }

    // Filter by breed
    if (filters.breed) {
      where.animal_breed = {
        breed: {
          contains: filters.breed,
        },
      };
    }

    // Filter by status (from logs)
    // Note: We'll filter for coordinates client-side to avoid Prisma errors
    if (filters.status) {
      // Use status directly (no mapping needed - filters already use database values)
      where.logs = {
        some: {
          status: {
            equals: filters.status,
          },
        },
      };
    }

    // Filter by name
    if (filters.name) {
      where.name = {
        contains: filters.name,
      };
    }

    return where;
  }, [filters]);

  // Build orderBy clause
  const orderBy = useMemo(() => {
    // Default: order by createdAt descending (newest first)
    return [{ createdAt: 'desc' as const }];
  }, []);

  // If sorting by distance, we need all animals first
  // Otherwise, use server-side pagination
  const shouldGetAll = !!userLocation;
  const skip = shouldGetAll ? 0 : (currentPage - 1) * ANIMALS_PER_PAGE;
  const take = shouldGetAll ? null : ANIMALS_PER_PAGE;

  // Query animals from database
  const { data, loading, error } = useQuery(GET_ANIMALS_QUERY, {
    variables: {
      skip,
      take,
      orderBy,
      where: whereClause,
    },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all', // Return partial data even if there are errors
  });

  // Transform and filter animals
  const transformedAnimals = useMemo(() => {
    if (!data?.animals) return [];

    let animals = (data.animals as DatabaseAnimal[]).map(transformAnimal);

    // Filter out animals without coordinates (client-side)
    animals = animals.filter((animal: LostAnimal) => 
      animal.latitude !== undefined && animal.longitude !== undefined
    );

    // Client-side filtering for location text search
    if (filters.location) {
      animals = animals.filter((animal: LostAnimal) =>
        animal.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Filter favorites if needed
    if (filters.favoritesOnly) {
      animals = animals.filter((animal: LostAnimal) => animal.isFavorite);
    }

    // Sort by distance if user location is provided (prioritize closest)
    if (userLocation) {
      animals = animals
        .map((animal: LostAnimal) => ({
          ...animal,
          distance: animal.latitude && animal.longitude
            ? calculateDistance(
                userLocation.lat,
                userLocation.lng,
                animal.latitude,
                animal.longitude
              )
            : Infinity,
        }))
        .sort((a: LostAnimal & { distance?: number }, b: LostAnimal & { distance?: number }) => 
          (a.distance || Infinity) - (b.distance || Infinity)
        );
    }

    return animals;
  }, [data, filters, userLocation]);

  // For map, we need all animals (not paginated)
  // Reuse the same query if we already got all animals, otherwise make a separate query
  const { data: allAnimalsData } = useQuery(GET_ANIMALS_QUERY, {
    variables: {
      skip: 0,
      take: null, // Get all for map
      orderBy,
      where: whereClause,
    },
    fetchPolicy: 'cache-and-network',
    skip: shouldGetAll, // Skip if we already have all animals from main query
  });

  const allAnimals = useMemo(() => {
    // If we got all animals in main query, use those
    if (shouldGetAll && data?.animals) {
      return (data.animals as DatabaseAnimal[]).map(transformAnimal);
    }
    // Otherwise use the allAnimals query
    if (!allAnimalsData?.animals) return [];
    return (allAnimalsData.animals as DatabaseAnimal[]).map(transformAnimal);
  }, [data, allAnimalsData, shouldGetAll]);

  // Get total count for accurate pagination
  const { data: countData } = useQuery(GET_ANIMALS_COUNT_QUERY, {
    variables: {
      where: whereClause,
    },
    fetchPolicy: 'cache-and-network',
    skip: shouldGetAll, // Skip if we're getting all animals (we can count client-side)
  });

  // Calculate pagination
  // If sorting by distance, we need to paginate client-side and use client count
  // Otherwise, use server count
  const totalAnimals = shouldGetAll 
    ? transformedAnimals.length 
    : (countData?.animalsCount || transformedAnimals.length);
  const totalPages = Math.ceil(totalAnimals / ANIMALS_PER_PAGE);
  
  // Paginate based on whether we sorted by distance
  const paginatedAnimals = shouldGetAll
    ? transformedAnimals.slice((currentPage - 1) * ANIMALS_PER_PAGE, currentPage * ANIMALS_PER_PAGE)
    : transformedAnimals;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const updateFilters = (newFilters: Partial<AnimalFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  return {
    animals: paginatedAnimals,
    allAnimals, // For map markers
    loading,
    error: error?.message || null,
    currentPage,
    totalPages,
    totalAnimals,
    goToPage,
    nextPage,
    previousPage,
    updateFilters,
    clearFilters,
    filters,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}
