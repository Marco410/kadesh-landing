"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Navigation } from "kadesh/components/layout";
import { useUiMotion } from "kadesh/components/shared/motion";
import {
  VeterinaryCard,
  VeterinariesMap,
  OpenNowChip,
  VeterinarySearchInput,
  useNearbyPetPlaces,
} from "kadesh/components/veterinaries";
import type { PetPlace } from "kadesh/components/veterinaries";
import {
  DirectoryPagination,
  DirectoryRadiusChips,
} from "kadesh/components/shared";
import { Routes } from "kadesh/core/routes";
import {
  DEFAULT_RADIUS_VETERINARIES,
  RADIUS_OPTIONS_VETERINARIES,
  parseRadiusOption,
} from "kadesh/constants/constans";
import { HugeiconsIcon } from "@hugeicons/react";
import { HospitalLocationIcon, Location01Icon } from "@hugeicons/core-free-icons";

function replaceQueryParam(
  search: string,
  key: string,
  value: string | null,
): string {
  const params = new URLSearchParams(search);
  if (value == null || value === "") params.delete(key);
  else params.set(key, value);
  const next = params.toString();
  return next ? `?${next}` : "";
}

function VeterinariesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const motionPrefs = useUiMotion();
  const [userLocation, setUserLocation] = useState<
    { lat: number; lng: number } | { lat: null; lng: null } | undefined
  >(undefined);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<PetPlace | null>(null);
  const radiusKm = parseRadiusOption(
    searchParams.get("radius"),
    RADIUS_OPTIONS_VETERINARIES,
    DEFAULT_RADIUS_VETERINARIES,
  );
  const openNow = searchParams.get("open") === "1";
  const verifiedOnly = searchParams.get("verified") === "1";
  const nameQuery = searchParams.get("q") ?? "";

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("La geolocalización no está disponible");
      setUserLocation({ lat: null, lng: null });
      setLocationLoading(false);
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Permiso de ubicación denegado. Activa la ubicación para ver veterinarias cercanas."
            : "No se pudo obtener tu ubicación";
        setLocationError(message);
        setUserLocation({ lat: null, lng: null });
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, []);

  const {
    places,
    allPlaces,
    nearbyCount,
    openCount,
    verifiedCount,
    loading: placesLoading,
    currentPage,
    totalPages,
    totalPlaces,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    hasLocation,
  } = useNearbyPetPlaces(userLocation, undefined, radiusKm, {
    openNow,
    verifiedOnly,
    query: nameQuery,
  });

  const nextRadius = RADIUS_OPTIONS_VETERINARIES.find((km) => km > radiusKm);

  useEffect(() => {
    if (selectedPlace && !allPlaces.some((place) => place.id === selectedPlace.id)) {
      setSelectedPlace(null);
    }
  }, [allPlaces, selectedPlace]);

  const handlePlaceClick = (place: PetPlace | null) => {
    setSelectedPlace(place);
    if (place) {
      const el = document.getElementById(`veterinary-${place.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleRadiusChange = (km: number) => {
    const href = replaceQueryParam(
      searchParams.toString(),
      "radius",
      km === DEFAULT_RADIUS_VETERINARIES ? null : String(km),
    );
    router.replace(`${Routes.veterinaries.index}${href}`, { scroll: false });
    goToPage(1);
    setSelectedPlace(null);
  };

  const handleOpenNowToggle = () => {
    const href = replaceQueryParam(
      searchParams.toString(),
      "open",
      openNow ? null : "1",
    );
    router.replace(`${Routes.veterinaries.index}${href}`, { scroll: false });
    setSelectedPlace(null);
  };

  const handleVerifiedToggle = () => {
    const href = replaceQueryParam(
      searchParams.toString(),
      "verified",
      verifiedOnly ? null : "1",
    );
    router.replace(`${Routes.veterinaries.index}${href}`, { scroll: false });
    setSelectedPlace(null);
  };

  const handleNameChange = (value: string) => {
    const href = replaceQueryParam(
      searchParams.toString(),
      "q",
      value.trim() || null,
    );
    router.replace(`${Routes.veterinaries.index}${href}`, { scroll: false });
    setSelectedPlace(null);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["open", "verified", "q"].forEach((key) => params.delete(key));
    const next = params.toString();
    router.replace(`${Routes.veterinaries.index}${next ? `?${next}` : ""}`, {
      scroll: false,
    });
    setSelectedPlace(null);
  };

  const hasActiveFilters = openNow || verifiedOnly || Boolean(nameQuery.trim());
  const nearbyCountLabel = `${totalPlaces} ${
    hasActiveFilters ? `resultado${totalPlaces === 1 ? "" : "s"}` : "cerca de ti"
  }`;
  const noFilterMatch = hasActiveFilters && nearbyCount > 0 && totalPlaces === 0;

  return (
    <main className="min-h-dvh bg-white pt-[72px] dark:bg-night">
      <Navigation />

      <div className="flex flex-col md:h-[calc(100dvh-72px)] md:flex-row md:overflow-hidden">
        <motion.div
          className="relative h-[42dvh] min-h-[280px] w-full min-w-0 flex-shrink-0 md:order-2 md:h-full md:min-h-0 md:flex-1"
          initial={motionPrefs.reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={motionPrefs.transition}
        >
          <VeterinariesMap
            places={allPlaces}
            selectedPlace={selectedPlace}
            onPlaceClick={handlePlaceClick}
            height="100%"
          />
        </motion.div>

        <aside className="flex w-full flex-col border-t border-[#ececec] bg-white md:order-1 md:h-full md:w-[400px] md:flex-shrink-0 md:border-t-0 md:border-r xl:w-[440px] dark:border-white/10 dark:bg-night-raised">
          <motion.header
            className="flex-shrink-0 border-b border-[#ececec] px-5 py-5 dark:border-white/10"
            variants={motionPrefs.panel}
            initial={motionPrefs.panel ? "hidden" : false}
            animate="show"
          >
            <h1 className="text-2xl font-black tracking-[-0.03em] text-[#121212] dark:text-white">
              Veterinarias
            </h1>
            <Link
              href={Routes.veterinaries.register}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
            >
              Registra tu veterinaria
            </Link>
            <p className="mt-3 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
              {hasLocation
                ? nearbyCountLabel
                : "Encuentra clínicas según tu ubicación"}
            </p>

            {locationLoading && (
              <p className="mt-3 text-sm font-medium text-kadesh" aria-live="polite">
                Obteniendo tu ubicación…
              </p>
            )}
            {locationError && (
              <p className="mt-3 flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                <HugeiconsIcon
                  icon={Location01Icon}
                  size={16}
                  className="mt-0.5 flex-shrink-0"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span>{locationError}</span>
              </p>
            )}

            {hasLocation && !locationError && (
              <>
                <DirectoryRadiusChips
                  options={RADIUS_OPTIONS_VETERINARIES}
                  value={radiusKm}
                  onChange={handleRadiusChange}
                />
                <VeterinarySearchInput
                  value={nameQuery}
                  onChange={handleNameChange}
                />
                <OpenNowChip
                  pressed={openNow}
                  onToggle={handleOpenNowToggle}
                  count={placesLoading ? undefined : openCount}
                  verifiedPressed={verifiedOnly}
                  onToggleVerified={handleVerifiedToggle}
                  verifiedCount={placesLoading ? undefined : verifiedCount}
                />
              </>
            )}
          </motion.header>

          <div className="flex-1 overflow-y-auto p-4" aria-busy={locationLoading || placesLoading}>
            <AnimatePresence mode="wait">
            {(locationLoading || placesLoading) && places.length === 0 ? (
              <motion.div
                key="loading"
                className="space-y-3"
                variants={motionPrefs.panel}
                initial={motionPrefs.panel ? "hidden" : false}
                animate="show"
                exit="exit"
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-[#ececec] p-4 dark:border-white/10"
                  >
                    <div className="flex gap-3">
                      <div className="h-11 w-9 rounded-md bg-[#e8edf3] dark:bg-[#2a3548]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-[#e8edf3] dark:bg-[#2a3548]" />
                        <div className="h-3 w-1/2 rounded bg-[#e8edf3] dark:bg-[#2a3548]" />
                      </div>
                    </div>
                    <div className="mt-3 h-11 rounded-xl bg-[#e8edf3] dark:bg-[#2a3548]" />
                  </div>
                ))}
              </motion.div>
            ) : places.length === 0 ? (
              <motion.div
                key="empty"
                className="flex flex-col items-center px-4 py-12 text-center"
                variants={motionPrefs.panel}
                initial={motionPrefs.panel ? "hidden" : false}
                animate="show"
                exit="exit"
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-kadesh-50 text-kadesh dark:bg-kadesh/15">
                  <HugeiconsIcon
                    icon={HospitalLocationIcon}
                    size={28}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
                <p className="text-base font-semibold text-[#121212] dark:text-white">
                  {locationError
                    ? "Sin ubicación no podemos ordenar por distancia"
                    : noFilterMatch
                      ? "Ninguna veterinaria coincide"
                      : `No hay clínicas en ${radiusKm} km`}
                </p>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
                  {locationError
                    ? "Activa la ubicación en el navegador para ver veterinarias cerca de ti."
                    : noFilterMatch
                      ? `Hay ${nearbyCount} clínica${nearbyCount === 1 ? "" : "s"} en ${radiusKm} km, pero ninguna cumple con tu búsqueda o filtros.`
                      : nextRadius
                        ? "Amplía el radio: en esta zona las clínicas suelen aparecer a partir de un rango mayor."
                        : "No encontramos veterinarias en el radio máximo. Vuelve más tarde o registra la tuya."}
                </p>
                {(noFilterMatch || (hasLocation && nextRadius)) && (
                  <div className="mt-5 flex flex-col items-center gap-2">
                    {noFilterMatch && (
                      <motion.button
                        type="button"
                        onClick={clearFilters}
                        whileTap={motionPrefs.tap}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600"
                      >
                        Quitar filtros
                      </motion.button>
                    )}
                    {hasLocation && nextRadius && (
                      <motion.button
                        type="button"
                        onClick={() => handleRadiusChange(nextRadius)}
                        whileTap={motionPrefs.tap}
                        className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors ${
                          noFilterMatch
                            ? "border-2 border-kadesh text-kadesh hover:bg-kadesh hover:text-white"
                            : "bg-kadesh text-white hover:bg-kadesh-600"
                        }`}
                      >
                        Buscar en {nextRadius} km
                      </motion.button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`${radiusKm}-${openNow}-${verifiedOnly}-${nameQuery}-${currentPage}`}
                initial={motionPrefs.panel ? "hidden" : false}
                animate="show"
                exit="exit"
                variants={motionPrefs.panel}
              >
                <motion.div
                  className="space-y-3"
                  variants={motionPrefs.list}
                  initial={motionPrefs.list ? "hidden" : false}
                  animate="show"
                >
                  {places.map((place) => (
                    <VeterinaryCard
                      key={place.id}
                      place={place}
                      isSelected={selectedPlace?.id === place.id}
                      onClick={() => handlePlaceClick(place)}
                    />
                  ))}
                </motion.div>
                <DirectoryPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPage={goToPage}
                  onPrevious={previousPage}
                  onNext={nextPage}
                  hasPreviousPage={hasPreviousPage}
                  hasNextPage={hasNextPage}
                />
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </main>
  );
}

function VeterinariesFallback() {
  return (
    <main className="min-h-dvh bg-white pt-[72px] dark:bg-night">
      <Navigation />
    </main>
  );
}

export default function VeterinariesPage() {
  return (
    <Suspense fallback={<VeterinariesFallback />}>
      <VeterinariesPageContent />
    </Suspense>
  );
}
