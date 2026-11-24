"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Call02Icon,
  Location01Icon,
  PencilEdit02Icon,
  StarIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import RecordedViews from "kadesh/components/shared/RecordedViews";
import { Routes } from "kadesh/core/routes";
import PetPlaceBookCta from "../PetPlaceBookCta";
import PetPlaceLikeButton from "../PetPlaceLikeButton";
import UnverifiedChip from "../UnverifiedChip";
import VerifiedBadge from "../VerifiedBadge";
import type { PetPlaceDetail } from "../types";
import type { PlaceLinks } from "./placeLinks";
import SharePlaceButton from "./SharePlaceButton";

const SECONDARY_ACTION =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-kadesh-400 dark:text-kadesh-300 dark:hover:bg-kadesh dark:hover:text-white";
const PRIMARY_ACTION =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh";

function Stars({ value }: { value: number }) {
  const filled = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => (
        <HugeiconsIcon
          key={star}
          icon={StarIcon}
          size={15}
          strokeWidth={1.5}
          className={star <= filled ? "fill-amber-500 text-amber-500" : "text-[#c9ced6] dark:text-[#4a5262]"}
        />
      ))}
    </span>
  );
}

type Props = {
  place: PetPlaceDetail;
  displayName: string;
  typeLine: string;
  isVerified: boolean;
  isOwnPlace: boolean;
  isBookable: boolean;
  links: PlaceLinks;
  /** Today's hours from the schedule, if any. */
  hoursToday: string | null;
};

/**
 * Name, what it is and where, the signals that decide a visit (stars, open now, verified) and the
 * actions. On phones the main actions live in the bottom bar (`PlaceMobileActions`), so here they
 * only show from `lg`.
 */
export default function PlaceHeader({
  place,
  displayName,
  typeLine,
  isVerified,
  isOwnPlace,
  isBookable,
  links,
  hoursToday,
}: Props) {
  const reviewsCount = place.reviewsCount ?? place.pet_place_reviews?.length ?? 0;
  const rating = place.averageRating;
  const subtitle = [typeLine, links.locality].filter(Boolean).join(" · ");
  const callIsPrimary = !isBookable;

  return (
    <header className="flex flex-col gap-5">
      <Link
        href={Routes.veterinaries.index}
        className="inline-flex min-h-11 items-center gap-1 self-start rounded-lg text-sm font-semibold text-kadesh hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh dark:text-kadesh-300 lg:min-h-0"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} aria-hidden />
        Directorio de veterinarias
      </Link>

      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-balance text-[clamp(1.875rem,1.3rem+2.2vw,2.75rem)] font-black leading-[1.05] tracking-[-0.035em] text-[#121212] dark:text-white">
            {displayName}
            {isVerified ? (
              <span className="ml-2 inline-flex translate-y-[-0.1em] align-middle">
                <VerifiedBadge size={26} />
              </span>
            ) : null}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-base text-[#3a3a3a] dark:text-[#c3c9d3]">{subtitle}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {rating != null || reviewsCount > 0 ? (
              <a
                href="#resenas"
                className="inline-flex items-center gap-1.5 rounded-md text-[#121212] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh dark:text-white"
              >
                {rating != null ? (
                  <>
                    <Stars value={rating} />
                    <span className="font-bold tabular-nums">{rating.toFixed(1)}</span>
                  </>
                ) : null}
                <span className="text-[#5a5a5a] dark:text-[#b0b0b0]">
                  ({reviewsCount} {reviewsCount === 1 ? "reseña" : "reseñas"})
                </span>
              </a>
            ) : (
              <a href="#resenas" className="text-[#5a5a5a] hover:underline dark:text-[#b0b0b0]">
                Sin reseñas todavía
              </a>
            )}

            {place.isOpen != null || hoursToday ? (
              <span className="inline-flex items-center gap-1.5 text-[#3a3a3a] dark:text-[#c3c9d3]">
                {place.isOpen != null ? (
                  <>
                    <span
                      className={`h-2 w-2 rounded-full ${place.isOpen ? "bg-green-600 dark:bg-green-400" : "bg-[#9aa3b2]"}`}
                      aria-hidden
                    />
                    <span className={`font-semibold ${place.isOpen ? "text-green-700 dark:text-green-400" : ""}`}>
                      {place.isOpen ? "Abierto ahora" : "Cerrado ahora"}
                    </span>
                  </>
                ) : null}
                {hoursToday ? (
                  <span className="tabular-nums">
                    {place.isOpen != null ? "· " : ""}Hoy {hoursToday}
                  </span>
                ) : null}
              </span>
            ) : null}

            {!isVerified ? <UnverifiedChip /> : null}
            <RecordedViews kind="petPlace" id={place.id} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:shrink-0 xl:justify-end">
          {isOwnPlace ? (
            <Link href={Routes.profileClinic(place.id)} className={SECONDARY_ACTION}>
              <HugeiconsIcon icon={PencilEdit02Icon} size={18} strokeWidth={1.5} aria-hidden />
              Editar mi ficha
            </Link>
          ) : null}
          <div className="hidden flex-wrap items-center gap-2 lg:flex">
            {isBookable ? <PetPlaceBookCta place={place} className="min-h-11 px-5" /> : null}
            {links.phoneHref ? (
              <a href={links.phoneHref} className={callIsPrimary ? PRIMARY_ACTION : SECONDARY_ACTION}>
                <HugeiconsIcon icon={Call02Icon} size={18} strokeWidth={1.5} aria-hidden />
                Llamar
              </a>
            ) : null}
            {links.whatsappHref ? (
              <a href={links.whatsappHref} target="_blank" rel="noopener noreferrer" className={SECONDARY_ACTION}>
                <HugeiconsIcon icon={WhatsappIcon} size={18} strokeWidth={1.5} aria-hidden />
                WhatsApp
              </a>
            ) : null}
            {links.directionsHref ? (
              <a href={links.directionsHref} target="_blank" rel="noopener noreferrer" className={SECONDARY_ACTION}>
                <HugeiconsIcon icon={Location01Icon} size={18} strokeWidth={1.5} aria-hidden />
                Cómo llegar
              </a>
            ) : null}
          </div>
          <PetPlaceLikeButton petPlaceId={place.id} initialCount={place.pet_place_likesCount ?? 0} variant="quiet" />
          <SharePlaceButton name={displayName} slug={place.slug || place.id} />
        </div>
      </div>
    </header>
  );
}
