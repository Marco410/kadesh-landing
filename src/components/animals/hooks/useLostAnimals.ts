"use client";

import { useState, useMemo } from 'react';
import { MOCK_LOST_ANIMALS } from '../queries';
import { LostAnimal, AnimalFilters } from '../types';

const DEFAULT_ANIMALS_PER_PAGE = 12;

export function useLostAnimals(initialFilters?: AnimalFilters, animalsPerPage?: number) {
  const ANIMALS_PER_PAGE = animalsPerPage || DEFAULT_ANIMALS_PER_PAGE;
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<AnimalFilters>(initialFilters || {});

  // Filter animals based on current filters
  const filteredAnimals = useMemo(() => {
    let result = [...MOCK_LOST_ANIMALS] as LostAnimal[];

    if (filters.type) {
      result = result.filter(animal => animal.type === filters.type);
    }

    if (filters.breed) {
      result = result.filter(animal => 
        animal.breed?.toLowerCase().includes(filters.breed!.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter(animal => animal.status === filters.status);
    }

    if (filters.location) {
      result = result.filter(animal => 
        animal.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.favoritesOnly) {
      result = result.filter(animal => animal.isFavorite);
    }

    return result;
  }, [filters]);

  // Pagination
  const totalAnimals = filteredAnimals.length;
  const totalPages = Math.ceil(totalAnimals / ANIMALS_PER_PAGE);
  const startIndex = (currentPage - 1) * ANIMALS_PER_PAGE;
  const endIndex = startIndex + ANIMALS_PER_PAGE;
  const paginatedAnimals = filteredAnimals.slice(startIndex, endIndex);

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
    allAnimals: filteredAnimals, // For map markers
    loading: false,
    error: null,
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
