'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { animalDetailHref } from 'kadesh/components/animals/animalSlug';
import { getStatusColor, getStatusLabel } from 'kadesh/components/animals/constants';
import { animalDisplayName } from 'kadesh/components/animals/animalName';
import {
  applyFreeMapThemeClass,
  createFreeMap,
  createPawPinIcon,
  createUserLocationIcon,
  destroyMap,
  fitMapToPoints,
  getLeaflet,
  isDarkMapTheme,
  isMapAlive,
  type LeafletMap,
} from 'kadesh/components/shared/free-map';
import { useFreeMapStack } from 'kadesh/components/shared/useFreeMapStack';
import type { GeoCoords } from 'kadesh/utils/geolocation';
import type { RecentReport } from './recentReports';

interface HeroLiveMapProps {
  reports: RecentReport[];
  coords: GeoCoords;
  /** Ya se ve: la ilustración de abajo se puede atenuar. */
  onShown?: () => void;
  /** No se pudo dibujar (sin WebGL, sin estilo): se queda la ilustración. */
  onUnavailable?: () => void;
}

/**
 * Mapa real del hero: los reportes activos cerca de quien ve, con la paleta del sitio (la misma de
 * la ilustración, `kadeshMapStyle`) y los pines del mapa ilustrado (`createPawPinIcon`). Sin arrastre ni zoom, porque la página hace
 * scroll encima; cada pin abre su ficha.
 */
export default function HeroLiveMap({ reports, coords, onShown, onUnavailable }: HeroLiveMapProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { ready, unavailable, markUnavailable } = useFreeMapStack();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [shown, setShown] = useState(false);
  const callbacks = useRef({ onShown, onUnavailable });
  callbacks.current = { onShown, onUnavailable };
  const reportsRef = useRef(reports);
  reportsRef.current = reports;

  const dark = isDarkMapTheme(resolvedTheme);
  const reportsKey = reports.map((report) => report.id).join(',');

  useEffect(() => {
    if (unavailable) callbacks.current.onUnavailable?.();
  }, [unavailable]);

  useEffect(() => {
    const L = getLeaflet();
    const container = containerRef.current;
    if (!ready || !container || !L) return;
    let cancelled = false;
    let map: LeafletMap | null = null;

    // Diferido un tick: si el efecto se limpia antes (StrictMode, cambio de datos), no se crea.
    void Promise.resolve().then(() => {
      if (cancelled) return;
      map = createFreeMap(container, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        interactive: false,
        resolvedTheme,
        onUnavailable: markUnavailable,
      });
      if (!map) return;
      mapRef.current = map;

      const points: { lat: number; lng: number }[] = [{ lat: coords.lat, lng: coords.lng }];
      for (const report of reportsRef.current) {
        if (report.lat == null || report.lng == null) continue;
        const title = `${animalDisplayName({ name: report.name, typeName: report.typeName })}, ${getStatusLabel(report.status).toLowerCase()}`;
        const marker = L.marker([report.lat, report.lng], {
          icon: createPawPinIcon(L, getStatusColor(report.status), report.status === 'lost'),
          title,
          alt: title,
          zIndexOffset: report.status === 'lost' ? 200 : 0,
        });
        marker.on('click', () => router.push(animalDetailHref(report)));
        marker.addTo(map);
        points.push({ lat: report.lat, lng: report.lng });
      }
      L.marker([coords.lat, coords.lng], { icon: createUserLocationIcon(L), zIndexOffset: 1000 }).addTo(map);
      fitMapToPoints(map, points);

      setShown(true);
      callbacks.current.onShown?.();
    });

    return () => {
      cancelled = true;
      mapRef.current = null;
      destroyMap(map);
    };
    // Se rehace al cambiar los reportes o la ubicación; el tema lo cambia `applyFreeMapThemeClass`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reportsKey, coords.lat, coords.lng, markUnavailable]);

  useEffect(() => {
    if (shown) applyFreeMapThemeClass(containerRef.current, resolvedTheme);
  }, [shown, resolvedTheme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!shown || !container || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (isMapAlive(mapRef.current)) mapRef.current.invalidateSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [shown]);

  if (unavailable) return null;

  return (
    <div
      ref={containerRef}
      className={`h-full w-full transition-opacity duration-500 [&_.leaflet-control-attribution]:hidden [&_.maplibregl-ctrl-attrib]:hidden ${
        shown ? 'opacity-100' : 'pointer-events-none opacity-0'
      } ${dark ? 'bg-[#1a2433]' : 'bg-[#eef3f8]'}`}
    />
  );
}
