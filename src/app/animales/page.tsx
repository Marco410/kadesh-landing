"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navigation, Footer } from 'kadesh/components/layout';
import {
  AnimalCard,
  AnimalFilters,
  AnimalsMap,
  useLostAnimals,
  LostAnimal,
} from 'kadesh/components/animals';
import { ANIMAL_LOGS_OPTIONS, emptyDirectoryHeadline } from 'kadesh/components/animals/constants';
import { useUser } from 'kadesh/utils/UserContext';
import { ConfirmModal } from 'kadesh/components/shared';
import { Routes } from 'kadesh/core/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Location01Icon,
  Search01Icon,
} from '@hugeicons/core-free-icons';
import { DEFAULT_RADIUS, RADIUS_OPTIONS_ANIMALS } from 'kadesh/constants/constans';

function LostAnimalsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFromQuery = searchParams.get('status');
  const initialStatus =
    statusFromQuery && ANIMAL_LOGS_OPTIONS.some((option) => option.value === statusFromQuery)
      ? statusFromQuery
      : undefined;
  const { user, loading: userLoading } = useUser();
  const [selectedAnimal, setSelectedAnimal] = useState<LostAnimal | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userLocation, setUserLocation] = useState<
    { lat: number; lng: number } | { lat: null; lng: null } | undefined
  >(undefined);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [radiusKm, setRadiusKm] = useState<number>(DEFAULT_RADIUS);

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

  const handleAnimalClick = (animal: LostAnimal | null) => {
    setSelectedAnimal(animal);
    if (animal) {
      const element = document.getElementById(`animal-${animal.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleRadiusChange = (km: number) => {
    setRadiusKm(km);
    goToPage(1);
    setSelectedAnimal(null);
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
    <main className="min-h-screen bg-white pt-[72px] dark:bg-night">
      <Navigation />

      <div className="flex flex-col md:h-[calc(100vh-72px)] md:flex-row md:overflow-hidden">
        <div className="relative h-[42vh] min-h-[280px] w-full min-w-0 flex-shrink-0 md:order-2 md:h-full md:min-h-0 md:flex-1">
          <AnimalsMap
            animals={allAnimals}
            selectedAnimal={selectedAnimal}
            onAnimalClick={handleAnimalClick}
            height="100%"
          />
          <button
            type="button"
            onClick={handleReportAnimalClick}
            disabled={userLoading}
            className="absolute right-3 top-3 z-10 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,35,80,0.18)] transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden"
          >
            <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={1.5} />
            Reportar
          </button>
        </div>

        <aside className="flex w-full flex-col border-t border-[#ececec] bg-white md:order-1 md:h-full md:w-[400px] md:flex-shrink-0 md:border-t-0 md:border-r xl:w-[440px] dark:border-white/10 dark:bg-night-raised">
          <header className="flex-shrink-0 border-b border-[#ececec] px-5 py-5 dark:border-white/10">
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
              <button
                type="button"
                onClick={handleReportAnimalClick}
                disabled={userLoading}
                className="hidden min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh md:inline-flex"
              >
                <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} />
                Reportar
              </button>
            </div>

            {locationLoading && (
              <p className="mt-3 text-sm font-medium text-kadesh">
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
                />
                <span>{locationError}</span>
              </p>
            )}

            {hasLocation && !locationError && (
              <div
                role="group"
                aria-label="Radio de búsqueda"
                className="mt-4 flex flex-wrap gap-1.5"
              >
                {RADIUS_OPTIONS_ANIMALS.map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => handleRadiusChange(km)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
                      radiusKm === km
                        ? 'bg-kadesh text-white'
                        : 'bg-[#f3f5f8] text-[#3a3a3a] hover:bg-kadesh-50 dark:bg-night dark:text-[#d0d0d0] dark:hover:bg-kadesh/20'
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4">
              <AnimalFilters
                filters={filters}
                onFiltersChange={updateFilters}
                onClearFilters={clearFilters}
              />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4">
            {(locationLoading || animalsLoading) && animals.length === 0 ? (
              <div className="space-y-3">
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
              </div>
            ) : animals.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-12 text-center">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-kadesh-50 text-kadesh dark:bg-kadesh/15">
                  <HugeiconsIcon icon={Search01Icon} size={28} strokeWidth={1.5} />
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
                {hasActiveFilters && nextRadius ? (
                  <div className="mt-5 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRadiusChange(nextRadius)}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600"
                    >
                      Buscar en {nextRadius} km
                    </button>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-sm font-semibold text-kadesh hover:text-kadesh-600"
                    >
                      Quitar filtros
                    </button>
                  </div>
                ) : hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600"
                  >
                    Quitar filtros
                  </button>
                ) : hasLocation && nextRadius ? (
                  <button
                    type="button"
                    onClick={() => handleRadiusChange(nextRadius)}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600"
                  >
                    Buscar en {nextRadius} km
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleReportAnimalClick}
                    disabled={userLoading}
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:opacity-50"
                  >
                    <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} />
                    Reportar un animal
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {animals.map((animal) => (
                    <AnimalCard
                      key={animal.id}
                      animal={animal}
                      variant="horizontal"
                      isSelected={selectedAnimal?.id === animal.id}
                      onClick={() => handleAnimalClick(animal)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#ececec] pt-4 dark:border-white/10">
                    <button
                      type="button"
                      onClick={previousPage}
                      disabled={!hasPreviousPage}
                      className="rounded-lg border border-[#ececec] bg-white px-3 py-1.5 text-sm font-medium text-[#121212] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#f7f8fa] dark:border-white/10 dark:bg-night dark:text-white dark:hover:bg-night-raised"
                    >
                      Anterior
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              type="button"
                              onClick={() => goToPage(page)}
                              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                                currentPage === page
                                  ? 'bg-kadesh text-white'
                                  : 'border border-[#ececec] bg-white text-[#121212] hover:bg-[#f7f8fa] dark:border-white/10 dark:bg-night dark:text-white'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                        if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span
                              key={page}
                              className="px-1 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]"
                            >
                              …
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={nextPage}
                      disabled={!hasNextPage}
                      className="rounded-lg border border-[#ececec] bg-white px-3 py-1.5 text-sm font-medium text-[#121212] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#f7f8fa] dark:border-white/10 dark:bg-night dark:text-white dark:hover:bg-night-raised"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
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

      <Footer />
    </main>
  );
}

export default function LostAnimalsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white pt-[72px] dark:bg-night">
          <Navigation />
        </main>
      }
    >
      <LostAnimalsPageContent />
    </Suspense>
  );
}
