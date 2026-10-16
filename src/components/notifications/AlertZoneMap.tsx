"use client";

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  applyFreeMapThemeClass,
  attachFreeMapBaseLayer,
  getBrandColor,
  getLeaflet,
  loadLeafletStack,
  resetLeafletContainer,
  type LeafletCircle,
  type LeafletMap,
} from 'kadesh/components/shared/free-map';
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
 * Mapa con un pin fijo al centro y el círculo del radio. Al arrastrar el mapa cambia el centro.
 */
export default function AlertZoneMap({
  center,
  fallbackCenter,
  radiusKm,
  onCenterChange,
}: AlertZoneMapProps) {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const circleRef = useRef<LeafletCircle | null>(null);
  const centerRef = useRef(center);
  const onCenterChangeRef = useRef(onCenterChange);

  centerRef.current = center;
  onCenterChangeRef.current = onCenterChange;

  useEffect(() => {
    let cancelled = false;
    loadLeafletStack()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => console.error('Leaflet load error', err));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const L = getLeaflet();
    const container = containerRef.current;
    if (!ready || !container || mapRef.current || !L) return;

    resetLeafletContainer(container);
    const start = centerRef.current ?? fallbackCenter;
    const map = L.map(container, { zoomControl: true }).setView([start.lat, start.lng], 12);
    mapRef.current = map;
    attachFreeMapBaseLayer(map);
    applyFreeMapThemeClass(container, resolvedTheme);

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

    map.on('move', followCenter);
    map.on('dragend', commitCenter);
    map.on('zoomend', commitAfterZoom);

    requestAnimationFrame(() => map.invalidateSize());
    const later = window.setTimeout(() => map.invalidateSize(), 250);

    return () => {
      window.clearTimeout(later);
      map.off('move', followCenter);
      map.off('dragend', commitCenter);
      map.off('zoomend', commitAfterZoom);
      map.remove();
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
    if (!map || !circle) return;
    circle.setRadius(radiusKm * 1000);
    map.fitBounds(circle.getBounds(), { padding: FIT_PADDING });
  }, [radiusKm]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center) return;
    if (samePoint(map.getCenter(), center)) return;
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center]);

  return (
    <div className="relative h-72 overflow-hidden rounded-2xl border border-[#ececec] dark:border-white/10 sm:h-80">
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
