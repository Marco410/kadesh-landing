'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AnimalFilters as FiltersType, AnimalType } from './types';
import AnimalTypeSelector from './nuevo/AnimalTypeSelector';
import StatusChips from './StatusChips';
import { useUiMotion } from 'kadesh/components/shared/motion';

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
  const motionPrefs = useUiMotion();

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

      <AnimatePresence initial={false}>
        {hasActiveFilters ? (
          <motion.button
            key="clear-filters"
            type="button"
            onClick={onClearFilters}
            variants={motionPrefs.expand}
            initial={motionPrefs.expand ? 'hidden' : false}
            animate="show"
            exit="exit"
            whileTap={motionPrefs.tap}
            className="inline-flex min-h-11 items-center overflow-hidden text-sm font-semibold text-kadesh hover:text-kadesh-600"
          >
            Quitar filtros
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
