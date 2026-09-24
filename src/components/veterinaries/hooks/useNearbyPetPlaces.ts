"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_NEARBY_PET_PLACES } from "../queries";
import type {
  PetPlace,
  NearbyPetPlacesInput,
  PetPlaceWhereInput,
} from "../types";
import {
  DEFAULT_RADIUS_VETERINARIES,
  FETCH_LIMIT_VETERINARIES,
  VETERINARIES_PER_PAGE,
} from "kadesh/constants/constans";

const WHERE_VETERINARY: PetPlaceWhereInput = {
  types: { some: { value: { equals: "veterinary" } } },
};

function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

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
  userLocation?: { lat: number | null; lng: number | null },
  limit?: number,
  radiusKm?: number,
  options?: { openNow?: boolean; query?: string; verifiedOnly?: boolean },
) {
  const openNow = Boolean(options?.openNow);
  const verifiedOnly = Boolean(options?.verifiedOnly);
  const query = normalizeText(options?.query);
  const [currentPage, setCurrentPage] = useState(1);

  const input = useMemo<NearbyPetPlacesInput | null>(() => {
    if (userLocation === undefined) return null;
    return {
      lat: userLocation.lat,
      lng: userLocation.lng,
      radius: radiusKm ?? DEFAULT_RADIUS_VETERINARIES,
      limit: limit ?? FETCH_LIMIT_VETERINARIES,
      type: "veterinary",
    };
  }, [userLocation, limit, radiusKm]);

  const { data, loading } = useQuery<
    GetNearbyPetPlacesQueryResult,
    GetNearbyPetPlacesQueryVariables
  >(GET_NEARBY_PET_PLACES, {
    variables: input ? { input, where: WHERE_VETERINARY } : undefined,
    skip: !input,
  });

  const nearbyPlaces = useMemo(() => {
    const list = data?.getNearbyPetPlaces?.petPlaces ?? [];
    return Array.isArray(list) ? list : [];
  }, [data]);

  const openCount = useMemo(
    () => nearbyPlaces.filter((place) => place.isOpen === true).length,
    [nearbyPlaces],
  );

  const verifiedCount = useMemo(
    () => nearbyPlaces.filter((place) => Boolean(place.verified)).length,
    [nearbyPlaces],
  );

  const filteredPlaces = useMemo(() => {
    const terms = query.split(/\s+/).filter(Boolean);
    return nearbyPlaces.filter((place) => {
      if (openNow && place.isOpen !== true) return false;
      if (verifiedOnly && !place.verified) return false;
      if (!terms.length) return true;
      const haystack = normalizeText(place.name);
      return terms.every((term) => haystack.includes(term));
    });
  }, [nearbyPlaces, openNow, verifiedOnly, query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [openNow, radiusKm, verifiedOnly, query]);

  const totalPlaces = filteredPlaces.length;
  const nearbyCount = nearbyPlaces.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalPlaces / VETERINARIES_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPlaces = useMemo(() => {
    const start = (safePage - 1) * VETERINARIES_PER_PAGE;
    return filteredPlaces.slice(start, start + VETERINARIES_PER_PAGE);
  }, [filteredPlaces, safePage]);

  const goToPage = (page: number) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
  };

  const nextPage = () => {
    if (safePage < totalPages) setCurrentPage((p) => p + 1);
  };

  const previousPage = () => {
    if (safePage > 1) setCurrentPage((p) => p - 1);
  };

  return {
    places: paginatedPlaces,
    allPlaces: filteredPlaces,
    nearbyCount,
    openCount,
    verifiedCount,
    loading,
    currentPage: safePage,
    totalPages,
    totalPlaces,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
    hasLocation:
      !!userLocation && userLocation.lat != null && userLocation.lng != null,
  };
}
