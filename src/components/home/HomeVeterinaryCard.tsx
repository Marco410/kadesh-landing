'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  Call02Icon,
  MapPinIcon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import type { PetPlace } from 'kadesh/components/veterinaries/types';

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

function seedFromId(id: string): number {
  let hash = 0;
  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function MiniMap({ seed }: { seed: number }) {
  const pinX = 38 + (seed % 28);
  const pinY = 34 + ((seed >> 5) % 24);
  const shiftX = -((seed >> 3) % 12);
  const shiftY = -((seed >> 7) % 10);

  return (
    <div className="relative h-36 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 400 220"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        style={{ transform: `translate(${shiftX}px, ${shiftY}px) scale(1.12)` }}
      >
        <rect width="400" height="220" className="fill-[#eef3f8] dark:fill-[#1a2433]" />
        <rect x="0" y="48" width="400" height="16" className="fill-white dark:fill-[#2a3548]" />
        <rect x="0" y="118" width="400" height="20" className="fill-white dark:fill-[#2a3548]" />
        <rect x="0" y="178" width="400" height="14" className="fill-white dark:fill-[#2a3548]" />
        <rect x="64" y="0" width="16" height="220" className="fill-white dark:fill-[#2a3548]" />
        <rect x="176" y="0" width="22" height="220" className="fill-white dark:fill-[#2a3548]" />
        <rect x="292" y="0" width="16" height="220" className="fill-white dark:fill-[#2a3548]" />
        <rect
          x="92"
          y="70"
          width="70"
          height="42"
          rx="8"
          className="fill-[#d5e4d8] dark:fill-[#1e3a2a]"
        />
        <rect
          x="210"
          y="144"
          width="64"
          height="28"
          rx="8"
          className="fill-[#dbe6f4] dark:fill-[#1c2d48]"
        />
      </svg>

      <span
        className="absolute z-10 -translate-x-1/2 -translate-y-full drop-shadow-[0_8px_16px_rgba(15,35,80,0.28)] transition-transform duration-300 group-hover:-translate-y-[110%]"
        style={{ left: `${pinX}%`, top: `${pinY}%` }}
      >
        <svg viewBox="0 0 36 44" className="h-10 w-8">
          <path
            fill="var(--color-kadesh)"
            stroke="#ffffff"
            strokeWidth="2"
            d="M18 2C10.82 2 5 7.82 5 15c0 9.75 13 25.5 13 25.5S31 24.75 31 15C31 7.82 25.18 2 18 2z"
          />
          <path fill="#ffffff" d="M13 10h10v2h-4v8h-2v-8h-4z" />
        </svg>
      </span>
    </div>
  );
}

export default function HomeVeterinaryCard({ place }: { place: PetPlace }) {
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
  const serviceTags = (place.services ?? [])
    .filter((service) => service.name && service.active !== false)
    .slice(0, 2)
    .map((service) => service.name as string);
  const detailHref = Routes.veterinaries.detail(place.id);
  const phoneHref = place.phone ? `tel:${place.phone.replace(/\s/g, '')}` : null;

  return (
    <article
      data-vet-card
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,35,80,0.1)] dark:border-white/10 dark:bg-night-raised"
    >
      <Link
        href={detailHref}
        className="flex flex-1 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
      >
        <div className="relative">
          <MiniMap seed={seedFromId(place.id)} />

          {place.isOpen != null && (
            <span
              className={`absolute top-3 right-3 z-10 rounded-full px-3 py-1 text-xs font-bold shadow-md ${
                place.isOpen
                  ? 'bg-green-600 text-white'
                  : 'bg-[#3a3a3a] text-white'
              }`}
            >
              {place.isOpen ? 'Abierto' : 'Cerrado'}
            </span>
          )}

          {distanceStr && (
            <span className="absolute bottom-3 left-3 z-10 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-kadesh shadow-[0_6px_16px_rgba(15,35,80,0.12)] dark:bg-night dark:text-kadesh-300">
              {distanceStr}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5 pb-4">
          <h3 className="mb-3 line-clamp-2 text-xl font-bold leading-tight text-[#121212] dark:text-white">
            {displayName}
          </h3>

          <div className="flex-1 space-y-2 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
            {(rating != null || reviewsCount > 0) && (
              <p className="flex items-center gap-1.5 text-[#121212] dark:text-white">
                <HugeiconsIcon
                  icon={StarIcon}
                  size={16}
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
              </p>
            )}

            {locationLine && (
              <p className="flex items-start gap-2">
                <HugeiconsIcon
                  icon={MapPinIcon}
                  size={16}
                  className="mt-0.5 flex-shrink-0 text-kadesh"
                  strokeWidth={1.5}
                />
                <span className="line-clamp-2 leading-relaxed">{locationLine}</span>
              </p>
            )}

            {serviceTags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5 pt-1">
                {serviceTags.map((name) => (
                  <li
                    key={name}
                    className="rounded-md bg-kadesh-50 px-2 py-0.5 text-xs font-medium text-kadesh-700 dark:bg-kadesh/15 dark:text-kadesh-300"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Link>

      <div
        className={`grid gap-2 px-5 pb-5 ${phoneHref ? 'grid-cols-[auto_1fr]' : 'grid-cols-1'}`}
      >
        {phoneHref && (
          <a
            href={phoneHref}
            aria-label={`Llamar a ${displayName}`}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-kadesh px-3 text-kadesh transition-colors hover:bg-kadesh hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
          >
            <HugeiconsIcon icon={Call02Icon} size={20} strokeWidth={1.5} />
          </a>
        )}
        <Link
          href={detailHref}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-kadesh px-4 py-3 font-semibold text-white transition-colors hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
        >
          <span>Ver ficha</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
        </Link>
      </div>
    </article>
  );
}
