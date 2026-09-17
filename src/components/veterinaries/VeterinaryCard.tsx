'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  Call02Icon,
  MapPinIcon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import { veterinaryDetailHref } from './petPlaceSlug';
import VerifiedBadge from './VerifiedBadge';
import PetPlaceLikesMeta, { petPlaceLikesCount } from './PetPlaceLikesMeta';
import type { PetPlace } from './types';

interface VeterinaryCardProps {
  place: PetPlace;
  isSelected?: boolean;
  onClick?: () => void;
}

function formatDistance(distance: number | null | undefined): string | null {
  if (distance == null || Number.isNaN(distance)) return null;
  return distance < 1
    ? `${Math.round(distance * 1000)} m de ti`
    : `${distance.toFixed(1)} km de ti`;
}

function averageRating(reviews: { rating: number | null }[]): number | null {
  const withRating = reviews.filter(
    (review): review is { rating: number } =>
      review.rating != null && !Number.isNaN(review.rating)
  );
  if (withRating.length === 0) return null;
  const sum = withRating.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / withRating.length) * 10) / 10;
}

function VetPin({ selected }: { selected?: boolean }) {
  return (
    <span
      className={`flex h-11 w-9 flex-shrink-0 items-end justify-center ${
        selected ? 'scale-110' : ''
      }`}
      aria-hidden
    >
      <svg viewBox="0 0 36 44" className="h-11 w-9">
        <path
          fill="var(--color-kadesh)"
          stroke="#ffffff"
          strokeWidth="2"
          d="M18 2C10.82 2 5 7.82 5 15c0 9.75 13 25.5 13 25.5S31 24.75 31 15C31 7.82 25.18 2 18 2z"
        />
        <path fill="#ffffff" d="M13 10h10v2h-4v8h-2v-8h-4z" />
      </svg>
    </span>
  );
}

export default function VeterinaryCard({
  place,
  isSelected,
  onClick,
}: VeterinaryCardProps) {
  const displayName = place.name?.trim() || 'Veterinaria';
  const distanceStr = formatDistance(place.distance ?? undefined);
  const locationLine =
    [place.municipality, place.state, place.country].filter(Boolean).join(', ') ||
    place.address ||
    place.street;
  const rating =
    place.averageRating != null && !Number.isNaN(place.averageRating)
      ? place.averageRating
      : averageRating(place.pet_place_reviews ?? []);
  const reviewsCount = place.reviewsCount ?? place.pet_place_reviews?.length ?? 0;
  const likesCount = petPlaceLikesCount(place);
  const detailHref = veterinaryDetailHref(place);
  const phoneHref = place.phone ? `tel:${place.phone.replace(/\s/g, '')}` : null;

  return (
    <article
      id={`veterinary-${place.id}`}
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
        aria-label={`Mostrar ${displayName} en el mapa`}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick?.();
          }
        }}
        className="flex w-full cursor-pointer gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
      >
        <VetPin selected={isSelected} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="flex min-w-0 items-start gap-1.5 text-base font-bold leading-tight text-[#121212] dark:text-white">
              <span className="line-clamp-2">{displayName}</span>
              {place.verified ? <VerifiedBadge size={16} /> : null}
            </h3>
            {place.isOpen != null && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                  place.isOpen
                    ? 'bg-green-600 text-white'
                    : 'bg-[#3a3a3a] text-white'
                }`}
              >
                {place.isOpen ? 'Abierto' : 'Cerrado'}
              </span>
            )}
          </div>

          {distanceStr && (
            <p className="mt-1 text-sm font-semibold text-kadesh">{distanceStr}</p>
          )}

          {(rating != null || reviewsCount > 0 || likesCount > 0) && (
            <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-[#121212] dark:text-white">
              {(rating != null || reviewsCount > 0) && (
                <span className="inline-flex items-center gap-1.5">
                  <HugeiconsIcon
                    icon={StarIcon}
                    size={14}
                    className="flex-shrink-0 text-amber-500"
                    strokeWidth={1.5}
                  />
                  {rating != null && (
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                  )}
                  {reviewsCount > 0 && (
                    <span className="text-[#5a5a5a] dark:text-[#b0b0b0]">
                      {rating != null
                        ? `· ${reviewsCount} reseña${reviewsCount !== 1 ? 's' : ''}`
                        : `${reviewsCount} reseña${reviewsCount !== 1 ? 's' : ''}`}
                    </span>
                  )}
                </span>
              )}
              <PetPlaceLikesMeta count={likesCount} />
            </p>
          )}

          {locationLine && (
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
              <HugeiconsIcon
                icon={MapPinIcon}
                size={14}
                className="mt-0.5 flex-shrink-0 text-kadesh"
                strokeWidth={1.5}
              />
              <span className="line-clamp-2 leading-relaxed">{locationLine}</span>
            </p>
          )}
        </div>
      </div>

      <div className={`mt-3 grid gap-2 ${phoneHref ? 'grid-cols-[auto_1fr]' : 'grid-cols-1'}`}>
        {phoneHref && (
          <a
            href={phoneHref}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Llamar a ${displayName}`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-kadesh px-3 text-kadesh transition-colors hover:bg-kadesh hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
          >
            <HugeiconsIcon icon={Call02Icon} size={18} strokeWidth={1.5} />
          </a>
        )}
        <Link
          href={detailHref}
          onClick={(event) => event.stopPropagation()}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
        >
          Ver ficha
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
        </Link>
      </div>
    </article>
  );
}
