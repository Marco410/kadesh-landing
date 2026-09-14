"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useNearbyPetPlaces } from "kadesh/components/veterinaries/hooks/useNearbyPetPlaces";
import HomeVeterinaryCard from "kadesh/components/home/HomeVeterinaryCard";
import { DEFAULT_RADIUS_VETERINARIES } from "kadesh/constants/constans";
import { Routes } from "kadesh/core/routes";
import { gsap, useGSAP, HOME_EASE } from "kadesh/components/home/gsap-register";

const NEARBY_LIMIT = 4;

export default function VeterinariansSection() {
  const rootRef = useRef<HTMLElement>(null);
  const [userLocation, setUserLocation] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  const { allPlaces, loading, hasLocation } = useNearbyPetPlaces(
    userLocation,
    NEARBY_LIMIT,
  );
  const nearbyVets = allPlaces;

  useGSAP(
    () => {
      if (loading || nearbyVets.length === 0) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-vet-card]", {
          y: 28,
          opacity: 0,
          duration: 0.5,
          stagger: { each: 0.08, amount: 0.32 },
          ease: HOME_EASE,
          scrollTrigger: {
            trigger: "[data-vet-grid]",
            start: "top 80%",
            once: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [loading, nearbyVets.length] },
  );

  return (
    <section
      ref={rootRef}
      id="veterinarias"
      className="w-full bg-white py-24 dark:bg-night"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl">
            ¿Dónde encuentro veterinarias cerca de mí?
          </h2>
          <p className="text-lg text-[#5a5a5a] dark:text-[#b0b0b0]">
            KADESH lista veterinarias y establecimientos de mascotas en un radio
            de {DEFAULT_RADIUS_VETERINARIES} km según tu ubicación, para que
            contactes atención profesional cuando un animal la necesita.
          </p>
        </div>

        {loading && (
          <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: NEARBY_LIMIT }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-[#ececec] bg-white dark:border-white/10 dark:bg-night-raised"
              >
                <div className="h-36 animate-pulse bg-[#eef3f8] dark:bg-[#1a2433]" />
                <div className="space-y-3 p-5">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !hasLocation && (
          <p className="mb-10 text-center text-[#5a5a5a] dark:text-[#b0b0b0]">
            Activa tu ubicación para ver veterinarias cercanas a ti.
          </p>
        )}

        {!loading && hasLocation && nearbyVets.length === 0 && (
          <p className="mb-10 text-center text-[#5a5a5a] dark:text-[#b0b0b0]">
            No encontramos veterinarias cercanas en tu zona. Revisa el
            directorio completo.
          </p>
        )}

        {!loading && nearbyVets.length > 0 && (
          <div
            data-vet-grid
            className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {nearbyVets.map((place) => (
              <HomeVeterinaryCard key={place.id} place={place} />
            ))}
          </div>
        )}

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/veterinarias/registro"
            className="inline-flex items-center justify-center rounded-xl bg-kadesh px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-kadesh-600"
          >
            Registra tu veterinaria
          </Link>
          <Link
            href={Routes.veterinaries.index}
            className="inline-flex items-center justify-center rounded-xl border-2 border-kadesh px-8 py-4 text-lg font-bold text-kadesh transition-colors hover:bg-kadesh hover:text-white dark:text-kadesh-300"
          >
            Ver directorio completo →
          </Link>
        </div>
      </div>
    </section>
  );
}
