"use client";

import { useQuery } from '@apollo/client';
import { ANIMAL_TYPE_ICONS, ANIMAL_TYPE_LABELS } from 'kadesh/components/animals/constants';
import { GET_ANIMAL_TYPES_QUERY } from '../queries';

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

export default function AnimalTypeSelector({
  selectedTypeId,
  onTypeChange,
  required = true,
  variant = 'default',
  selectedValue,
}: AnimalTypeSelectorProps) {

  const { data: animalTypesData, loading: loadingTypes, error } = useQuery(GET_ANIMAL_TYPES_QUERY, {
    variables: { orderBy: [{ order: "asc" }] },
    fetchPolicy: 'cache-and-network',
  });

  const isCompact = variant === 'compact';
  const isSelected = (type: AnimalType) => {
    if (selectedValue !== undefined) {
      const typeValue = type.name?.toLowerCase() || '';
      return selectedValue === typeValue;
    }
    return selectedTypeId === type.id;
  };

  const handleChange = (type: AnimalType) => {
    if (selectedValue !== undefined) {
      const typeValue = type.name?.toLowerCase() || '';
      onTypeChange(typeValue);
    } else {
      onTypeChange(type.id);
    }
  };

  if (isCompact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {animalTypesData?.animalTypes?.map((type:AnimalType) => {
          const typeValue = type.name?.toLowerCase() || '';
          const typeLabel = ANIMAL_TYPE_LABELS[typeValue] || type.name;
          const emojiIcon = ANIMAL_TYPE_ICONS[typeValue] || "🐾";
          const iconUrl = type.icon?.url || "";
          const selected = isSelected(type);

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => handleChange(type)}
              disabled={loadingTypes}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                selected
                  ? 'bg-orange-500 text-white'
                  : 'bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#212121] dark:text-[#ffffff] hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a]'
              }`}
            >
              {iconUrl ? (
                <img 
                  src={iconUrl} 
                  alt={typeLabel}
                  className="w-3.5 h-3.5 object-contain"
                />
              ) : (
                <span className="text-sm">{emojiIcon}</span>
              )}
              <span>{typeLabel}</span>
            </button>
          );
        })}
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
