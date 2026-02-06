"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_NEARBY_PET_PLACES } from '../queries';
import type { PetPlace, NearbyPetPlacesInput, PetPlaceWhereInput } from '../types';
import { DEFAULT_RADIUS_VETERINARIES, FETCH_LIMIT_VETERINARIES, VETERINARIES_PER_PAGE } from 'kadesh/constants/constans';


const WHERE_VETERINARY: PetPlaceWhereInput = {
  types: { some: { value: { equals: 'veterinary' } } },
};

export interface GetNearbyPetPlacesQueryResult {
  getNearbyPetPlaces?: {
    message?: string | null;
    success?: boolean | null;
    petPlaces?: PetPlace[] | null;
  } | null;
  petPlacesCount?: number | null;
}

export interface GetNearbyPetPlacesQueryVariables {
  input: NearbyPetPlacesInput;
  where: PetPlaceWhereInput;
}

export function useNearbyPetPlaces(
  userLocation?: { lat: number; lng: number },
  limit?: number
) {
  const [currentPage, setCurrentPage] = useState(1);

  const input = useMemo<NearbyPetPlacesInput | null>(() => {
    if (!userLocation) return null;
    return {
      lat: userLocation.lat,
      lng: userLocation.lng,
      radius: DEFAULT_RADIUS_VETERINARIES,
      limit: limit ?? FETCH_LIMIT_VETERINARIES,
      type: 'veterinary',
    };
  }, [userLocation, limit]);

  const { data, loading } = useQuery<
    GetNearbyPetPlacesQueryResult,
    GetNearbyPetPlacesQueryVariables
  >(GET_NEARBY_PET_PLACES, {
    variables: input ? { input, where: WHERE_VETERINARY } : undefined,
    skip: !input,
  });

  const petPlaces = useMemo(() => {
    const list = data?.getNearbyPetPlaces?.petPlaces ?? [];
    return Array.isArray(list) ? list : [];
  }, [data]);

  const totalPlaces = petPlaces.length;
  const totalPages = Math.max(1, Math.ceil(totalPlaces / VETERINARIES_PER_PAGE));
  const paginatedPlaces = useMemo(() => {
    const start = (currentPage - 1) * VETERINARIES_PER_PAGE;
    return petPlaces.slice(start, start + VETERINARIES_PER_PAGE);
  }, [petPlaces, currentPage]);

  const goToPage = (page: number) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const previousPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  return {
    places: paginatedPlaces,
    allPlaces: petPlaces,
    loading,
    currentPage,
    totalPages,
    totalPlaces,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    hasLocation: !!userLocation,
  };
}
