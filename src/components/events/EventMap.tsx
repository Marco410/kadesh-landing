'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import {
  applyFreeMapThemeClass,
  createBrandPinIcon,
  createFreeMap,
  destroyMap,
  getLeaflet,
  isMapAlive,
} from 'kadesh/components/shared/free-map';
import { useFreeMapStack } from 'kadesh/components/shared/useFreeMapStack';
import MapErrorBoundary from 'kadesh/components/shared/MapErrorBoundary';
import MapFallback from 'kadesh/components/shared/MapFallback';
import { cn } from 'kadesh/utils/cn';

const ZOOM = 15;
const BOX = 'h-64 w-full overflow-hidden rounded-2xl';

interface EventMapProps {
  lat: number;
  lng: number;
  label: string;
  className?: string;
}

function EventMapView({ lat, lng, label, className }: EventMapProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const { ready, unavailable, markUnavailable } = useFreeMapStack();

  useEffect(() => {
    const L = getLeaflet();
    const container = containerRef.current;
    if (!ready || !L || !container || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const map = createFreeMap(container, {
      center: [lat, lng],
      zoom: ZOOM,
      resolvedTheme,
      onUnavailable: markUnavailable,
    });
    if (!map) return;
    L.marker([lat, lng], { icon: createBrandPinIcon(L) }).addTo(map);
    const onResize = () => {
      if (isMapAlive(map)) map.invalidateSize();
    };
    window.addEventListener('resize', onResize);
    const frame = requestAnimationFrame(onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      destroyMap(map);
    };
    // El tema se aplica aparte para no rehacer el mapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, lat, lng, markUnavailable]);

  useEffect(() => {
    if (ready) applyFreeMapThemeClass(containerRef.current, resolvedTheme);
  }, [ready, resolvedTheme]);

  if (unavailable) {
    return <MapFallback title={label} lat={lat} lng={lng} className={cn(BOX, className)} />;
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Mapa: ${label}`}
      className={cn(BOX, 'bg-[#e8edf3] dark:bg-[#2a3548]', className)}
    />
  );
}

/**
 * Mapa chico con el pin del lugar (solo para ver; el mapa no se arrastra con un dedo).
 * Si no se puede dibujar o truena, sale el lugar con "Ver en Google Maps" y el evento sigue.
 */
export default function EventMap(props: EventMapProps) {
  return (
    <MapErrorBoundary
      resetKey={`${props.lat},${props.lng}`}
      fallback={
        <MapFallback
          title={props.label}
          lat={props.lat}
          lng={props.lng}
          className={cn(BOX, props.className)}
        />
      }
    >
      <EventMapView {...props} />
    </MapErrorBoundary>
  );
}
