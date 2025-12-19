"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_NEARBY_ANIMALS_QUERY, GET_ANIMAL_TYPES_QUERY } from '../queries';
import { LostAnimal, AnimalFilters, AnimalType } from '../types';

const DEFAULT_ANIMALS_PER_PAGE = 12;
const DEFAULT_RADIUS = 50; // Default radius in km

// Interface matching the new getNearbyAnimals response
interface NearbyAnimal {
  id: string;
  name: string;
  distance: number | null;
  sex: string;
  lat: string;
  lng: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  status: string;
  animal_breed: {
    id: string;
    breed: string;
  } | null;
  animal_type: {
    id: string;
    name: string;
  } | null;
  user: {
    name: string;
    profileImage: {
      url: string;
    } | null;
  } | null;
  createdAt: string;
  multimedia: Array<{
    id: string;
    url: string;
  }>;
}

// Transform nearby animal to LostAnimal format
function transformAnimal(animal: NearbyAnimal): LostAnimal {
  // Build location string from available address components
  const locationParts = [];
  if (animal.address) locationParts.push(animal.address);
  if (animal.city) locationParts.push(animal.city);
  if (animal.state) locationParts.push(animal.state);
  if (animal.country) locationParts.push(animal.country);
  
  const location = locationParts.length > 0 
    ? locationParts.join(', ')
    : animal.lat && animal.lng 
      ? `${animal.lat}, ${animal.lng}` 
      : 'Ubicación no disponible';

  // Get first image from multimedia
  const image = animal.multimedia?.[0];

  // Map animal type name to AnimalType (convert to lowercase and handle mapping)
  const typeName = animal.animal_type?.name?.toLowerCase() || '';
  const typeMap: Record<string, AnimalType> = {
    'dog': 'perro',
    'cat': 'gato',
    'rabbit': 'conejo',
    'bird': 'ave',
  };
  const mappedType = typeMap[typeName] || (typeName as AnimalType) || 'otro';

  return {
    id: animal.id,
    name: animal.name,
    type: mappedType,
    breed: animal.animal_breed?.breed || '',
    status: animal.status,
    location,
    latitude: animal.lat ? parseFloat(animal.lat) : undefined,
    longitude: animal.lng ? parseFloat(animal.lng) : undefined,
    distance: animal.distance || 0.01,
    image: image ? { url: image.url } : undefined,
    description: '', // Not available in new response
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

  // Map Spanish type names to English database values (for animalType ID lookup)
  const typeNameMap: Record<string, string> = {
    'perro': 'dog',
    'gato': 'cat',
    'ave': 'bird',
    'conejo': 'rabbit',
    'otro': 'other',
  };

  // Build input for getNearbyAnimals query
  const queryInput = useMemo(() => {
    const input: any = {
      limit: 500, // Get enough for client-side filtering and pagination
      skip: 0,
    };

    // Add location and radius if provided
    if (userLocation) {
      input.lat = userLocation.lat;
      input.lng = userLocation.lng;
      input.radius = DEFAULT_RADIUS;
    }

    // Filter by animal type - need to find the ID from animalTypesData
    // If we can't find the ID, we'll filter client-side
    if (filters.type && animalTypesData?.animalTypes) {
      const dbTypeName = typeNameMap[filters.type] || filters.type;
      const animalType = animalTypesData.animalTypes.find(
        (at: any) => at.name?.toLowerCase() === dbTypeName.toLowerCase()
      );
      if (animalType?.id) {
        input.animalType = animalType.id;
      }
      // Note: If ID not found, we'll filter client-side in transformedAnimals
    }

    // Filter by status
    if (filters.status) {
      input.status = filters.status;
    }

    // Filter by breed - need breed ID, but we'll filter client-side for now
    // TODO: If you have a way to get breed ID from breed name, add it here

    // Filter by city, state, country from location filter
    if (filters.location) {
      // Try to parse location - could be city, state, or country
      const locationLower = filters.location.toLowerCase();
      // Simple heuristic: if it's a short string, assume city
      if (locationLower.length < 20) {
        input.city = filters.location;
      }
    }

    return input;
  }, [filters, userLocation, animalTypesData, ANIMALS_PER_PAGE]);

  // Query animals using getNearbyAnimals
  const { data, loading, error } = useQuery(GET_NEARBY_ANIMALS_QUERY, {
    variables: {
      input: queryInput,
    },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all', // Return partial data even if there are errors
  });

  // Transform and filter animals
  const transformedAnimals = useMemo(() => {
    if (!data?.getNearbyAnimals?.animals) return [];

    let animals = (data.getNearbyAnimals.animals as NearbyAnimal[]).map(transformAnimal);

    // Filter out animals without coordinates (shouldn't happen with new query, but safety check)
    animals = animals.filter((animal: LostAnimal) => 
      animal.latitude !== undefined && animal.longitude !== undefined
    );

    // Client-side filtering for location text search (more flexible than server-side)
    if (filters.location) {
      animals = animals.filter((animal: LostAnimal) =>
        animal.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Filter by name (client-side)
    if (filters.name) {
      animals = animals.filter((animal: LostAnimal) =>
        animal.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }

    // Filter by breed (client-side)
    if (filters.breed) {
      animals = animals.filter((animal: LostAnimal) =>
        animal.breed?.toLowerCase().includes(filters.breed!.toLowerCase())
      );
    }

    // Filter by type (client-side if not filtered server-side or if ID not found)
    if (filters.type) {
      const dbTypeName = typeNameMap[filters.type] || filters.type;
      animals = animals.filter((animal: LostAnimal) => {
        // Map the animal type back to compare
        const animalTypeMap: Record<string, string> = {
          'perro': 'dog',
          'gato': 'cat',
          'conejo': 'rabbit',
          'ave': 'bird',
        };
        const animalDbType = animalTypeMap[animal.type] || animal.type;
        return animalDbType.toLowerCase() === dbTypeName.toLowerCase();
      });
    }

    // Filter favorites if needed
    if (filters.favoritesOnly) {
      animals = animals.filter((animal: LostAnimal) => animal.isFavorite);
    }

    // Distance is already calculated by the server, so no need to recalculate
    // Animals are already sorted by distance if lat/lng provided

    return animals;
  }, [data, filters]);

  // For map, we need all animals (not paginated)
  // Reuse the main query data if it has enough animals, otherwise use a separate query
  const needsSeparateMapQuery = useMemo(() => {
    // If we have data and it has animals, check if we need more for the map
    if (data?.getNearbyAnimals?.animals) {
      const animalCount = data.getNearbyAnimals.animals.length;
      // If we got less than the limit, we have all animals, so reuse
      return animalCount >= (queryInput.limit || 500);
    }
    return true; // Need to fetch if no data
  }, [data, queryInput.limit]);

  const { data: allAnimalsData } = useQuery(GET_NEARBY_ANIMALS_QUERY, {
    variables: {
      input: {
        ...queryInput,
        limit: 1000, // Large limit for map
        skip: 0,
      },
    },
    fetchPolicy: 'cache-and-network',
    skip: !needsSeparateMapQuery, // Only fetch if we need more animals for map
  });

  const allAnimals = useMemo(() => {
    // If we don't need a separate query, use the main data
    if (!needsSeparateMapQuery && data?.getNearbyAnimals?.animals) {
      return (data.getNearbyAnimals.animals as NearbyAnimal[]).map(transformAnimal);
    }
    // Otherwise use the allAnimals query
    if (!allAnimalsData?.getNearbyAnimals?.animals) return [];
    return (allAnimalsData.getNearbyAnimals.animals as NearbyAnimal[]).map(transformAnimal);
  }, [needsSeparateMapQuery, data, allAnimalsData]);

  // Calculate pagination
  // Use the count of transformed animals (after client-side filters) for accurate pagination
  const totalAnimals = transformedAnimals.length;
  const totalPages = Math.ceil(totalAnimals / ANIMALS_PER_PAGE);
  
  // Paginate client-side (since we get all matching animals and filter client-side)
  const paginatedAnimals = transformedAnimals.slice(
    (currentPage - 1) * ANIMALS_PER_PAGE, 
    currentPage * ANIMALS_PER_PAGE
  );

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
    console.log('newFilters', newFilters);
    console.log('filters', filters);
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
