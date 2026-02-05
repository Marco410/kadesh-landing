"use client";

import { AnimalDetail } from './hooks/useAnimalDetail';
import { getStatusLabel, getStatusColor, ANIMAL_TYPE_LABELS, ANIMAL_TYPE_ICONS } from '../constants';
import { formatDate } from 'kadesh/utils/format-date';
import { UserInfo } from 'kadesh/components/shared';

interface AnimalInfoSectionProps {
  animal: AnimalDetail;
}

export default function AnimalInfoSection({ animal }: AnimalInfoSectionProps) {
  const lastLog = animal.logs && animal.logs.length > 0 ? animal.logs[0] : null;
  const statusColor = getStatusColor(lastLog?.status || 'register');
  const statusLabel = getStatusLabel(lastLog?.status || 'register');

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-row items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mb-3">{animal.name || 'Sin nombre'}</h1>
          <span className="text-3xl">{ANIMAL_TYPE_ICONS[animal.animal_breed.animal_type.name]}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm"
            style={{ backgroundColor: statusColor }}
          >
            {statusLabel}
          </span>
          <span className="text-[#616161] dark:text-[#b0b0b0] text-xs">
            Registrado {formatDate(animal.createdAt)}
          </span>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">

        <div className="flex flex-row gap-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-[#616161] dark:text-[#b0b0b0] uppercase tracking-wide mb-1">Tipo de Animal</h3>
                <p className="text-[#212121] dark:text-[#ffffff] font-medium">{ANIMAL_TYPE_LABELS[animal.animal_breed.animal_type.name]}</p>
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-[#616161] dark:text-[#b0b0b0] uppercase tracking-wide mb-1">Raza</h3>
                <p className="text-[#212121] dark:text-[#ffffff] font-medium">{animal.animal_breed.breed}</p>
              </div>
            </div>
          </div>

          {animal.sex && (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-[#616161] dark:text-[#b0b0b0] uppercase tracking-wide mb-1">Sexo</h3>
                <p className="text-[#212121] dark:text-[#ffffff] font-medium">
                  {animal.sex === 'male' ? 'Macho' : animal.sex === 'female' ? 'Hembra' : 'Desconocido'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* New Fields: Age, Color, Size */}
        {(animal.age || animal.color || animal.size) && (
          <div className="pt-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
            <div className="flex flex-row gap-10">
              {animal.age && (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-[#616161] dark:text-[#b0b0b0] uppercase tracking-wide mb-1">Edad</h3>
                    <p className="text-[#212121] dark:text-[#ffffff] font-medium">{animal.age}</p>
                  </div>
                </div>
              )}
              {animal.color && (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-[#616161] dark:text-[#b0b0b0] uppercase tracking-wide mb-1">Color</h3>
                    <p className="text-[#212121] dark:text-[#ffffff] font-medium">{animal.color}</p>
                  </div>
                </div>
              )}
              {animal.size && (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-[#616161] dark:text-[#b0b0b0] uppercase tracking-wide mb-1">Tamaño</h3>
                    <p className="text-[#212121] dark:text-[#ffffff] font-medium">{animal.size}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Physical Description */}
        {animal.physical_description && (
          <div className="pt-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-[#616161] dark:text-[#b0b0b0] uppercase tracking-wide mb-1">Descripción Física</h3>
                <p className="text-[#212121] dark:text-[#ffffff] font-medium leading-relaxed">{animal.physical_description}</p>
              </div>
            </div>
          </div>
        )}

        <UserInfo user={animal.user} label="Reportado por" />
      </div>
    </div>
  );
}



