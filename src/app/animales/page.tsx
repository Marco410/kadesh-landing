"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation, Footer } from 'kadesh/components/layout';
import { AnimalCard, AnimalFilters, AnimalsMap, useLostAnimals, LostAnimal } from 'kadesh/components/animals';
import { useUser } from 'kadesh/utils/UserContext';
import { ConfirmModal } from 'kadesh/components/shared';
import { motion } from 'framer-motion';
import { Routes } from 'kadesh/core/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { AddCircleIcon } from '@hugeicons/core-free-icons';
import { useTheme } from 'next-themes';
import { DEFAULT_RADIUS } from 'kadesh/constants/constans';

export default function LostAnimalsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [selectedAnimal, setSelectedAnimal] = useState<LostAnimal | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const isDarkMode = mounted && resolvedTheme === 'dark';

  // Get user location on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('La geolocalización no está disponible en tu navegador');
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
        let errorMessage = 'No se pudo obtener tu ubicación';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación para ver animales cercanos.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación';
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Don't use cached location
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
  } = useLostAnimals(undefined, undefined, userLocation);

  const handleAnimalClick = (animal: LostAnimal | null) => {
    setSelectedAnimal(animal);
    if (animal) {
      // Scroll to animal card
      const element = document.getElementById(`animal-${animal.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleReportAnimalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (userLoading) {
      return; // Wait for user to load
    }
    
    if (!user) {
      // Show modal to confirm redirect to login
      setShowLoginModal(true);
    } else {
      router.push( Routes.animals.new);
    }
  };

  const handleConfirmLogin = () => {
    setShowLoginModal(false);
    router.push(`${Routes.auth.login}?redirect=${Routes.animals.new}&tab=register`);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
      <Navigation />
      
      {/* Hero Section - Compact */}
      <section className="w-full py-4 bg-gradient-to-br from-orange-500 to-orange-600 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
              Animales Perdidos y en Adopción
            </h1>
            <p className="text-sm text-orange-50 max-w-2xl mx-auto">
              Ayudemos a encontrarles un hogar
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Button - Fixed Bottom Center */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <motion.button
          onClick={handleReportAnimalClick}
          disabled={userLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-6 py-4 rounded-full shadow-2xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HugeiconsIcon 
            icon={AddCircleIcon} 
            size={25} 
            className="text-white"
            strokeWidth={1.5}
          />
          Reportar Animal
        </motion.button>
      </div>

      {/* Main Content - Map and Cards Layout */}
      {/* Mobile: Map first, then cards below. Desktop: Cards left, map right */}
      <div className="flex flex-col md:flex-row md:h-[calc(100vh-140px)] md:overflow-hidden">
        {/* Map Section - First on mobile, right on desktop */}
        <div className="w-full md:flex-1 relative min-w-0 h-[350px] md:h-full md:order-2 flex-shrink-0">
          <AnimalsMap
            animals={allAnimals}
            selectedAnimal={selectedAnimal}
            onAnimalClick={handleAnimalClick}
            height="100%"
          />
        </div>

        {/* Left Sidebar - Filters and Cards - Below on mobile, left on desktop */}
        <div className="w-full md:w-80 lg:w-[380px] xl:w-[420px] flex flex-col bg-white dark:bg-[#1e1e1e] md:border-r border-t md:border-t-0 border-[#e0e0e0] dark:border-[#3a3a3a] flex-shrink-0 md:order-1 md:h-full">
          {/* Filters Section */}
          <div className="flex-shrink-0 p-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#212121] dark:text-[#ffffff] mb-2">
                Animales ({totalAnimals})
              </h2>
              {locationLoading && (
                <p className="text-xs text-orange-500 dark:text-orange-400 mb-2">
                  Obteniendo tu ubicación...
                </p>
              )}
              {locationError && (
                <p className="text-xs text-red-500 dark:text-red-400 mb-2">
                  {locationError}
                </p>
              )}
              {userLocation && !locationError && (
                <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                  Mostrando animales cercanos a tu ubicación en un radio de {DEFAULT_RADIUS} km
                </p>
              )}
            </div>
            <AnimalFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Cards List - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(locationLoading || animalsLoading) && animals.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <h3 className="text-lg font-bold text-[#212121] dark:text-[#ffffff] mb-2">
                  {locationLoading ? 'Obteniendo tu ubicación...' : 'Cargando animales...'}
                </h3>
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                  Por favor espera
                </p>
              </div>
            ) : animals.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-[#212121] dark:text-[#ffffff] mb-2">
                  No se encontraron animales reportados
                </h3>
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mb-4">
                  {locationError 
                    ? 'No se pudo obtener tu ubicación. Intenta ajustar los filtros o permite el acceso a tu ubicación.'
                    : 'Intenta ajustar los filtros'}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                {animals.map((animal, index) => (
                  <div
                    key={animal.id}
                    id={`animal-${animal.id}`}
                    onClick={() => handleAnimalClick(animal)}
                  >
                    <AnimalCard
                      isDarkMode={isDarkMode}
                      animal={animal}
                      index={index}
                      variant="horizontal"
                      isSelected={selectedAnimal?.id === animal.id}
                    />
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
                    <button
                      onClick={previousPage}
                      disabled={!hasPreviousPage}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#121212] border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
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
                              onClick={() => goToPage(page)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-white dark:bg-[#121212] border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-1 text-[#616161] dark:text-[#b0b0b0] text-sm">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={nextPage}
                      disabled={!hasNextPage}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#121212] border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Login Required Modal */}
      <ConfirmModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onConfirm={handleConfirmLogin}
        title="Inicio de sesión requerido"
        message="Debes iniciar sesión o registrarte para reportar un animal. ¿Deseas ser redirigido a la página de registro?"
        confirmText="Ir a registro"
        cancelText="Cancelar"
      />

      <Footer />
    </main>
  );
}
