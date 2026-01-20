"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLostAnimals } from '../animals';
import { LostAnimal } from '../animals/types';
import { getStatusLabel, getStatusColor, ANIMAL_TYPE_LABELS, getTypeLabel } from '../animals/constants';
import { formatDate } from 'kadesh/utils/format-date';
import { Routes } from 'kadesh/core/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { SentIcon } from '@hugeicons/core-free-icons';

export default function LostDogsSection() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  // Get user location on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationPermissionDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationPermissionDenied(false);
      },
      (error) => {
        // Check if permission was denied
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermissionDenied(true);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const { animals, loading } = useLostAnimals(undefined, undefined, userLocation);
  
  // Get first 4 animals
  const displayedAnimals = animals.slice(0, 4);

  return (
    <section id="animales" className="w-full py-20 bg-gray-50 dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Animales perdidos y en adopción
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Ayudemos a encontrarles un hogar
          </p>
          {locationPermissionDenied && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                Las distancias mostradas pueden no ser precisas. Activa los permisos de ubicación para ver distancias reales.
              </span>
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg animate-pulse"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-800" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedAnimals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {displayedAnimals.map((animal, index) => (
              <motion.article
                key={animal.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800">
                  {animal.image?.url ? (
                    <Image
                      src={animal.image.url}
                      alt={animal.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md"
                      style={{ backgroundColor: getStatusColor(animal.status) }}
                    >
                      {getStatusLabel(animal.status)}
                    </span>
                    <button
                      className="p-1.5 rounded-full bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-sm hover:bg-white dark:hover:bg-[#1e1e1e] transition-all text-gray-400 hover:text-red-500"
                      aria-label="Agregar a favoritos"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-[#212121] dark:text-[#ffffff] mb-3">
                    {animal.name || 'Sin nombre'}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-[#616161] dark:text-[#b0b0b0] mb-4">
                    <p className="flex items-center gap-2">
                      <span className="text-base">🐾</span>
                      <span>
                        {getTypeLabel(animal.type)}
                        {animal.breed && ` • ${animal.breed}`}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>📍</span>
                      <span className="truncate">{animal.location}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>🕐</span>
                      <span>{formatDate(animal.createdAt)}</span>
                    </p>
                    {animal.distance && (
                      <p className="flex items-center gap-2">
                        <span>🚗</span>
                        <span>
                          {animal.distance < 1 
                            ? `${Math.round(animal.distance * 1000)} m` 
                            : `${animal.distance.toFixed(1)} km`}
                        </span>
                      </p>
                    )}
                  </div>

                  <Link
                    href={Routes.animals.detail(animal.id)}
                    className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-100"
                  >
                    <HugeiconsIcon icon={SentIcon} size={16} />
                    <span>Detalles</span>
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#616161] dark:text-[#b0b0b0] text-lg">
              No hay animales disponibles en este momento
            </p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/animales"
            className="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Ver todos →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

