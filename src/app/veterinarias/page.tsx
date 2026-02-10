"use client";

import { useState, useEffect } from 'react';
import { Navigation, Footer } from 'kadesh/components/layout';
import { VeterinaryCard, VeterinariesMap, useNearbyPetPlaces } from 'kadesh/components/veterinaries';
import type { PetPlace } from 'kadesh/components/veterinaries';
import { motion } from 'framer-motion';
import { DEFAULT_RADIUS_VETERINARIES, RADIUS_OPTIONS_VETERINARIES } from 'kadesh/constants/constans';


export default function VeterinariesPage() {
  const [userLocation, setUserLocation] = useState<
    { lat: number; lng: number } | { lat: null; lng: null } | undefined
  >(undefined);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<PetPlace | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(DEFAULT_RADIUS_VETERINARIES);

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
            ? 'Permiso de ubicación denegado. Activa la ubicación para ver veterinarias cercanas. 🗺️'
            : 'No se pudo obtener tu ubicación';
        setLocationError(message);
        setUserLocation({ lat: null, lng: null });
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const {
    places,
    allPlaces,
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
  } = useNearbyPetPlaces(userLocation, 10, radiusKm);

  const handlePlaceClick = (place: PetPlace | null) => {
    setSelectedPlace(place);
    if (place) {
      const el = document.getElementById(`veterinary-${place.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a] pt-[72px]">
      <Navigation />

      <section className="w-full py-4 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
              Veterinarias cercanas
            </h1>
            <p className="text-sm text-orange-50 max-w-2xl mx-auto">
              Encuentra veterinarias cerca de ti
            </p>
          </motion.div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-140px)] lg:overflow-hidden">
        <div className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-[#1e1e1e] border-t lg:border-r border-[#e0e0e0] dark:border-[#3a3a3a] lg:order-1 lg:h-full">
          <div className="flex-shrink-0 p-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
            <h2 className="text-lg font-bold text-[#212121] dark:text-[#ffffff] mb-2">
              Veterinarias ({totalPlaces})
            </h2>
            {locationLoading && (
              <p className="text-xs text-orange-500 dark:text-orange-400 mb-2">
                Obteniendo tu ubicación...
              </p>
            )}
            {locationError && (
              <p className="text-xs text-red-500 dark:text-red-400 mb-2">{locationError}</p>
            )}
            {hasLocation && !locationError && (
              <>
                <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                  Radio de {radiusKm} km desde tu ubicación
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">Radio:</span>
                  {RADIUS_OPTIONS_VETERINARIES.map((km) => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => setRadiusKm(km)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        radiusKm === km
                          ? 'bg-orange-500 text-white'
                          : 'bg-[#f0f0f0] dark:bg-[#2a2a2a] text-[#212121] dark:text-[#e0e0e0] hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a]'
                      }`}
                    >
                      {km} km
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {(locationLoading || placesLoading) && places.length === 0 ? (
              <div className="space-y-3">
                {locationLoading && (
                  <p className="text-xs text-orange-500 dark:text-orange-400 mb-2">
                    Obteniendo tu ubicación...
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] overflow-hidden bg-[#f5f5f5] dark:bg-[#2a2a2a] animate-pulse"
                    >
                      <div className="aspect-[4/3] bg-[#e0e0e0] dark:bg-[#3a3a3a]" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-[#e0e0e0] dark:bg-[#3a3a3a]" />
                        <div className="h-3 w-1/2 rounded bg-[#e0e0e0] dark:bg-[#3a3a3a]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : places.length === 0 ? (
              <div className="text-center py-12 px-2">
                <p className="text-[#616161] dark:text-[#b0b0b0] mb-3">
                  {locationError
                    ? 'Activa la ubicación en tu navegador para ver veterinarias cerca de ti.'
                    : 'No hay veterinarias en este radio.'}
                </p>
                {hasLocation && !locationError && (
                  <>
                    <p className="text-sm text-[#212121] dark:text-[#e0e0e0] font-medium mb-2">
                      Prueba aumentar el radio de búsqueda
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {RADIUS_OPTIONS_VETERINARIES.filter((km) => km !== radiusKm).map((km) => (
                        <button
                          key={km}
                          type="button"
                          onClick={() => setRadiusKm(km)}
                          className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
                        >
                          {km} km
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 items-stretch">
                  {places.map((place) => (
                    <div
                      key={place.id}
                      id={`veterinary-${place.id}`}
                      onClick={() => handlePlaceClick(place)}
                      className="h-full min-h-0 cursor-pointer"
                    >
                      <VeterinaryCard
                        place={place}
                        isSelected={selectedPlace?.id === place.id}
                        onClick={() => handlePlaceClick(place)}
                      />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
                    <button
                      type="button"
                      onClick={previousPage}
                      disabled={!hasPreviousPage}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#121212] border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
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
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                currentPage === page
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-white dark:bg-[#121212] border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                        if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-1 text-[#616161] dark:text-[#b0b0b0] text-sm">
                              ...
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
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#121212] border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/2 relative min-w-0 h-[350px] lg:h-full flex-shrink-0 lg:order-2">
          <VeterinariesMap
            places={allPlaces}
            selectedPlace={selectedPlace}
            onPlaceClick={handlePlaceClick}
            height="100%"
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
