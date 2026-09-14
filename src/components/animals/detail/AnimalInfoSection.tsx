"use client";

import { AnimalDetail } from './hooks/useAnimalDetail';
import { ANIMAL_TYPE_LABELS } from '../constants';
import { TypeGlyph } from '../TypeGlyph';
import { formatDate } from 'kadesh/utils/format-date';
import Avatar from 'kadesh/components/shared/Avatar';

interface AnimalInfoSectionProps {
  animal: AnimalDetail;
}

function Fact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">{label}</dt>
      <dd className="mt-0.5 font-semibold text-[#121212] dark:text-[#eef1f6]">{value}</dd>
    </div>
  );
}

function sexLabel(sex?: string | null) {
  if (sex === 'male') return 'Macho';
  if (sex === 'female') return 'Hembra';
  if (sex === 'unknown') return 'No se sabe';
  return null;
}

export default function AnimalInfoSection({ animal }: AnimalInfoSectionProps) {
  const typeName = animal.animal_breed?.animal_type?.name || '';
  const typeLabel = ANIMAL_TYPE_LABELS[typeName] || typeName;

  return (
    <div className="flex h-full flex-col gap-5">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        {typeLabel ? (
          <div className="flex items-start gap-2">
            <TypeGlyph type={typeName} className="mt-1 h-5 w-5 text-kadesh" />
            <div>
              <dt className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">Tipo</dt>
              <dd className="mt-0.5 font-semibold text-[#121212] dark:text-[#eef1f6]">
                {typeLabel}
              </dd>
            </div>
          </div>
        ) : null}
        <Fact label="Raza" value={animal.animal_breed?.breed} />
        <Fact label="Sexo" value={sexLabel(animal.sex)} />
        <Fact label="Edad" value={animal.age} />
        <Fact label="Color" value={animal.color} />
        <Fact label="Tamaño" value={animal.size} />
      </dl>

      {animal.physical_description ? (
        <div>
          <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">Señas particulares</p>
          <p className="mt-1 leading-relaxed text-[#121212] dark:text-[#eef1f6]">
            {animal.physical_description}
          </p>
        </div>
      ) : null}

      <div className="mt-auto flex items-center gap-3 border-t border-[#ececec] pt-4 dark:border-white/10">
        <Avatar
          author={{
            id: animal.user.username || '',
            name: animal.user.name,
            lastName: animal.user.lastName || '',
            username: animal.user.username,
            verified: animal.user.verified || false,
            profileImage: animal.user.profileImage,
            createdAt: animal.user.createdAt,
          }}
          verify={animal.user.verified || false}
        />
        <div className="min-w-0">
          <p className="truncate font-semibold text-[#121212] dark:text-[#eef1f6]">
            {animal.user.name} {animal.user.lastName || ''}
          </p>
          <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            Publicado {formatDate(animal.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
