'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useTheme } from 'next-themes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon } from '@hugeicons/core-free-icons';
import { LostAnimal } from './types';
import { getStatusColor } from './constants';
import AnimalInfoWindow from './AnimalInfoWindow';
import {
  applyFreeMapThemeClass,
  attachFreeMapBaseLayer,
  createStatusPinIcon,
  createUserLocationIcon,
  createMarkerGroup,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  fitMapToPoints,
  getLeaflet,
  isDarkMapTheme,
  loadLeafletCluster,
  resetLeafletContainer,
  type LeafletMap,
  type LeafletMarker,
  type LeafletMarkerClusterGroup,
  type LeafletPopup,
} from 'kadesh/components/shared/free-map';

interface AnimalsMapProps {
  animals: LostAnimal[];
  selectedAnimal?: LostAnimal | null;
  onAnimalClick?: (animal: LostAnimal | null) => void;
  height?: string;
}

export default function AnimalsMap({
  animals,
  selectedAnimal,
  onAnimalClick,
  height = '600px',
}: AnimalsMapProps) {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const clusterRef = useRef<LeafletMarkerClusterGroup | null>(null);
  const userMarkerRef = useRef<LeafletMarker | null>(null);
  const popupRef = useRef<LeafletPopup | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const selectedRef = useRef(selectedAnimal);
  const onAnimalClickRef = useRef(onAnimalClick);

  selectedRef.current = selectedAnimal;
  onAnimalClickRef.current = onAnimalClick;

  const isDarkMode = mounted && isDarkMapTheme(resolvedTheme);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadLeafletCluster()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => console.error('Leaflet load error', err));
    return () => {
      cancelled = true;
    };
  }, []);

  const closePopup = useCallback(() => {
    popupRef.current?.remove();
    popupRef.current = null;
    popupRootRef.current?.unmount();
    popupRootRef.current = null;
  }, []);

  const openAnimalPopup = useCallback(
    (animal: LostAnimal) => {
      const L = getLeaflet();
      const map = mapRef.current;
      if (!L || !map || animal.latitude == null || animal.longitude == null) return;

      closePopup();

      const container = document.createElement('div');
      const popup = L.popup({
        closeButton: false,
        className: 'kadesh-map-popup',
        offset: [0, -36],
        maxWidth: 300,
        minWidth: 260,
      })
        .setLatLng([animal.latitude, animal.longitude])
        .setContent(container)
        .openOn(map);

      popup.on('remove', () => {
        popupRootRef.current?.unmount();
        popupRootRef.current = null;
        if (selectedRef.current?.id === animal.id) {
          onAnimalClickRef.current?.(null);
        }
      });

      popupRef.current = popup;
      const root = createRoot(container);
      popupRootRef.current = root;
      root.render(
        <AnimalInfoWindow
          animal={animal}
          isDarkMode={isDarkMapTheme(resolvedTheme)}
          onClose={() => {
            onAnimalClickRef.current?.(null);
            closePopup();
          }}
        />
      );
    },
    [closePopup, resolvedTheme]
  );

  useEffect(() => {
    const L = getLeaflet();
    const container = containerRef.current;
    if (!ready || !container || !L) return;

    resetLeafletContainer(container);

    const map = L.map(container, { zoomControl: true }).setView(
      [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng],
      DEFAULT_MAP_ZOOM
    );
    mapRef.current = map;
    attachFreeMapBaseLayer(map);
    applyFreeMapThemeClass(container, resolvedTheme);
    clusterRef.current = createMarkerGroup(L, map);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    requestAnimationFrame(onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      closePopup();
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      userMarkerRef.current = null;
    };
    // Map instance is created once when Leaflet is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    if (!mounted || !ready) return;
    applyFreeMapThemeClass(containerRef.current, resolvedTheme);
  }, [mounted, ready, resolvedTheme]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [mounted]);

  useEffect(() => {
    const L = getLeaflet();
    const map = mapRef.current;
    const cluster = clusterRef.current;
    if (!L || !map || !cluster) return;

    cluster.clearLayers();

    const points: { lat: number; lng: number }[] = [];

    animals
      .filter((animal) => animal.latitude != null && animal.longitude != null)
      .forEach((animal) => {
        const marker = L.marker([animal.latitude!, animal.longitude!], {
          icon: createStatusPinIcon(L, getStatusColor(animal.status)),
        });
        marker.on('click', () => {
          onAnimalClickRef.current?.(animal);
        });
        cluster.addLayer(marker);
        points.push({ lat: animal.latitude!, lng: animal.longitude! });
      });

    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: createUserLocationIcon(L),
          zIndexOffset: 1000,
        }).addTo(map);
      }
      points.push(userLocation);
    }

    fitMapToPoints(map, points);
  }, [animals, userLocation, ready]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    if (selectedAnimal?.latitude != null && selectedAnimal.longitude != null) {
      mapRef.current.setView(
        [selectedAnimal.latitude, selectedAnimal.longitude],
        Math.max(mapRef.current.getZoom(), 14)
      );
      openAnimalPopup(selectedAnimal);
      return;
    }
    closePopup();
  }, [selectedAnimal, ready, openAnimalPopup, closePopup]);

  const handleCenterOnUser = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        mapRef.current?.setView([location.lat, location.lng], 14);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert(
          'No se pudo obtener tu ubicación. Verifica los permisos del navegador.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return (
    <div className="relative w-full overflow-hidden shadow-lg" style={{ height }}>
      <div
        ref={containerRef}
        className={`absolute inset-0 h-full w-full ${
          mounted && isDarkMode
            ? 'kadesh-free-map--night'
            : 'kadesh-free-map--standard'
        }`}
        role="application"
        aria-label="Mapa de animales reportados"
      />
      {!ready && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#eef3f8]/90 dark:bg-[#1e2a3a]/90 backdrop-blur-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Cargando mapa…</p>
        </div>
      )}
      {mounted && typeof navigator !== 'undefined' && navigator.geolocation && (
        <button
          type="button"
          onClick={handleCenterOnUser}
          disabled={isLocating || !ready}
          className="absolute bottom-4 left-4 z-10 rounded-full border border-gray-200 bg-white/95 p-3 text-gray-700 shadow-lg transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-[#1e1e1e] dark:text-gray-200"
          title="Centrar en mi ubicación"
          aria-label="Centrar mapa en mi ubicación"
        >
          <HugeiconsIcon
            icon={Location01Icon}
            size={22}
            className={isLocating ? 'animate-pulse text-kadesh' : undefined}
          />
        </button>
      )}
    </div>
  );
}
