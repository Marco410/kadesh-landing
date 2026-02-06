"use client";

import { useState, useEffect } from 'react';
import { Navigation, Footer } from 'kadesh/components/layout';
import { VeterinaryCard, VeterinariesMap, useNearbyPetPlaces } from 'kadesh/components/veterinaries';
import type { PetPlace } from 'kadesh/components/veterinaries';
import { motion } from 'framer-motion';
import { DEFAULT_RADIUS, DEFAULT_RADIUS_VETERINARIES } from 'kadesh/constants/constans';

export default function VeterinariesPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<PetPlace | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('La geolocalización no está disponible');
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
            ? 'Permiso de ubicación denegado. Activa la ubicación para ver veterinarias cercanas.'
            : 'No se pudo obtener tu ubicación';
        setLocationError(message);
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
  } = useNearbyPetPlaces(userLocation, 10);

  const handlePlaceClick = (place: PetPlace | null) => {
    setSelectedPlace(place);
    if (place) {
      const el = document.getElementById(`veterinary-${place.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
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

      {/* 50/50 layout: left list (2-col grid, pagination), right map */}
      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-140px)] lg:overflow-hidden">
        {/* Left: grid of veterinaries - 50% on desktop */}
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
              <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                Radio de {DEFAULT_RADIUS_VETERINARIES} km desde tu ubicación
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {(locationLoading || placesLoading) && places.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#212121] dark:text-[#ffffff] mb-2">
                  {locationLoading ? 'Obteniendo ubicación...' : 'Cargando veterinarias...'}
                </h3>
              </div>
            ) : places.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#616161] dark:text-[#b0b0b0]">
                  {locationError
                    ? 'Activa la ubicación para ver veterinarias cercanas.'
                    : 'No hay veterinarias en este radio.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 items-stretch">
                  {places.map((place) => (
                    <div
                      key={place.id}
                      id={`veterinary-${place.id}`}
                      onClick={() => handlePlaceClick(place)}
                      className="h-full min-h-0"
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

        {/* Right: map - 50% on desktop */}
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
