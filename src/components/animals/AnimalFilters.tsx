'use client';

import { AnimalFilters as FiltersType, AnimalType } from './types';
import AnimalTypeSelector from './nuevo/AnimalTypeSelector';
import StatusChips from './StatusChips';

interface AnimalFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: Partial<FiltersType>) => void;
  onClearFilters: () => void;
}

export default function AnimalFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: AnimalFiltersProps) {
  const hasActiveFilters = Boolean(filters.type || filters.status);

  return (
    <div className="space-y-3">
      <StatusChips
        value={filters.status ?? null}
        onChange={(status) => onFiltersChange({ status })}
        includeAll
      />

      <div role="group" aria-label="Tipo de animal">
        <AnimalTypeSelector
          selectedTypeId=""
          selectedValue={filters.type ?? ''}
          onTypeChange={(typeValue) =>
            onFiltersChange({
              type: filters.type === typeValue ? null : (typeValue as AnimalType),
            })
          }
          variant="compact"
          required={false}
        />
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs font-semibold text-kadesh hover:text-kadesh-600"
        >
          Quitar filtros
        </button>
      )}
    </div>
  );
}
