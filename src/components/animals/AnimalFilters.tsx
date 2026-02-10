"use client";

import { useState } from 'react';
import { AnimalFilters as FiltersType, AnimalType } from './types';
import AnimalTypeSelector from './nuevo/AnimalTypeSelector';
import { ANIMAL_LOGS_OPTIONS, ANIMAL_TYPE_LABELS } from './constants';

interface AnimalFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: Partial<FiltersType>) => void;
  onClearFilters: () => void;
}


export default function AnimalFilters({ filters, onFiltersChange, onClearFilters }: AnimalFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = 
    filters.type || 
    filters.breed || 
    filters.status || 
    filters.location || 
    filters.favoritesOnly;

  const activeFiltersCount = [
    filters.type,
    filters.breed,
    filters.status,
    filters.location,
    filters.favoritesOnly,
  ].filter(Boolean).length;

  return (
    <div className="bg-transparent">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm font-medium text-[#212121] dark:text-[#ffffff] hover:text-orange-500 dark:hover:text-orange-400 flex items-center gap-2"
        >
          <svg 
            className={`w-4 h-4 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Filtros
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-orange-500 text-white text-xs font-semibold">
              {activeFiltersCount}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-orange-500 hover:text-orange-600 font-medium"
          >
            Limpiar
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {/* Tipo de Animal */}
          <div>
            <label className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
              Tipo
            </label>
            <AnimalTypeSelector
              selectedTypeId=""
              selectedValue={filters.type || undefined}
              onTypeChange={(typeValue) => 
                onFiltersChange({ 
                  type: filters.type === typeValue ? null : (typeValue as AnimalType)
                })
              }
              variant="compact"
              required={false}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
              Estatus
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ANIMAL_LOGS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  onClick={() => 
                    onFiltersChange({ 
                      status: filters.status === status.value ? null : status.value 
                    })
                  }
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    filters.status === status.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#212121] dark:text-[#ffffff] hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a]'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Raza */}
          <div>
            <label htmlFor="breed-filter" className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
              Raza
            </label>
            <input
              id="breed-filter"
              type="text"
              placeholder="Buscar raza..."
              value={filters.breed || ''}
              onChange={(e) => onFiltersChange({ breed: e.target.value || null })}
              className="w-full px-3 py-1.5 text-sm rounded-md border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
            />
          </div>

          {/* Ubicación */}
          <div>
            <label htmlFor="location-filter" className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
              Ubicación
            </label>
            <input
              id="location-filter"
              type="text"
              placeholder="Buscar por calle, ciudad, estado o país..."
              value={filters.location || ''}
              onChange={(e) => onFiltersChange({ location: e.target.value || null })}
              className="w-full px-3 py-1.5 text-sm rounded-md border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
            />
          </div>

          {/* Favoritos */}
          <div className="flex items-center gap-2">
            <input
              id="favorites-filter"
              type="checkbox"
              checked={filters.favoritesOnly || false}
              onChange={(e) => onFiltersChange({ favoritesOnly: e.target.checked || undefined })}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
            />
            <label htmlFor="favorites-filter" className="text-xs font-medium text-[#212121] dark:text-[#ffffff]">
              Solo favoritos
            </label>
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters && !isExpanded && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {filters.type && (
            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
              { ANIMAL_TYPE_LABELS[filters.type] || filters.type } 
            </span>
          )}
          {filters.status && (
            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
              {ANIMAL_LOGS_OPTIONS.find(s => s.value === filters.status)?.label}
            </span>
          )}
          {filters.breed && (
            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium truncate max-w-[120px]">
              {filters.breed}
            </span>
          )}
          {filters.location && (
            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium truncate max-w-[120px]">
              {filters.location}
            </span>
          )}
          {filters.favoritesOnly && (
            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
              ⭐
            </span>
          )}
        </div>
      )}
    </div>
  );
}
