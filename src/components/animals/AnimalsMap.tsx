'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useTheme } from 'next-themes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon } from '@hugeicons/core-free-icons';
import { LostAnimal } from './types';
import { getStatusColor } from './constants';
import AnimalInfoWindow from './AnimalInfoWindow';
import {
  applyFreeMapThemeClass,
  createFreeMap,
  createStatusPinIcon,
  createUserLocationIcon,
  createMarkerGroup,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  destroyMap,
  fitMapToPoints,
  getLeaflet,
  isDarkMapTheme,
  isMapAlive,
  type LeafletMap,
  type LeafletMarker,
  type LeafletMarkerClusterGroup,
  type LeafletPopup,
} from 'kadesh/components/shared/free-map';
import {
  GEO_OPTIONS_FRESH,
  isGeolocationAvailable,
  readGrantedLocation,
  requestCurrentPosition,
} from 'kadesh/utils/geolocation';
import { useFreeMapStack } from 'kadesh/components/shared/useFreeMapStack';
import MapErrorBoundary from 'kadesh/components/shared/MapErrorBoundary';
import MapFallback from 'kadesh/components/shared/MapFallback';

interface AnimalsMapProps {
  animals: LostAnimal[];
  selectedAnimal?: LostAnimal | null;
  onAnimalClick?: (animal: LostAnimal | null) => void;
  height?: string;
}

/** Sin mapa: los reportes siguen en la lista. */
function AnimalsMapFallback({ height = '600px' }: { height?: string }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <MapFallback hint="No pudimos mostrar el mapa en este navegador. Los reportes siguen en la lista." />
    </div>
  );
}

function AnimalsMapView({
  animals,
  selectedAnimal,
  onAnimalClick,
  height = '600px',
}: AnimalsMapProps) {
  const { resolvedTheme } = useTheme();
  const { ready, unavailable, markUnavailable } = useFreeMapStack();
  const [mounted, setMounted] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useLayoutEffect(() => {
    const stored = readGrantedLocation();
    if (stored) setUserLocation(stored);
  }, []);

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
      if (!L || !isMapAlive(map) || animal.latitude == null || animal.longitude == null) return;

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

    const map = createFreeMap(container, {
      center: [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng],
      zoom: DEFAULT_MAP_ZOOM,
      resolvedTheme,
      onUnavailable: markUnavailable,
    });
    if (!map) return;
    mapRef.current = map;
    clusterRef.current = createMarkerGroup(L, map);

    const onResize = () => {
      if (isMapAlive(map)) map.invalidateSize();
    };
    window.addEventListener('resize', onResize);
    const frame = requestAnimationFrame(onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      closePopup();
      destroyMap(map);
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
    const L = getLeaflet();
    const map = mapRef.current;
    const cluster = clusterRef.current;
    if (!L || !isMapAlive(map) || !cluster) return;

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
    const map = mapRef.current;
    if (!ready || !isMapAlive(map)) return;
    if (selectedAnimal?.latitude != null && selectedAnimal.longitude != null) {
      map.setView(
        [selectedAnimal.latitude, selectedAnimal.longitude],
        Math.max(map.getZoom(), 14)
      );
      openAnimalPopup(selectedAnimal);
      return;
    }
    closePopup();
  }, [selectedAnimal, ready, openAnimalPopup, closePopup]);

  const handleCenterOnUser = useCallback(() => {
    if (!isGeolocationAvailable()) return;
    setIsLocating(true);
    requestCurrentPosition(GEO_OPTIONS_FRESH)
      .then((location) => {
        setUserLocation(location);
        const map = mapRef.current;
        if (isMapAlive(map)) map.setView([location.lat, location.lng], 14);
      })
      .catch(() => {
        alert(
          'No se pudo obtener tu ubicación. Verifica los permisos del navegador.'
        );
      })
      .finally(() => setIsLocating(false));
  }, []);

  if (unavailable) {
    return <AnimalsMapFallback height={height} />;
  }

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

/** Si el mapa truena, solo cae el mapa: la lista de reportes sigue. */
export default function AnimalsMap(props: AnimalsMapProps) {
  return (
    <MapErrorBoundary fallback={<AnimalsMapFallback height={props.height} />}>
      <AnimalsMapView {...props} />
    </MapErrorBoundary>
  );
}
