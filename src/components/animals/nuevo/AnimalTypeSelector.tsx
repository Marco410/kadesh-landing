"use client";

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { ANIMAL_TYPE_ICONS, ANIMAL_TYPE_LABELS } from 'kadesh/components/animals/constants';
import { GET_ANIMAL_TYPES_QUERY } from '../queries';
import { TypeGlyph, isPrimaryDirectoryType } from '../TypeGlyph';
import { useChipPulse, useRevealChips } from '../useChipMotion';

interface AnimalType {
  id: string;
  name: string;
  icon?: {
    url: string;
  } | null;
}

interface AnimalTypeSelectorProps {
  selectedTypeId: string;
  onTypeChange: (typeId: string) => void;
  required?: boolean;
  variant?: 'default' | 'compact';
  selectedValue?: string;
}

function TypeChip({
  label,
  typeName,
  iconUrl,
  selected,
  disabled,
  onClick,
  more,
}: {
  label: string;
  typeName: string;
  iconUrl: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  more?: boolean;
}) {
  const { ref, pulse } = useChipPulse();

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      data-more-chip={more ? '' : undefined}
      onClick={() => {
        pulse();
        onClick();
      }}
      disabled={disabled}
      className={`inline-flex min-h-9 origin-center items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-[background-color,border-color,color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh disabled:opacity-50 ${
        selected
          ? 'border-kadesh bg-kadesh text-white'
          : 'border-[#d8dee8] bg-transparent text-[#3a3a3a] hover:border-kadesh/50 hover:bg-kadesh-50 dark:border-white/18 dark:text-[#e8edf4] dark:hover:border-kadesh/50 dark:hover:bg-kadesh/15'
      }`}
    >
      {iconUrl ? (
        <img src={iconUrl} alt="" className="h-4 w-4 object-contain" />
      ) : (
        <TypeGlyph type={typeName} />
      )}
      {label}
    </button>
  );
}

export default function AnimalTypeSelector({
  selectedTypeId,
  onTypeChange,
  required = true,
  variant = 'default',
  selectedValue,
}: AnimalTypeSelectorProps) {
  const { data: animalTypesData, loading: loadingTypes } = useQuery(GET_ANIMAL_TYPES_QUERY, {
    variables: { orderBy: [{ order: 'asc' }] },
    fetchPolicy: 'cache-and-network',
  });

  const types: AnimalType[] = animalTypesData?.animalTypes ?? [];
  const isCompact = variant === 'compact';
  const selectedKey = (selectedValue ?? selectedTypeId ?? '').toLowerCase();
  const isSelected = (type: AnimalType) => {
    const name = (type.name || '').toLowerCase();
    if (isCompact) {
      return selectedKey === name || selectedKey === type.id;
    }
    return selectedTypeId === type.id;
  };

  const handleChange = (type: AnimalType) => {
    if (isCompact) {
      onTypeChange((type.name || '').toLowerCase());
      return;
    }
    onTypeChange(type.id);
  };

  const selectedIsSecondary = types.some(
    (type) => isSelected(type) && !isPrimaryDirectoryType(type.name || '')
  );
  const [showMoreTypes, setShowMoreTypes] = useState(selectedIsSecondary);
  const typeRowRef = useRevealChips(showMoreTypes);
  const { ref: moreToggleRef, pulse: pulseMoreToggle } = useChipPulse();

  useEffect(() => {
    if (selectedIsSecondary) setShowMoreTypes(true);
  }, [selectedIsSecondary]);

  if (isCompact) {
    const primary = types.filter((type) => isPrimaryDirectoryType(type.name || ''));
    const secondary = types.filter((type) => !isPrimaryDirectoryType(type.name || ''));
    const shownPrimary = primary.length ? primary : types;
    const extra = primary.length ? secondary : [];

    const renderChip = (type: AnimalType, more?: boolean) => {
      const typeValue = type.name?.toLowerCase() || '';
      const typeLabel = ANIMAL_TYPE_LABELS[typeValue] || type.name;
      return (
        <TypeChip
          key={type.id}
          label={typeLabel}
          typeName={typeValue}
          iconUrl={type.icon?.url || ''}
          selected={isSelected(type)}
          disabled={loadingTypes}
          more={more}
          onClick={() => handleChange(type)}
        />
      );
    };

    return (
      <div ref={typeRowRef} className="flex flex-wrap gap-1.5">
        {shownPrimary.map((type) => renderChip(type))}
        {extra.map((type) => renderChip(type, true))}
        {extra.length > 0 && (
          <button
            ref={moreToggleRef}
            type="button"
            aria-expanded={showMoreTypes}
            onClick={() => {
              pulseMoreToggle();
              setShowMoreTypes((open) => !open);
            }}
            className="inline-flex min-h-9 origin-center items-center rounded-full px-3 text-sm font-semibold text-kadesh hover:bg-kadesh-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:hover:bg-kadesh/20"
          >
            {showMoreTypes ? 'Menos' : 'Más'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#212121] dark:text-[#ffffff] mb-2">
        Tipo de Animal {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-4">
        {animalTypesData?.animalTypes?.map((type:AnimalType) => {
          // Obtener el label en español basado en el value (name) que viene del backend
          const typeValue = type.name?.toLowerCase() || '';
          const typeLabel = ANIMAL_TYPE_LABELS[typeValue] || type.name;
          const emojiIcon = ANIMAL_TYPE_ICONS[typeValue] || "🐾";
          const iconUrl = type.icon?.url || "";

          return (
            <label
              key={type.id}
              className={`
                flex flex-col items-center justify-center px-5 py-3 rounded-xl
                cursor-pointer transition border-2
                ${selectedTypeId === type.id 
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/40"
                    : "border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212]"
                }
                w-28 hover:shadow-md
              `}
            >
              {/* Icon (image or emoji) */}
              {iconUrl ? (
                <img 
                  src={iconUrl} 
                  alt={typeLabel}
                  className="w-10 h-10 mb-2 object-contain"
                />
              ) : (
                <span className="text-3xl mb-2">{emojiIcon}</span>
              )}
              <span className="text-sm font-semibold text-[#212121] dark:text-[#ffffff]">
                {typeLabel}
              </span>
              <input
                type="radio"
                name="animalType"
                value={type.id}
                checked={selectedTypeId === type.id}
                onChange={() => onTypeChange(type.id)}
                required={required}
                disabled={loadingTypes}
                className="sr-only"
                aria-label={typeLabel}
              />
            </label>
          );
        })}
      </div>
      {!selectedTypeId && required && (
        <p className="text-red-500 text-xs mt-2">Selecciona un tipo</p>
      )}
    </div>
  );
}
