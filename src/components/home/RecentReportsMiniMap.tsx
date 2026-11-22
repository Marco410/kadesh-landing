'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, MapsLocation01Icon } from '@hugeicons/core-free-icons';
import { getStatusColor } from 'kadesh/components/animals/constants';
import {
  applyFreeMapThemeClass,
  createFreeMap,
  createStatusPinIcon,
  createUserLocationIcon,
  DEFAULT_MAP_CENTER,
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

interface RecentReportsMiniMapProps {
  reports: RecentReport[];
  /** Ubicación de quien ve, si ya la compartió (punto azul). */
  coords?: GeoCoords | null;
  /** A dónde lleva al tocarlo: el directorio con el mismo filtro. */
  href: string;
}

/**
 * Mapa chico bajo «Reportes recientes» con los pines de los cuadros que se ven. No se arrastra ni
 * hace zoom: todo el recuadro es un enlace al mapa completo de `/animales`.
 *
 * Leaflet y MapLibre solo se bajan cuando el mapa está por entrar a la pantalla
 * (IntersectionObserver): quien no baja hasta aquí no los descarga.
 */
export default function RecentReportsMiniMap({ reports, coords, href }: RecentReportsMiniMapProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [inView, setInView] = useState(false);
  const { resolvedTheme } = useTheme();
  const { ready, unavailable, markUnavailable } = useFreeMapStack(inView);

  const points = reports.filter((report) => report.lat != null && report.lng != null);
  const hasPoints = points.length > 0;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // Sin puntos no hay recuadro que observar: se engancha cuando llegan.
  }, [inView, hasPoints]);
  // Llave estable: el mapa se rehace solo si cambian los reportes o la ubicación.
  const pointsKey = `${points.map((report) => report.id).join(',')}|${coords?.lat ?? ''},${coords?.lng ?? ''}`;
  const pointsRef = useRef(points);
  pointsRef.current = points;

  useEffect(() => {
    const L = getLeaflet();
    const container = containerRef.current;
    if (!ready || !container || !L) return;
    // Decorativo: los pines no reciben foco ni se leen; el enlace de encima es lo navegable.
    container.setAttribute('inert', '');

    const map = createFreeMap(container, {
      center: [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
      resolvedTheme,
      onUnavailable: markUnavailable,
    });
    if (!map) return;
    mapRef.current = map;

    const bounds: { lat: number; lng: number }[] = [];
    for (const report of pointsRef.current) {
      L.marker([report.lat!, report.lng!], {
        icon: createStatusPinIcon(L, getStatusColor(report.status)),
      }).addTo(map);
      bounds.push({ lat: report.lat!, lng: report.lng! });
    }
    if (coords) {
      L.marker([coords.lat, coords.lng], { icon: createUserLocationIcon(L) }).addTo(map);
      bounds.push({ lat: coords.lat, lng: coords.lng });
    }
    fitMapToPoints(map, bounds);

    return () => {
      mapRef.current = null;
      destroyMap(map);
    };
    // `resolvedTheme` se aplica aparte; los puntos van por `pointsKey`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pointsKey, markUnavailable]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!ready) {
      // Before the map exists: only the classes (the backdrop color while it loads).
      const night = isDarkMapTheme(resolvedTheme);
      container.classList.toggle('kadesh-free-map--night', night);
      container.classList.toggle('kadesh-free-map--standard', !night);
      return;
    }
    applyFreeMapThemeClass(container, resolvedTheme);
  }, [ready, resolvedTheme, unavailable]);

  useEffect(() => {
    // Por si la sección cambia de tamaño (filtros, ventana) con el mapa ya dibujado.
    const container = containerRef.current;
    if (!ready || !container || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (isMapAlive(mapRef.current)) mapRef.current.invalidateSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [ready]);

  // Sin coordenadas no hay mapa que dibujar: queda el enlace de texto.
  if (!hasPoints) {
    return (
      <div className="mb-10 text-center">
        <Link
          href={href}
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
        >
          Ver todos en el mapa
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    );
  }
  return (
    <div
      ref={wrapperRef}
      className="relative -mx-4 mb-10 h-56 overflow-hidden bg-[#e8edf3] dark:bg-[#1e2a3a] sm:mx-0 sm:h-64 sm:rounded-2xl sm:border sm:border-[#ececec] sm:dark:border-white/10"
    >
      {!unavailable ? (
        <div
          ref={containerRef}
          aria-hidden="true"
          // The theme class is set in an effect: the server does not know the theme, and a class that
          // differs between server and browser is a hydration error.
          className="pointer-events-none absolute inset-0 [&_.leaflet-control-attribution]:hidden [&_.maplibregl-ctrl-attrib]:hidden"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[#5a5a5a] dark:text-[#9aa3b2]">
          <HugeiconsIcon icon={MapsLocation01Icon} size={40} strokeWidth={1.4} aria-hidden="true" />
        </div>
      )}
      <Link
        href={href}
        className="group absolute inset-0 z-[2] flex items-end justify-center p-4 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-kadesh"
      >
        <span className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/95 px-4 text-sm font-semibold text-kadesh-700 shadow-[0_8px_24px_rgba(15,35,80,0.18)] transition-transform group-hover:-translate-y-0.5 dark:bg-night/95 dark:text-kadesh-300">
          <HugeiconsIcon icon={MapsLocation01Icon} size={18} strokeWidth={1.8} aria-hidden="true" />
          Ver todos en el mapa
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
