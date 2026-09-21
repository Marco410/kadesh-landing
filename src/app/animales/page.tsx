"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigation } from 'kadesh/components/layout';
import {
  AnimalCard,
  AnimalFilters,
  AnimalsMap,
  useLostAnimals,
  LostAnimal,
} from 'kadesh/components/animals';
import { ANIMAL_LOGS_OPTIONS, emptyDirectoryHeadline } from 'kadesh/components/animals/constants';
import { useUser } from 'kadesh/utils/UserContext';
import {
  ConfirmModal,
  DirectoryPagination,
  DirectoryRadiusChips,
} from 'kadesh/components/shared';
import { Routes } from 'kadesh/core/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Location01Icon,
  Search01Icon,
} from '@hugeicons/core-free-icons';
import {
  DEFAULT_RADIUS,
  RADIUS_OPTIONS_ANIMALS,
  parseRadiusOption,
} from 'kadesh/constants/constans';
import { useUiMotion } from 'kadesh/components/shared/motion';

function LostAnimalsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const motionPrefs = useUiMotion();
  const statusFromQuery = searchParams.get('status');
  const initialStatus =
    statusFromQuery && ANIMAL_LOGS_OPTIONS.some((option) => option.value === statusFromQuery)
      ? statusFromQuery
      : undefined;
  const radiusKm = parseRadiusOption(
    searchParams.get('radius'),
    RADIUS_OPTIONS_ANIMALS,
    DEFAULT_RADIUS
  );
  const { user, loading: userLoading } = useUser();
  const [selectedAnimal, setSelectedAnimal] = useState<LostAnimal | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userLocation, setUserLocation] = useState<
    { lat: number; lng: number } | { lat: null; lng: null } | undefined
  >(undefined);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('La geolocalización no está disponible');
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
            ? 'Permiso de ubicación denegado. Activa la ubicación para ver animales cercanos.'
            : 'No se pudo obtener tu ubicación';
        setLocationError(message);
        setUserLocation({ lat: null, lng: null });
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const {
    animals,
    allAnimals,
    currentPage,
    totalPages,
    totalAnimals,
    goToPage,
    nextPage,
    previousPage,
    updateFilters,
    clearFilters,
    filters,
    hasNextPage,
    hasPreviousPage,
    loading: animalsLoading,
  } = useLostAnimals(
    initialStatus ? { status: initialStatus } : undefined,
    undefined,
    userLocation,
    radiusKm
  );

  const hasLocation =
    userLocation != null && userLocation.lat != null && userLocation.lng != null;
  const nextRadius = RADIUS_OPTIONS_ANIMALS.find((km) => km > radiusKm);
  const hasActiveFilters = Boolean(filters.type || filters.status);

  useEffect(() => {
    if (selectedAnimal && !allAnimals.some((animal) => animal.id === selectedAnimal.id)) {
      setSelectedAnimal(null);
    }
  }, [allAnimals, selectedAnimal]);

  useEffect(() => {
    const urlStatus =
      statusFromQuery && ANIMAL_LOGS_OPTIONS.some((option) => option.value === statusFromQuery)
        ? statusFromQuery
        : null;
    if ((filters.status ?? null) === urlStatus) return;
    updateFilters({ status: urlStatus });
  }, [statusFromQuery]);

  const handleAnimalClick = (animal: LostAnimal | null) => {
    setSelectedAnimal(animal);
    if (animal) {
      const element = document.getElementById(`animal-${animal.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const replaceDirectoryQuery = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const next = params.toString();
    router.replace(`/animales${next ? `?${next}` : ''}`, { scroll: false });
  };

  const handleRadiusChange = (km: number) => {
    replaceDirectoryQuery((params) => {
      if (km === DEFAULT_RADIUS) params.delete('radius');
      else params.set('radius', String(km));
    });
    goToPage(1);
    setSelectedAnimal(null);
  };

  const handleFiltersChange = (next: Parameters<typeof updateFilters>[0]) => {
    updateFilters(next);
    replaceDirectoryQuery((params) => {
      const status = next.status !== undefined ? next.status : filters.status;
      if (status) params.set('status', status);
      else params.delete('status');
    });
  };

  const handleClearFilters = () => {
    clearFilters();
    replaceDirectoryQuery((params) => {
      params.delete('status');
    });
  };

  const handleReportAnimalClick = () => {
    if (userLoading) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    router.push(Routes.animals.new);
  };

  const handleConfirmLogin = () => {
    setShowLoginModal(false);
    router.push(`${Routes.auth.login}?redirect=${Routes.animals.new}&tab=register`);
  };

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
          <AnimalsMap
            animals={allAnimals}
            selectedAnimal={selectedAnimal}
            onAnimalClick={handleAnimalClick}
            height="100%"
          />
          <motion.button
            type="button"
            onClick={handleReportAnimalClick}
            disabled={userLoading}
            whileTap={userLoading ? undefined : motionPrefs.tap}
            className="absolute right-3 top-3 z-10 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,35,80,0.18)] transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden"
          >
            <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={1.5} />
            Reportar
          </motion.button>
        </motion.div>

        <aside className="flex w-full flex-col border-t border-[#ececec] bg-white md:order-1 md:h-full md:w-[400px] md:flex-shrink-0 md:border-t-0 md:border-r xl:w-[440px] dark:border-white/10 dark:bg-night-raised">
          <motion.header
            className="flex-shrink-0 border-b border-[#ececec] px-5 py-5 dark:border-white/10"
            variants={motionPrefs.panel}
            initial={motionPrefs.panel ? "hidden" : false}
            animate="show"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-black tracking-[-0.03em] text-[#121212] dark:text-white">
                  Animales
                </h1>
                <p className="mt-1 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
                  {hasLocation
                    ? `${totalAnimals} cerca de ti`
                    : 'Perdidos, encontrados y en adopción'}
                </p>
              </div>
              <motion.button
                type="button"
                onClick={handleReportAnimalClick}
                disabled={userLoading}
                whileTap={userLoading ? undefined : motionPrefs.tap}
                className="hidden min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh md:inline-flex"
              >
                <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} />
                Reportar
              </motion.button>
            </div>

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
              <DirectoryRadiusChips
                options={RADIUS_OPTIONS_ANIMALS}
                value={radiusKm}
                onChange={handleRadiusChange}
              />
            )}

            <div className="mt-4">
              <AnimalFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </motion.header>

          <div className="flex-1 overflow-y-auto p-4" aria-busy={locationLoading || animalsLoading}>
            <AnimatePresence mode="wait">
            {(locationLoading || animalsLoading) && animals.length === 0 ? (
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
                      <div className="h-20 w-20 rounded-xl bg-[#e8edf3] dark:bg-[#2a3548]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-[#e8edf3] dark:bg-[#2a3548]" />
                        <div className="h-3 w-1/2 rounded bg-[#e8edf3] dark:bg-[#2a3548]" />
                        <div className="h-3 w-2/3 rounded bg-[#e8edf3] dark:bg-[#2a3548]" />
                      </div>
                    </div>
                    <div className="mt-3 h-11 rounded-xl bg-[#e8edf3] dark:bg-[#2a3548]" />
                  </div>
                ))}
              </motion.div>
            ) : animals.length === 0 ? (
              <motion.div
                key="empty"
                className="flex flex-col items-center px-4 py-12 text-center"
                variants={motionPrefs.panel}
                initial={motionPrefs.panel ? "hidden" : false}
                animate="show"
                exit="exit"
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-kadesh-50 text-kadesh dark:bg-kadesh/15">
                  <HugeiconsIcon icon={Search01Icon} size={28} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <p className="text-base font-semibold text-[#121212] dark:text-white">
                  {locationError
                    ? 'Sin ubicación no podemos ordenar por distancia'
                    : emptyDirectoryHeadline(filters, radiusKm)}
                </p>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
                  {locationError
                    ? 'Activa la ubicación en el navegador para ver animales cerca de ti.'
                    : hasActiveFilters && nextRadius
                      ? 'Amplía el radio o quita un filtro para ver más reportes.'
                      : hasActiveFilters
                        ? 'Quita un filtro para ver más reportes.'
                        : nextRadius
                          ? 'Amplía el radio: en esta zona los reportes suelen aparecer más lejos.'
                          : 'No encontramos reportes en el radio máximo. Publica el tuyo para que otros lo vean.'}
                </p>
                {locationError ? (
                  hasActiveFilters ? (
                    <motion.button
                      type="button"
                      onClick={handleClearFilters}
                      whileTap={motionPrefs.tap}
                      className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600"
                    >
                      Quitar filtros
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={handleReportAnimalClick}
                      disabled={userLoading}
                      whileTap={userLoading ? undefined : motionPrefs.tap}
                      className="mt-5 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:opacity-50"
                    >
                      <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} aria-hidden="true" />
                      Reportar un animal
                    </motion.button>
                  )
                ) : hasActiveFilters && nextRadius ? (
                  <div className="mt-5 flex flex-col items-center gap-2">
                    <motion.button
                      type="button"
                      onClick={() => handleRadiusChange(nextRadius)}
                      whileTap={motionPrefs.tap}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600"
                    >
                      Buscar en {nextRadius} km
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleClearFilters}
                      whileTap={motionPrefs.tap}
                      className="inline-flex min-h-11 items-center text-sm font-semibold text-kadesh hover:text-kadesh-600"
                    >
                      Quitar filtros
                    </motion.button>
                  </div>
                ) : hasActiveFilters ? (
                  <motion.button
                    type="button"
                    onClick={handleClearFilters}
                    whileTap={motionPrefs.tap}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600"
                  >
                    Quitar filtros
                  </motion.button>
                ) : hasLocation && nextRadius ? (
                  <motion.button
                    type="button"
                    onClick={() => handleRadiusChange(nextRadius)}
                    whileTap={motionPrefs.tap}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600"
                  >
                    Buscar en {nextRadius} km
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleReportAnimalClick}
                    disabled={userLoading}
                    whileTap={userLoading ? undefined : motionPrefs.tap}
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:opacity-50"
                  >
                    <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} aria-hidden="true" />
                    Reportar un animal
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`${radiusKm}-${filters.type ?? ""}-${filters.status ?? ""}-${currentPage}`}
                variants={motionPrefs.panel}
                initial={motionPrefs.panel ? "hidden" : false}
                animate="show"
                exit="exit"
              >
                <motion.div
                  className="space-y-3"
                  variants={motionPrefs.list}
                  initial={motionPrefs.list ? "hidden" : false}
                  animate="show"
                >
                  {animals.map((animal) => (
                    <AnimalCard
                      key={animal.id}
                      animal={animal}
                      variant="horizontal"
                      isSelected={selectedAnimal?.id === animal.id}
                      onClick={() => handleAnimalClick(animal)}
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

      <ConfirmModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onConfirm={handleConfirmLogin}
        title="Inicio de sesión requerido"
        message="Debes iniciar sesión o registrarte para reportar un animal. ¿Deseas ir a la página de registro?"
        confirmText="Ir a registro"
        cancelText="Cancelar"
      />
    </main>
  );
}

export default function LostAnimalsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh bg-white pt-[72px] dark:bg-night">
          <Navigation />
        </main>
      }
    >
      <LostAnimalsPageContent />
    </Suspense>
  );
}
