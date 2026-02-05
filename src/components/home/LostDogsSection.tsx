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
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-4">
            Animales perdidos y en adopción
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Ayudemos a encontrarles un hogar
          </p>
          {locationPermissionDenied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="max-w-md">
                Las distancias mostradas pueden no ser precisas. Activa los permisos de ubicación para ver distancias reales.
              </span>
            </motion.div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {displayedAnimals.map((animal, index) => (
              <motion.article
                key={animal.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white dark:bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 dark:border-[#2a2a2a] transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                <div className="relative h-56 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  {animal.image?.url ? (
                    <Image
                      src={animal.image.url}
                      alt={animal.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    <span
                      className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm border border-white/20"
                      style={{ backgroundColor: getStatusColor(animal.status) }}
                    >
                      {getStatusLabel(animal.status)}
                    </span>
                    <button
                      className="p-2 rounded-full bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md hover:bg-white dark:hover:bg-[#1e1e1e] transition-all text-gray-400 hover:text-red-500 shadow-lg border border-white/20 dark:border-[#3a3a3a]"
                      aria-label="Agregar a favoritos"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-[#212121] dark:text-[#ffffff] mb-4 line-clamp-1">
                    {animal.name || 'Sin nombre'}
                  </h3>
                  
                  <div className="space-y-2.5 text-sm text-[#616161] dark:text-[#b0b0b0] mb-5 flex-1">
                    <p className="flex items-center gap-2.5">
                      <span className="text-base flex-shrink-0">🐾</span>
                      <span className="truncate">
                        {getTypeLabel(animal.type)}
                        {animal.breed && ` • ${animal.breed}`}
                      </span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 mt-0.5">📍</span>
                      <span className="truncate leading-relaxed">{animal.location}</span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <span className="flex-shrink-0">🕐</span>
                      <span>{formatDate(animal.createdAt)}</span>
                    </p>
                    {animal.distance && (
                      <p className="flex items-center gap-2.5">
                        <span className="flex-shrink-0">🚗</span>
                        <span className="font-medium text-orange-500 dark:text-orange-400">
                          {animal.distance < 1 
                            ? `${Math.round(animal.distance * 1000)} m` 
                            : `${animal.distance.toFixed(1)} km`}
                        </span>
                      </p>
                    )}
                  </div>

                  <Link
                    href={Routes.animals.detail(animal.id)}
                    className="mt-auto group/btn flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-100"
                  >
                    <HugeiconsIcon icon={SentIcon} size={18} className="transition-transform group-hover/btn:translate-x-0.5" />
                    <span>Ver Detalles</span>
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-[#2a2a2a] rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#212121] dark:text-[#ffffff] mb-2">
                No hay animales disponibles
              </h3>
              <p className="text-[#616161] dark:text-[#b0b0b0] mb-6">
                Aún no hay animales reportados en este momento. Sé el primero en reportar uno.
              </p>
              <Link
                href={Routes.animals.new}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <HugeiconsIcon icon={SentIcon} size={20} />
                Reportar Animal
              </Link>
            </div>
          </motion.div>
        )}

        {displayedAnimals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={Routes.animals.new}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 active:scale-100"
            >
              <HugeiconsIcon 
                icon={SentIcon} 
                size={24} 
                className="text-white transition-transform group-hover:translate-x-1"
                strokeWidth={1.5}
              />
              <span>Reportar Animal</span>
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </Link>
            <Link
              href={Routes.animals.index}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-[#1e1e1e] hover:bg-orange-500 dark:hover:bg-orange-500 text-orange-500 dark:text-orange-400 hover:text-white border-2 border-orange-500 dark:border-orange-500 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>Ver todos los animales</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

