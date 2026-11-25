"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { Navigation } from "kadesh/components/layout";
import {
  AdSlot,
  AD_INLINE_MEDIA,
  AD_SIDE_CLASS,
  AD_SIDE_MEDIA,
} from "kadesh/components/shared";
import { useUiMotion } from "kadesh/components/shared/motion";
import { Routes } from "kadesh/core/routes";
import { AD_PLACEMENT } from "kadesh/components/ads/types";
import { useUser } from "kadesh/utils/UserContext";
import { GET_PET_PLACE } from "kadesh/components/veterinaries/queries";
import {
  PetPlaceReviewsSection,
  ClaimPetPlaceSection,
  PetPlaceContactCard,
} from "kadesh/components/veterinaries";
import { getPetPlaceBookingMode } from "kadesh/components/veterinaries/appointments";
import {
  formatPetPlaceTypeLabels,
  PET_PLACE_CLAIM_STATUS,
} from "kadesh/components/veterinaries/constants";
import { isPetPlaceKeystoneId } from "kadesh/components/veterinaries/petPlaceSlug";
import PetPlaceDetailSkeleton from "kadesh/components/veterinaries/PetPlaceDetailSkeleton";
import PlaceHeader from "kadesh/components/veterinaries/detail/PlaceHeader";
import PlaceMobileActions from "kadesh/components/veterinaries/detail/PlaceMobileActions";
import {
  PlaceAbout,
  PlaceHours,
  PlaceMissingInfo,
  PlaceServices,
} from "kadesh/components/veterinaries/detail/PlaceSections";
import { placeLinks } from "kadesh/components/veterinaries/detail/placeLinks";
import { todayHours } from "kadesh/components/veterinaries/detail/schedule";
import type {
  PetPlaceDetail,
  PetPlaceWhereUniqueInput,
} from "kadesh/components/veterinaries/types";
import { DonationCard } from "kadesh/components/donations";

function DetailShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-white pt-[72px] dark:bg-night">
      <Navigation />
      {children}
    </main>
  );
}

