"use client";

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import {
  applyFreeMapThemeClass,
  createFreeMap,
  destroyMap,
  getBrandColor,
  getLeaflet,
  isMapAlive,
  type LeafletCircle,
  type LeafletMap,
} from 'kadesh/components/shared/free-map';
import { useFreeMapStack } from 'kadesh/components/shared/useFreeMapStack';
import MapFallback from 'kadesh/components/shared/MapFallback';
import { Bone } from 'kadesh/components/ui/skeleton';

type LatLng = { lat: number; lng: number };

interface AlertZoneMapProps {
  /** Centro elegido; `null` si la persona aún no lo eligió. */
  center: LatLng | null;
  /** Dónde abrir el mapa cuando todavía no hay centro. */
  fallbackCenter: LatLng;
  radiusKm: number;
  onCenterChange: (center: LatLng) => void;
}

const FIT_PADDING: [number, number] = [24, 24];

function samePoint(a: LatLng, b: LatLng): boolean {
  return Math.abs(a.lat - b.lat) < 1e-6 && Math.abs(a.lng - b.lng) < 1e-6;
}

/**
 * Mapa con un pin fijo al centro y el círculo del radio. El centro cambia al arrastrar el mapa o
 * al tocar un punto (el mapa se desliza hasta ahí; sin animación con "reducir movimiento").
 */
export default function AlertZoneMap({
  center,
  fallbackCenter,
  radiusKm,
  onCenterChange,
}: AlertZoneMapProps) {
  const { resolvedTheme } = useTheme();
  const { ready, unavailable, markUnavailable } = useFreeMapStack();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const circleRef = useRef<LeafletCircle | null>(null);
  const centerRef = useRef(center);
  const onCenterChangeRef = useRef(onCenterChange);

  centerRef.current = center;
  onCenterChangeRef.current = onCenterChange;

  useEffect(() => {
    const L = getLeaflet();
    const container = containerRef.current;
    if (!ready || !container || mapRef.current || !L) return;

    const start = centerRef.current ?? fallbackCenter;
    const map = createFreeMap(container, {
      center: [start.lat, start.lng],
      zoom: 12,
      resolvedTheme,
      onUnavailable: markUnavailable,
    });
    if (!map) return;
    mapRef.current = map;

    const brand = getBrandColor();
    const circle = L.circle([start.lat, start.lng], {
      radius: radiusKm * 1000,
      color: brand,
      weight: 2,
      fillColor: brand,
      fillOpacity: 0.12,
      interactive: false,
    });
    circle.addTo(map);
    circleRef.current = circle;
    map.fitBounds(circle.getBounds(), { padding: FIT_PADDING });

    const followCenter = () => {
      const { lat, lng } = map.getCenter();
      circle.setLatLng([lat, lng]);
    };
    const commitCenter = () => onCenterChangeRef.current(map.getCenter());
    // El zoom con rueda mueve el centro; solo cuenta si ya había un centro elegido.
    const commitAfterZoom = () => {
      if (centerRef.current) commitCenter();
    };

    // Tocar un punto lo vuelve el centro. Se confirma al terminar de deslizarse: si se confirmara
    // antes, el efecto de `center` haría `setView` a media animación y la cortaría.
    const centerOnClick = (...args: unknown[]) => {
      const point = (args[0] as { latlng?: LatLng } | undefined)?.latlng;
      if (!point) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      map.once('moveend', commitCenter);
      map.panTo(point, { animate: !reduce, duration: 0.45 });
    };

    map.on('move', followCenter);
    map.on('dragend', commitCenter);
    map.on('zoomend', commitAfterZoom);
    map.on('click', centerOnClick);

    const resize = () => {
      if (isMapAlive(map)) map.invalidateSize();
    };
    const frame = requestAnimationFrame(resize);
    const later = window.setTimeout(resize, 250);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(later);
      map.off('move', followCenter);
      map.off('dragend', commitCenter);
      map.off('zoomend', commitAfterZoom);
      map.off('click', centerOnClick);
      destroyMap(map);
      mapRef.current = null;
      circleRef.current = null;
    };
    // El mapa se crea una sola vez; centro y radio se sincronizan abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    applyFreeMapThemeClass(containerRef.current, resolvedTheme);
  }, [ready, resolvedTheme]);

  useEffect(() => {
    const map = mapRef.current;
    const circle = circleRef.current;
    if (!isMapAlive(map) || !circle) return;
    circle.setRadius(radiusKm * 1000);
    map.fitBounds(circle.getBounds(), { padding: FIT_PADDING });
  }, [radiusKm]);

  useEffect(() => {
    const map = mapRef.current;
    if (!isMapAlive(map) || !center) return;
    if (samePoint(map.getCenter(), center)) return;
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center]);

  if (unavailable) {
    return (
      <div className="relative h-72 overflow-hidden rounded-3xl border border-dash-line shadow-dash sm:h-80">
        <MapFallback hint="Este navegador no puede mostrar el mapa. Usa «Mi ubicación» para fijar tu zona." />
      </div>
    );
  }

  return (
    <div className="relative h-72 overflow-hidden rounded-3xl border border-dash-line shadow-dash sm:h-80">
      {!ready ? <Bone kind="box" height="100%" radius={0} className="absolute inset-0" /> : null}
      <div ref={containerRef} className="h-full w-full" />
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-full drop-shadow-[0_8px_16px_rgba(15,35,80,0.28)]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 36 44" className="h-11 w-9">
          <path
            fill="var(--color-kadesh)"
            stroke="#ffffff"
            strokeWidth="2"
            d="M18 2C10.82 2 5 7.82 5 15c0 9.75 13 25.5 13 25.5S31 24.75 31 15C31 7.82 25.18 2 18 2z"
          />
          <circle cx="18" cy="15" r="5.5" fill="#ffffff" />
          <circle cx="18" cy="15" r="3" fill="var(--color-kadesh)" />
        </svg>
      </span>
    </div>
  );
}
