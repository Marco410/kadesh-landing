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
  className?: string;
}

export default function LogMap({ lat, lng, status, className }: LogMapProps) {
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

    const map = L.map(container, {
      zoomControl: true,
      attributionControl: false,
    }).setView([validLat, validLng], 15);
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
        className={`flex h-full min-h-[280px] w-full items-center justify-center bg-[#f3f5f8] dark:bg-night ${className ?? ''}`}
      >
        <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">Ubicación no disponible</p>
      </div>
    );
  }

  const isDarkMode = mounted && isDarkMapTheme(resolvedTheme);

  return (
    <div
      className={`relative z-0 isolate h-full min-h-[280px] w-full overflow-hidden ${className ?? ''} [&_.leaflet-control-attribution]:hidden [&_.maplibregl-ctrl-attrib]:hidden`}
    >
      <div
        ref={containerRef}
        className={`h-full w-full ${
          isDarkMode ? 'kadesh-free-map--night' : 'kadesh-free-map--standard'
        }`}
      />
      {!ready && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#f7f8fa]/90 dark:bg-night-raised/90">
          <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">Cargando mapa…</p>
        </div>
      )}
    </div>
  );
}
