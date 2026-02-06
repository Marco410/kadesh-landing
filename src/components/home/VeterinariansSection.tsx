"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useNearbyPetPlaces } from 'kadesh/components/veterinaries/hooks/useNearbyPetPlaces';
import VeterinaryCard from 'kadesh/components/veterinaries/VeterinaryCard';
import { DEFAULT_RADIUS_VETERINARIES } from 'kadesh/constants/constans';

const NEARBY_LIMIT = 4;

export default function VeterinariansSection() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const { allPlaces, loading, hasLocation } = useNearbyPetPlaces(userLocation, NEARBY_LIMIT);
  const nearbyVets = allPlaces;

  return (
    <section id="veterinarias" className="w-full py-20 bg-white dark:bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Veterinarias cercanas
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Profesionales comprometidos con el bienestar animal. Encuentra veterinarias cercanas a ti en un radio de {DEFAULT_RADIUS_VETERINARIES} km.
          </p>
        </motion.div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {Array.from({ length: NEARBY_LIMIT }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse"
              >
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-3" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-3" />
                <div className="flex gap-2 mt-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !hasLocation && (
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
            Activa tu ubicación para ver veterinarias cercanas a ti.
          </p>
        )}

        {!loading && hasLocation && nearbyVets.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
            No encontramos veterinarias cercanas en tu zona. Revisa el directorio completo.
          </p>
        )}

        {!loading && nearbyVets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {nearbyVets.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full min-h-0 overflow-hidden"
              >
                <VeterinaryCard
                  place={place}
                  variant="horizontal"
                  href="/veterinarias"
                />
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/veterinarias/registro"
              className="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Registra tu veterinaria
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/veterinarias"
              className="inline-block px-8 py-4 bg-white dark:bg-[#1e1e1e] border-2 border-orange-500 text-orange-500 dark:text-orange-400 font-bold text-lg rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300"
            >
              Ver directorio completo →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

