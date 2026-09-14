"use client";

import { useEffect, useState } from 'react';
import { AnimalFilters as FiltersType, AnimalType } from './types';
import AnimalTypeSelector from './nuevo/AnimalTypeSelector';
import {
  DIRECTORY_STATUS_MORE,
  DIRECTORY_STATUS_PRIMARY,
  getStatusColor,
} from './constants';
import { useChipPulse, useRevealChips } from './useChipMotion';

interface AnimalFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: Partial<FiltersType>) => void;
  onClearFilters: () => void;
}

function StatusChip({
  value,
  label,
  selected,
  onSelect,
  more,
}: {
  value: string | null;
  label: string;
  selected: boolean;
  onSelect: (value: string | null) => void;
  more?: boolean;
}) {
  const color = value ? getStatusColor(value) : undefined;
  const { ref, pulse } = useChipPulse();

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      data-more-chip={more ? '' : undefined}
      onClick={() => {
        pulse();
        onSelect(selected ? null : value);
      }}
      className={`inline-flex min-h-9 origin-center items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
        selected
          ? 'text-white shadow-[0_8px_18px_rgba(15,35,80,0.18)]'
          : 'bg-[#f3f5f8] text-[#3a3a3a] hover:bg-kadesh-50 dark:bg-night dark:text-[#d0d0d0] dark:hover:bg-kadesh/20'
      }`}
      style={
        selected && color
          ? { backgroundColor: color }
          : selected
            ? { backgroundColor: 'var(--color-kadesh)' }
            : undefined
      }
    >
      {color && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: selected ? '#ffffff' : color }}
          aria-hidden
        />
      )}
      {label}
    </button>
  );
}

export default function AnimalFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: AnimalFiltersProps) {
  const isMoreStatus = DIRECTORY_STATUS_MORE.some(
    (item) => item.value === filters.status
  );
  const [showMore, setShowMore] = useState(isMoreStatus);
  const statusRowRef = useRevealChips(showMore);
  const { ref: moreToggleRef, pulse: pulseMoreToggle } = useChipPulse();

  useEffect(() => {
    if (isMoreStatus) setShowMore(true);
  }, [isMoreStatus]);

  const hasActiveFilters = Boolean(filters.type || filters.status);
  const selectedStatus = filters.status ?? null;

  const selectStatus = (value: string | null) => {
    onFiltersChange({ status: value });
  };

  return (
    <div className="space-y-3">
      <div
        ref={statusRowRef}
        role="group"
        aria-label="Qué buscas"
        className="flex flex-wrap gap-1.5"
      >
        <StatusChip
          value={null}
          label="Todos"
          selected={!selectedStatus}
          onSelect={selectStatus}
        />
        {DIRECTORY_STATUS_PRIMARY.map((status) => (
          <StatusChip
            key={status.value}
            value={status.value}
            label={status.label}
            selected={selectedStatus === status.value}
            onSelect={selectStatus}
          />
        ))}
        {DIRECTORY_STATUS_MORE.map((status) => (
          <StatusChip
            key={status.value}
            value={status.value}
            label={status.label}
            selected={selectedStatus === status.value}
            onSelect={selectStatus}
            more
          />
        ))}
        <button
          ref={moreToggleRef}
          type="button"
          aria-expanded={showMore}
          onClick={() => {
            pulseMoreToggle();
            setShowMore((open) => !open);
          }}
          className="inline-flex min-h-9 origin-center items-center rounded-full px-3 text-sm font-semibold text-kadesh hover:bg-kadesh-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:hover:bg-kadesh/20"
        >
          {showMore ? 'Menos' : 'Más'}
        </button>
      </div>

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
