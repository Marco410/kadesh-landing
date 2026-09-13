'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { getStatusColor } from '../constants';
import {
  applyFreeMapThemeClass,
  attachFreeMapBaseLayer,
  createStatusPinIcon,
  getLeaflet,
  isDarkMapTheme,
  loadLeafletStack,
  resetLeafletContainer,
  type LeafletMap,
} from 'kadesh/components/shared/free-map';

interface LogMapProps {
  lat: number;
  lng: number;
  status: string;
  height?: string;
}

export default function LogMap({ lat, lng, status, height = '300px' }: LogMapProps) {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  const validLat = useMemo(() => {
    const numLat = typeof lat === 'string' ? parseFloat(lat) : lat;
    return typeof numLat === 'number' && !Number.isNaN(numLat) && Number.isFinite(numLat)
      ? numLat
      : null;
  }, [lat]);

  const validLng = useMemo(() => {
    const numLng = typeof lng === 'string' ? parseFloat(lng) : lng;
    return typeof numLng === 'number' && !Number.isNaN(numLng) && Number.isFinite(numLng)
      ? numLng
      : null;
  }, [lng]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!ready || !container || !L || validLat === null || validLng === null) return;

    resetLeafletContainer(container);

    const map = L.map(container, { zoomControl: true }).setView([validLat, validLng], 15);
    mapRef.current = map;
    attachFreeMapBaseLayer(map);
    applyFreeMapThemeClass(container, resolvedTheme);
    L.marker([validLat, validLng], {
      icon: createStatusPinIcon(L, getStatusColor(status)),
    }).addTo(map);

    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Recreate when the logged point changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, validLat, validLng, status]);

  useEffect(() => {
    if (!mounted || !ready) return;
    applyFreeMapThemeClass(containerRef.current, resolvedTheme);
  }, [mounted, ready, resolvedTheme]);

  if (validLat === null || validLng === null) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-lg bg-[#f5f5f5] dark:bg-[#1e1e1e]"
        style={{ height }}
      >
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">Coordenadas inválidas</p>
      </div>
    );
  }

  const isDarkMode = mounted && isDarkMapTheme(resolvedTheme);

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg" style={{ height }}>
      <div
        ref={containerRef}
        className={`h-full w-full ${
          isDarkMode ? 'kadesh-free-map--night' : 'kadesh-free-map--standard'
        }`}
        style={{ minHeight: height }}
      />
      {!ready && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#eef3f8]/90 dark:bg-[#1e2a3a]/90">
          <p className="text-sm text-gray-600 dark:text-gray-400">Cargando mapa…</p>
        </div>
      )}
    </div>
  );
}
