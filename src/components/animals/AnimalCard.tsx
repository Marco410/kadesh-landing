"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LostAnimal } from './types';
import { formatDate } from 'kadesh/utils/format-date';
import { animalDetailHref } from 'kadesh/components/animals/animalSlug';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  Image01Icon,
  Location01Icon,
  MapsLocation01Icon,
} from '@hugeicons/core-free-icons';
import { getStatusColor, getStatusLabel, getTypeLabel } from './constants';

interface AnimalCardProps {
  animal: LostAnimal;
  index?: number;
  onFavoriteToggle?: (animal: LostAnimal) => void;
  isSelected?: boolean;
  onClick?: () => void;
  variant?: 'vertical' | 'horizontal';
  isDarkMode?: boolean;
}

function formatDistance(distance: number | null | undefined): string | null {
  if (distance == null || Number.isNaN(distance)) return null;
  return distance < 1
    ? `${Math.round(distance * 1000)} m de ti`
    : `${distance.toFixed(1)} km de ti`;
}

export default function AnimalCard({
  animal,
  index = 0,
  onFavoriteToggle,
  isSelected = false,
  onClick,
  variant = 'vertical',
}: AnimalCardProps) {
  const distanceStr = formatDistance(animal.distance);
  const detailHref = animalDetailHref(animal);

  if (variant === 'horizontal') {
    return (
      <article
        id={`animal-${animal.id}`}
        className={`flex flex-col rounded-2xl border p-4 transition-[border-color,box-shadow,background-color,transform] duration-150 ${
          isSelected
            ? 'border-kadesh bg-kadesh-50 shadow-[0_10px_28px_rgba(15,35,80,0.12)] dark:border-kadesh dark:bg-kadesh/15'
            : 'border-[#ececec] bg-white hover:-translate-y-0.5 hover:border-kadesh-300 hover:shadow-[0_10px_24px_rgba(15,35,80,0.08)] dark:border-white/10 dark:bg-night dark:hover:border-kadesh/40'
        }`}
      >
        <div
          role="button"
          tabIndex={0}
          aria-pressed={isSelected}
          aria-label={`Mostrar a ${animal.name} en el mapa`}
          onClick={onClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onClick?.();
            }
          }}
          className="flex w-full gap-3 text-left"
        >
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#e8edf3] dark:bg-[#2a3548]">
            {animal.image?.url ? (
              <Image
                src={animal.image.url}
                alt=""
                fill
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[#5a5a5a]">
                <HugeiconsIcon icon={Image01Icon} size={22} strokeWidth={1.5} />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-base font-bold leading-tight text-[#121212] dark:text-white">
                {animal.name}
              </h3>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: getStatusColor(animal.status) }}
              >
                {getStatusLabel(animal.status)}
              </span>
            </div>

            <p className="mt-1 truncate text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
              {getTypeLabel(animal.type)}
              {animal.breed ? ` · ${animal.breed}` : ''}
            </p>

            {distanceStr && (
              <p className="mt-1 text-sm font-semibold text-kadesh">{distanceStr}</p>
            )}

            {animal.location && (
              <p className="mt-1.5 flex items-start gap-1.5 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
                <HugeiconsIcon
                  icon={Location01Icon}
                  size={14}
                  className="mt-0.5 flex-shrink-0 text-kadesh"
                  strokeWidth={1.5}
                />
                <span className="line-clamp-2 leading-relaxed">{animal.location}</span>
              </p>
            )}
          </div>
        </div>

        <Link
          href={detailHref}
          onClick={(event) => event.stopPropagation()}
          className="mt-3 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
        >
          Ver ficha
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
        </Link>
      </article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="flex flex-col overflow-hidden rounded-xl border border-transparent bg-white shadow-[0_10px_24px_rgba(15,35,80,0.08)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(15,35,80,0.12)] dark:border-white/10 dark:bg-night-raised"
    >
      <div className="relative w-full bg-[#e8edf3] dark:bg-[#2a3548]">
        {animal.image?.url ? (
          <Image
            src={animal.image.url}
            alt={animal.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center text-[#5a5a5a]">
            <HugeiconsIcon icon={Image01Icon} size={40} strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute top-4 right-4 flex gap-2">
          <div
            className="rounded-full px-3 py-1 text-sm font-semibold text-white"
            style={{ backgroundColor: getStatusColor(animal.status) }}
          >
            {getStatusLabel(animal.status)}
          </div>
          {onFavoriteToggle && (
            <button
              type="button"
              onClick={() => onFavoriteToggle(animal)}
              className={`rounded-full bg-white/90 p-2 backdrop-blur-sm transition-all dark:bg-night/90 ${
                animal.isFavorite ? 'text-red-500' : 'text-[#5a5a5a]'
              }`}
            >
              <HugeiconsIcon icon={MapsLocation01Icon} size={18} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 text-2xl font-bold text-[#121212] dark:text-white">
          {animal.name}
        </h3>

        <div className="mb-4 space-y-2 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
          <p>
            <span className="font-medium">Tipo:</span>{' '}
            {getTypeLabel(animal.type)}
            {animal.breed && ` · ${animal.breed}`}
          </p>
          <p className="flex items-center gap-2">
            <HugeiconsIcon icon={Location01Icon} size={16} className="text-kadesh" strokeWidth={1.5} />
            {animal.location}
          </p>
          <p>{formatDate(animal.createdAt)}</p>
        </div>

        {animal.description && (
          <p className="mb-4 line-clamp-2 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
            {animal.description}
          </p>
        )}

        <div className="mt-auto border-t border-[#ececec] pt-4 dark:border-white/10">
          <Link
            href={detailHref}
            className="block w-full rounded-xl bg-kadesh px-4 py-2 text-center font-semibold text-white transition-colors hover:bg-kadesh-600"
          >
            Ver ficha
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
