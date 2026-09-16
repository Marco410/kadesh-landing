'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLostAnimals } from '../animals';
import { getStatusLabel, getStatusColor, getTypeLabel } from '../animals/constants';
import { formatDate } from 'kadesh/utils/format-date';
import { animalDetailHref } from 'kadesh/components/animals/animalSlug';
import { Routes } from 'kadesh/core/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  Location01Icon,
  Calendar02Icon,
  Alert02Icon,
  Image01Icon,
  Search01Icon,
} from '@hugeicons/core-free-icons';
import { gsap, useGSAP, HOME_EASE } from 'kadesh/components/home/gsap-register';

export default function LostDogsSection() {
  const rootRef = useRef<HTMLElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(
    undefined
  );
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

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
  const displayedAnimals = animals.slice(0, 4);

  useGSAP(
    () => {
      if (loading || displayedAnimals.length === 0) return;

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-animal-card]', {
          y: 28,
          opacity: 0,
          duration: 0.5,
          stagger: { each: 0.08, amount: 0.32 },
          ease: HOME_EASE,
          scrollTrigger: {
            trigger: '[data-animal-grid]',
            start: 'top 80%',
            once: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [loading, displayedAnimals.length] }
  );

  return (
    <section
      ref={rootRef}
      id="animales"
      className="w-full bg-[#f7f8fa] py-24 dark:bg-night-raised"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl lg:text-6xl">
            Animales perdidos y en adopción
          </h2>
          <p className="text-lg text-[#5a5a5a] dark:text-[#b0b0b0] sm:text-xl">
            KADESH muestra reportes reales cerca de ti para que puedas ayudar a
            reunir o reubicar a un animal.
          </p>
          {locationPermissionDenied && (
            <p className="mt-6 inline-flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-left text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              <HugeiconsIcon
                icon={Alert02Icon}
                size={18}
                className="mt-0.5 flex-shrink-0"
              />
              <span>
                Las distancias mostradas pueden no ser precisas. Activa la
                ubicación para ver distancias reales.
              </span>
            </p>
          )}
        </div>

        {loading ? (
          <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#1e1e1e]"
              >
                <div className="h-48 animate-pulse bg-[#e8edf3] dark:bg-[#2a3548]" />
                <div className="space-y-3 p-6">
                  <div className="h-6 animate-pulse rounded bg-[#e8edf3] dark:bg-[#2a3548]" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-[#e8edf3] dark:bg-[#2a3548]" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedAnimals.length > 0 ? (
          <div
            data-animal-grid
            className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {displayedAnimals.map((animal) => (
              <article
                key={animal.id}
                data-animal-card
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,35,80,0.1)] dark:border-[#2a2a2a] dark:bg-[#1e1e1e]"
              >
                <div className="relative h-56 w-full overflow-hidden bg-[#e8edf3] dark:bg-[#2a3548]">
                  {animal.image?.url ? (
                    <Image
                      src={animal.image.url}
                      alt={animal.name || 'Animal reportado en KADESH'}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#5a5a5a]">
                      <HugeiconsIcon icon={Image01Icon} size={40} strokeWidth={1.5} aria-hidden="true" />
                    </div>
                  )}
                  <span
                    className="absolute top-3 right-3 z-10 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-md"
                    style={{ backgroundColor: getStatusColor(animal.status) }}
                  >
                    {getStatusLabel(animal.status)}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-4 line-clamp-1 text-xl font-bold text-[#212121] dark:text-white">
                    {animal.name || 'Sin nombre'}
                  </h3>

                  <div className="mb-5 flex-1 space-y-2.5 text-sm text-[#616161] dark:text-[#b0b0b0]">
                    <p className="truncate">
                      {getTypeLabel(animal.type)}
                      {animal.breed && ` • ${animal.breed}`}
                    </p>
                    <p className="flex items-start gap-2">
                      <HugeiconsIcon
                        icon={Location01Icon}
                        size={16}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span className="truncate leading-relaxed">{animal.location}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={Calendar02Icon}
                        size={16}
                        className="flex-shrink-0"
                      />
                      <span>{formatDate(animal.createdAt)}</span>
                    </p>
                    {animal.distance && (
                      <p className="font-medium text-kadesh">
                        {animal.distance < 1
                          ? `${Math.round(animal.distance * 1000)} m de ti`
                          : `${animal.distance.toFixed(1)} km de ti`}
                      </p>
                    )}
                  </div>

                  <Link
                    href={animalDetailHref(animal)}
                    className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-kadesh px-5 py-3 font-semibold text-white transition-colors hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
                  >
                    <span>Ver ficha</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center px-4 py-16 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-kadesh-50 text-kadesh dark:bg-kadesh/15">
              <HugeiconsIcon icon={Search01Icon} size={28} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h3 className="mb-2 text-xl font-bold text-[#121212] dark:text-white">
              Aún no hay reportes cerca
            </h3>
            <p className="mb-6 max-w-md text-[#5a5a5a] dark:text-[#b0b0b0]">
              Publica un animal perdido, encontrado o en adopción para que la comunidad pueda ayudar.
            </p>
            <Link
              href={Routes.animals.new}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-kadesh px-6 py-3 font-semibold text-white hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
            >
              Reportar un animal
            </Link>
          </div>
        )}

        {displayedAnimals.length > 0 && (
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={Routes.animals.new}
              className="inline-flex min-h-14 items-center gap-3 rounded-full bg-kadesh px-8 py-4 text-lg font-bold text-white shadow-[0_12px_32px_color-mix(in_srgb,var(--color-kadesh)_35%,transparent)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
            >
              <span>Reportar animal</span>
            </Link>
            <Link
              href={Routes.animals.index}
              className="inline-flex min-h-14 items-center gap-2 rounded-xl border-2 border-kadesh px-8 py-4 text-lg font-bold text-kadesh transition-colors hover:bg-kadesh hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:text-kadesh-300"
            >
              <span>Ver todos los animales</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
