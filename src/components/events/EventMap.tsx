'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  applyFreeMapThemeClass,
  attachFreeMapBaseLayer,
  createBrandPinIcon,
  getLeaflet,
  loadLeafletStack,
  resetLeafletContainer,
  type LeafletMap,
} from 'kadesh/components/shared/free-map';
import { cn } from 'kadesh/utils/cn';

const ZOOM = 15;

/** Mapa chico con el pin del lugar (solo para ver; el mapa no se arrastra con un dedo). */
export default function EventMap({
  lat,
  lng,
  label,
  className,
}: {
  lat: number;
  lng: number;
  label: string;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadLeafletStack()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((error) => console.error('Leaflet load error', error));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const L = getLeaflet();
    const container = containerRef.current;
    if (!ready || !L || !container || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
    resetLeafletContainer(container);
    const map = L.map(container, { zoomControl: true }).setView([lat, lng], ZOOM);
    mapRef.current = map;
    attachFreeMapBaseLayer(map);
    applyFreeMapThemeClass(container, resolvedTheme);
    L.marker([lat, lng], { icon: createBrandPinIcon(L) }).addTo(map);
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    requestAnimationFrame(onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      map.remove();
      mapRef.current = null;
    };
    // El tema se aplica aparte para no rehacer el mapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, lat, lng]);

  useEffect(() => {
    if (ready) applyFreeMapThemeClass(containerRef.current, resolvedTheme);
  }, [ready, resolvedTheme]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Mapa: ${label}`}
      className={cn('h-64 w-full overflow-hidden rounded-2xl bg-[#e8edf3] dark:bg-[#2a3548]', className)}
    />
  );
}
