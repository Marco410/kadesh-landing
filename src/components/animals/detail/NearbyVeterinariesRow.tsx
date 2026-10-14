"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Call02Icon,
  HospitalLocationIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import {
  useNearbyPetPlaces,
  VerifiedBadge,
  veterinaryDetailHref,
  type PetPlace,
} from "kadesh/components/veterinaries";
import { Routes } from "kadesh/core/routes";

const NEARBY_LIMIT = 12;

function formatDistance(distance: number | null | undefined) {
  if (distance == null || Number.isNaN(distance)) return null;
  return distance < 1
    ? `${Math.round(distance * 1000)} m`
    : `${distance.toFixed(1)} km`;
}

function placeRating(place: PetPlace) {
  if (place.averageRating != null && !Number.isNaN(place.averageRating)) {
    return place.averageRating;
  }
  const ratings = (place.pet_place_reviews ?? [])
    .map((review) => review.rating)
    .filter((rating): rating is number => rating != null && !Number.isNaN(rating));
  if (!ratings.length) return null;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

function NearbyVetCard({ place }: { place: PetPlace }) {
  const name = place.name?.trim() || "Veterinaria";
  const distance = formatDistance(place.distance);
  const rating = placeRating(place);
  const area = place.municipality || place.street || place.address;
  const phoneHref = place.phone
    ? `tel:${place.phone.replace(/[^\d+]/g, "")}`
    : null;

  return (
    <li className="relative flex w-[15.5rem] shrink-0 snap-start items-center gap-3 rounded-xl border border-[#ececec] bg-[#f7f8fa] p-3 transition-colors hover:border-kadesh/40 dark:border-white/10 dark:bg-night">
      <div className="min-w-0 flex-1">
        <Link
          href={veterinaryDetailHref(place)}
          className="flex min-w-0 items-center gap-1 text-sm font-bold text-[#121212] after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-kadesh dark:text-[#eef1f6]"
        >
          <span className="truncate">{name}</span>
          {place.verified ? <VerifiedBadge size={14} /> : null}
        </Link>
        <p className="mt-0.5 truncate text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
          {[distance && `A ${distance}`, area].filter(Boolean).join(" · ") ||
            "Cerca de aquí"}
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-xs">
          {place.isOpen != null && (
            <span
              className={`font-semibold ${
                place.isOpen
                  ? "text-green-600 dark:text-green-400"
                  : "text-[#5a5a5a] dark:text-[#9aa3b2]"
              }`}
            >
              {place.isOpen ? "Abierto" : "Cerrado"}
            </span>
          )}
          {rating != null && (
            <span className="inline-flex items-center gap-0.5 font-semibold text-[#121212] dark:text-[#eef1f6]">
              <HugeiconsIcon
                icon={StarIcon}
                size={12}
                strokeWidth={2}
                className="text-amber-500"
              />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      {phoneHref && (
        <a
          href={phoneHref}
          aria-label={`Llamar a ${name}`}
          className="relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-kadesh text-kadesh transition-colors hover:bg-kadesh hover:text-white"
        >
          <HugeiconsIcon icon={Call02Icon} size={16} strokeWidth={1.5} />
        </a>
      )}
    </li>
  );
}

interface NearbyVeterinariesRowProps {
  lat: number;
  lng: number;
}

export default function NearbyVeterinariesRow({
  lat,
  lng,
}: NearbyVeterinariesRowProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const location = useMemo(() => ({ lat, lng }), [lat, lng]);
  const { allPlaces, loading } = useNearbyPetPlaces(location, NEARBY_LIMIT);

  if (!loading && allPlaces.length === 0) return null;

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section
      aria-labelledby="nearby-vets-title"
      className="rounded-2xl border border-[#ececec] bg-white p-3 dark:border-white/10 dark:bg-night-raised"
    >
      <div className="mb-2 flex items-center gap-2">
        <HugeiconsIcon
          icon={HospitalLocationIcon}
          size={18}
          strokeWidth={1.5}
          className="shrink-0 text-kadesh"
        />
        <h2
          id="nearby-vets-title"
          className="min-w-0 truncate text-sm font-black tracking-[-0.02em] text-[#121212] dark:text-[#eef1f6]"
        >
          Veterinarias cerca de donde se vio
        </h2>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Link
            href={Routes.veterinaries.index}
            className="mr-1 text-xs font-semibold text-kadesh hover:underline"
          >
            Ver todas
          </Link>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Anteriores"
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-[#5a5a5a] hover:bg-[#f3f5f8] hover:text-kadesh dark:text-[#9aa3b2] dark:hover:bg-white/10 sm:inline-flex"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Siguientes"
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-[#5a5a5a] hover:bg-[#f3f5f8] hover:text-kadesh dark:text-[#9aa3b2] dark:hover:bg-white/10 sm:inline-flex"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin]"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="h-[4.75rem] w-[15.5rem] shrink-0 animate-pulse rounded-xl bg-[#eef1f5] dark:bg-white/10"
              />
            ))
          : allPlaces.map((place) => (
              <NearbyVetCard key={place.id} place={place} />
            ))}
      </ul>
    </section>
  );
}