export default function VeterinaryDetailClient({
  storeShowcase,
}: {
  /** Store box painted by the server (`page.tsx`); renders nothing when the store is closed. */
  storeShowcase?: ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const motionPrefs = useUiMotion();
  const placeKey = typeof params?.slug === "string" ? params.slug : undefined;

  const { data, loading, error, refetch } = useQuery<
    { petPlace: PetPlaceDetail | null },
    { where: PetPlaceWhereUniqueInput }
  >(GET_PET_PLACE, {
    variables: {
      where: isPetPlaceKeystoneId(placeKey ?? "")
        ? { id: placeKey }
        : { slug: placeKey },
    },
    skip: !placeKey,
    fetchPolicy: "cache-and-network",
  });

  const place = data?.petPlace ?? null;
  const isOwnPlace = Boolean(user?.id && place?.user?.id === user.id);

  useEffect(() => {
    if (!place?.slug || !placeKey || place.slug === placeKey) return;
    router.replace(Routes.veterinaries.detail(place.slug));
  }, [place?.slug, placeKey, router]);

  if (!placeKey) {
    return (
      <DetailShell>
        <div className="mx-auto flex w-full max-w-[90rem] flex-1 items-start px-4 py-6 lg:px-6">
          <div>
            <Link
              href={Routes.veterinaries.index}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-kadesh hover:underline"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              Directorio
            </Link>
            <p className="text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
              No se encontró esta veterinaria.
            </p>
          </div>
        </div>
      </DetailShell>
    );
  }

  if (loading && !place) {
    return (
      <DetailShell>
        <PetPlaceDetailSkeleton />
      </DetailShell>
    );
  }

  if (error || !place) {
    return (
      <DetailShell>
        <div className="mx-auto flex w-full max-w-[90rem] flex-1 items-start px-4 py-6 lg:px-6">
          <div>
            <Link
              href={Routes.veterinaries.index}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-kadesh hover:underline"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              Directorio
            </Link>
            <p className="text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
              {error
                ? "Error al cargar la veterinaria."
                : "No se encontró esta veterinaria."}
            </p>
          </div>
        </div>
      </DetailShell>
    );
  }

  const displayName = place.name?.trim() || "Veterinaria";
  const services = (place.services ?? []).filter(
    (service) => service.active !== false && Boolean(service.name?.trim()),
  );
  const schedules = place.pet_place_schedules ?? [];
  const links = placeLinks(place);
  // Zone ads are measured from the clinic; its own ad never shows on its page.
  const placeLat = Number.parseFloat(String(place.lat ?? ""));
  const placeLng = Number.parseFloat(String(place.lng ?? ""));
  const adContext = {
    targetId: place.id,
    lat: Number.isFinite(placeLat) ? placeLat : null,
    lng: Number.isFinite(placeLng) ? placeLng : null,
  };
  const isBookable = getPetPlaceBookingMode(place.types) !== null;
  const typeLine = formatPetPlaceTypeLabels(place.types);
  // Same rule as ClaimPetPlaceSection: while unverified that section always shows and the
  // «No verificada» chip leads to it.
  const isVerified =
    Boolean(place.verified) ||
    place.claimStatus === PET_PLACE_CLAIM_STATUS.VERIFIED;
  const hasHours = schedules.some((schedule) => schedule.timeIni || schedule.timeEnd);
  // Hours and services are what a visit depends on; a missing description alone is not worth a note.
  const missing = [
    !hasHours ? "horario" : null,
    services.length === 0 ? "servicios" : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <DetailShell>
      <motion.div
        className="mx-auto w-full max-w-[80rem] px-4 pt-6 pb-32 sm:px-6 lg:px-8 lg:pb-20"
        variants={motionPrefs.panel}
        initial={motionPrefs.panel ? "hidden" : false}
        animate="show"
      >
        <PlaceHeader
          place={place}
          displayName={displayName}
          typeLine={typeLine}
          isVerified={isVerified}
          isOwnPlace={isOwnPlace}
          isBookable={isBookable}
          links={links}
          hoursToday={todayHours(schedules)}
        />

        {/*
          Phones: one column in reading order (info, contact, reviews, claim, extras), with both
          columns flattened by `max-lg:contents` and sorted by `order`. Desktop: info, reviews and
          claim on the left; contact and extras on the right.
        */}
        <div className="mt-10 flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-x-12 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-x-16">
          <div className="flex min-w-0 flex-col gap-10 max-lg:contents">
            <div className="order-1 flex flex-col gap-8 [&>section:first-child]:border-t-0 [&>section:first-child]:pt-0">
              <PlaceAbout place={place} />
              <PlaceServices services={services} />
              <PlaceHours schedules={schedules} isOpen={place.isOpen} />
              {!isVerified ? (
                <PlaceMissingInfo missing={missing} hasPhone={Boolean(links.phone)} />
              ) : null}
            </div>
            <div className="order-3 min-w-0">
              <PetPlaceReviewsSection place={place} refetchPlace={refetch} />
            </div>
            <div className="order-4 flex min-w-0 flex-col gap-6">
              <ClaimPetPlaceSection place={place} onClaimed={() => refetch()} />
              <AdSlot placement={AD_PLACEMENT.VET_DETAIL} context={adContext} media={AD_INLINE_MEDIA} />
            </div>
          </div>

          <aside className="flex min-w-0 flex-col gap-6 max-lg:contents" aria-label="Ubicación, contacto y más">
            <div className="order-2">
              <PetPlaceContactCard place={place} links={links} />
            </div>
            <div className="order-5 flex flex-col gap-6">
              <AdSlot placement={AD_PLACEMENT.VET_DETAIL} context={adContext} media={AD_SIDE_MEDIA} className={AD_SIDE_CLASS} />
              {storeShowcase}
              <DonationCard
                source="veterinary"
                sourceRef={place.slug ?? placeKey}
                body="El directorio de veterinarias es gratis. Si te sirvió, ayúdanos a mantenerlo."
              />
            </div>
          </aside>
        </div>
      </motion.div>

      <PlaceMobileActions place={place} links={links} isBookable={isBookable} />
    </DetailShell>
  );
}
