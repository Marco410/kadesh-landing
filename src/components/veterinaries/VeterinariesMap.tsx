'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import type { PetPlace } from './types';
import {
  applyFreeMapThemeClass,
  attachFreeMapBaseLayer,
  createMarkerGroup,
  createUserLocationIcon,
  createVeterinaryPinIcon,
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

interface VeterinariesMapProps {
  places: PetPlace[];
  selectedPlace: PetPlace | null;
  onPlaceClick: (place: PetPlace | null) => void;
  height?: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function placeCoords(place: PetPlace) {
  const lat = parseFloat(place.lat);
  const lng = parseFloat(place.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

export default function VeterinariesMap({
  places,
  selectedPlace,
  onPlaceClick,
  height = '100%',
}: VeterinariesMapProps) {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const clusterRef = useRef<LeafletMarkerClusterGroup | null>(null);
  const userMarkerRef = useRef<LeafletMarker | null>(null);
  const popupRef = useRef<LeafletPopup | null>(null);
  const onPlaceClickRef = useRef(onPlaceClick);
  const selectedRef = useRef(selectedPlace);

  onPlaceClickRef.current = onPlaceClick;
  selectedRef.current = selectedPlace;

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
  }, []);

  const openPlacePopup = useCallback(
    (place: PetPlace) => {
      const L = getLeaflet();
      const map = mapRef.current;
      const coords = placeCoords(place);
      if (!L || !map || !coords) return;

      closePopup();
      const dark = isDarkMapTheme(resolvedTheme);
      const distance =
        typeof place.distance === 'number' && !Number.isNaN(place.distance)
          ? place.distance < 1
            ? `${Math.round(place.distance * 1000)} m`
            : `${place.distance.toFixed(1)} km`
          : null;
      const location = [place.municipality, place.state].filter(Boolean).join(', ');
      const name = escapeHtml(place.name?.trim() || 'Veterinaria');
      const locationLabel = escapeHtml(location);
      const addressLabel = place.address ? escapeHtml(place.address) : '';
      const phoneHref = place.phone ? place.phone.replace(/[^\d+]/g, '') : '';
      const phoneLabel = place.phone ? escapeHtml(place.phone) : '';

      const html = `
        <div class="p-3 min-w-[200px] max-w-[280px] ${dark ? 'bg-[#1e1e1e] text-white' : 'bg-white text-[#212121]'}">
          <h3 class="font-bold text-base leading-tight mb-2">${name}</h3>
          ${
            distance
              ? `<p class="text-sm font-medium mb-1.5 text-[var(--color-kadesh)]">${distance} de ti</p>`
              : ''
          }
          ${
            location
              ? `<p class="text-sm mb-1.5 ${dark ? 'text-[#b0b0b0]' : 'text-[#616161]'}">${locationLabel}</p>`
              : place.address
                ? `<p class="text-sm mb-1.5 truncate ${dark ? 'text-[#b0b0b0]' : 'text-[#616161]'}">${addressLabel}</p>`
                : ''
          }
          ${
            place.isOpen
              ? `<span class="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1.5 ${dark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700'}">Abierto</span>`
              : ''
          }
          ${
            phoneHref
              ? `<a href="tel:${phoneHref}" class="block text-sm font-medium hover:underline text-[var(--color-kadesh)]">${phoneLabel}</a>`
              : ''
          }
        </div>
      `;

      const popup = L.popup({
        closeButton: true,
        className: 'kadesh-map-popup',
        offset: [0, -36],
        maxWidth: 300,
      })
        .setLatLng([coords.lat, coords.lng])
        .setContent(html)
        .openOn(map);

      popup.on('remove', () => {
        if (selectedRef.current?.id === place.id) {
          onPlaceClickRef.current(null);
        }
      });
      popupRef.current = popup;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    if (!mounted || !ready) return;
    applyFreeMapThemeClass(containerRef.current, resolvedTheme);
  }, [mounted, ready, resolvedTheme]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
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

    places.forEach((place) => {
      const coords = placeCoords(place);
      if (!coords) return;
      const marker = L.marker([coords.lat, coords.lng], {
        icon: createVeterinaryPinIcon(L),
      });
      marker.on('click', () => onPlaceClickRef.current(place));
      cluster.addLayer(marker);
      points.push(coords);
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
  }, [places, userLocation, ready]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    if (selectedPlace) {
      const coords = placeCoords(selectedPlace);
      if (coords) {
        mapRef.current.setView(
          [coords.lat, coords.lng],
          Math.max(mapRef.current.getZoom(), 14)
        );
        openPlacePopup(selectedPlace);
      }
      return;
    }
    closePopup();
  }, [selectedPlace, ready, openPlacePopup, closePopup]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <div
        ref={containerRef}
        className={`absolute inset-0 h-full w-full ${
          mounted && isDarkMode
            ? 'kadesh-free-map--night'
            : 'kadesh-free-map--standard'
        }`}
        role="application"
        aria-label="Mapa de veterinarias"
      />
      {!ready && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#eef3f8]/90 dark:bg-[#1e2a3a]/90 backdrop-blur-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Cargando mapa…</p>
        </div>
      )}
    </div>
  );
}
