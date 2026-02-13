"use client";

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  Call02Icon,
  MapPinIcon,
  PinLocation03Icon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import type { PetPlace } from './types';

type CardVariant = 'vertical' | 'horizontal';

interface VeterinaryCardProps {
  place: PetPlace;
  isSelected?: boolean;
  onClick?: () => void;
  isDarkMode?: boolean;
  /** Layout: vertical (default) for list, horizontal for home section */
  variant?: CardVariant;
  /** When set, card renders as a link (e.g. to /veterinarias) instead of a button */
  href?: string;
}

function formatDistance(distance: number | null | undefined): string | null {
  if (distance == null || Number.isNaN(distance)) return null;
  return distance < 1
    ? `${Math.round(distance * 1000)} m de ti`
    : `${distance.toFixed(1)} km de ti`;
}

function averageRating(reviews: { rating: number | null }[]): number | null {
  const withRating = reviews.filter((r) => r.rating != null && !Number.isNaN(r.rating)) as { rating: number }[];
  if (withRating.length === 0) return null;
  const sum = withRating.reduce((s, r) => s + r.rating, 0);
  return Math.round((sum / withRating.length) * 10) / 10; // 1 decimal
}

export default function VeterinaryCard({
  place,
  isSelected,
  onClick,
  variant = 'vertical',
  href,
}: VeterinaryCardProps) {
  const displayName = place.name?.trim() || 'Veterinaria';
  const initial = (displayName[0] ?? 'V').toUpperCase();
  const distanceStr = formatDistance(place.distance ?? undefined);
  const locationLine = [place.municipality, place.state, place.country].filter(Boolean).join(', ') || place.address || place.street;
  const rating =
    place.averageRating != null && !Number.isNaN(place.averageRating)
      ? place.averageRating
      : averageRating(place.pet_place_reviews ?? []);
  const reviewsCount = place.reviewsCount ?? (place.pet_place_reviews?.length ?? 0);
  const isHorizontal = variant === 'horizontal';
  const serviceTags = (place.services ?? []).filter((s) => s.name).slice(0, 2).map((s) => s.name!);
  const showServices = !isHorizontal && serviceTags.length > 0;

  const baseClass = `w-full h-full text-left rounded-xl border-2 transition-all flex flex-col ${
    isSelected
      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-500'
      : 'border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] hover:border-orange-300 dark:hover:border-orange-600'
  }`;
  const sizeClass = isHorizontal
    ? 'min-h-[160px] p-6 rounded-2xl shadow-lg hover:shadow-xl gap-3'
    : 'min-h-[160px] sm:min-h-[140px] p-4 gap-3';

  const rowSpacing = 'mb-1.5';
  const detailHref = Routes.veterinaries.detail(place.id);

  const mainContent = (
    <>
      <div className={`flex gap-3 sm:gap-4 flex-1 min-w-0 ${isHorizontal ? 'flex-row' : ''}`}>
        <span
          className={`flex-shrink-0 rounded-full flex items-center justify-center bg-orange-500 text-white font-bold ${
            isHorizontal ? 'w-16 h-16 text-2xl' : 'w-12 h-12 sm:w-10 sm:h-10 text-base sm:text-sm'
          }`}
          aria-hidden
        >
          {initial}
        </span>
        <span className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-1 overflow-hidden">
          <h3
            className={`font-bold text-[#212121] dark:text-white line-clamp-2 sm:truncate ${isHorizontal ? 'text-xl' : 'text-sm sm:text-base'}`}
            title={displayName}
          >
            {displayName}
          </h3>
          {distanceStr && (
            <p className={`text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1.5 shrink-0 ${rowSpacing}`}>
              <HugeiconsIcon icon={PinLocation03Icon} size={12} className="flex-shrink-0 text-orange-500 dark:text-orange-400" strokeWidth={1.5} />
              <span className="truncate">{distanceStr}</span>
            </p>
          )}
          {(rating != null || reviewsCount > 0) && (
            <p className={`text-xs text-[#212121] dark:text-white flex items-center gap-1.5 shrink-0 ${rowSpacing}`}>
              <HugeiconsIcon icon={StarIcon} size={12} className="flex-shrink-0 text-amber-500" strokeWidth={1.5} />
              {rating != null && <span>{rating.toFixed(1)}</span>}
              {reviewsCount > 0 && (
                <span className="text-[#616161] dark:text-[#b0b0b0]">
                  {rating != null ? ` · ${reviewsCount} reseña${reviewsCount !== 1 ? 's' : ''}` : `${reviewsCount} reseña${reviewsCount !== 1 ? 's' : ''}`}
                </span>
              )}
            </p>
          )}
          {place.phone && (
            <a
              href={`tel:${place.phone.replace(/\s/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className={`text-xs text-blue-600 dark:text-blue-400 truncate hover:underline flex items-center gap-1.5 min-w-0 ${rowSpacing}`}
              title={place.phone}
            >
              <HugeiconsIcon icon={Call02Icon} size={12} className="flex-shrink-0 text-blue-500 dark:text-blue-400" strokeWidth={1.5} />
              <span className="truncate">{place.phone}</span>
            </a>
          )}
          {locationLine && (
            <p
              className={`text-xs text-[#616161] dark:text-[#b0b0b0] flex items-start gap-1.5 min-w-0 ${rowSpacing}`}
              title={locationLine}
            >
              <HugeiconsIcon icon={MapPinIcon} size={12} className="flex-shrink-0 mt-0.5 text-orange-500 dark:text-orange-400" strokeWidth={1.5} />
              <span className="line-clamp-2 break-words">{locationLine}</span>
            </p>
          )}
          {place.isOpen != null && (
            <span
              className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full w-fit shrink-0 ${
                place.isOpen
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {place.isOpen ? 'Abierto' : 'Cerrado'}
            </span>
          )}
        </span>
      </div>
      {showServices && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {serviceTags.map((name) => (
            <span
              key={name}
              className="inline-block text-xs font-medium px-2 py-0.5 rounded-md bg-orange-500 text-white"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </>
  );

  const detailsButton = (
    <Link
      href={detailHref}
      onClick={(e) => e.stopPropagation()}
      className={`mt-auto w-full inline-flex items-center justify-center gap-1.5 font-semibold text-sm rounded-lg py-2.5 sm:py-2 px-3 transition-colors min-h-[44px] sm:min-h-0 ${
        isHorizontal
          ? 'bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600'
          : 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50'
      }`}
    >
      Ver detalles
      <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="flex-shrink-0" strokeWidth={2} />
    </Link>
  );

  const className = `${baseClass} ${sizeClass}`.trim();

  if (href) {
    return (
      <div className={className}>
        <Link href={href} className="block flex-1 min-h-0 min-w-0" aria-label={`Ver ${displayName} en el directorio`}>
          {mainContent}
        </Link>
        {detailsButton}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={className}
    >
      {mainContent}
      {detailsButton}
    </div>
  );
}
