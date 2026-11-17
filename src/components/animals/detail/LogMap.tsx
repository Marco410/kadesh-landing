"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { getStatusColor } from "../constants";
import {
  applyFreeMapThemeClass,
  createFreeMap,
  createSightingDotIcon,
  createStatusPinIcon,
  destroyMap,
  fitMapToPoints,
  getLeaflet,
  isDarkMapTheme,
  isMapAlive,
} from "kadesh/components/shared/free-map";
import { useFreeMapStack } from "kadesh/components/shared/useFreeMapStack";
import MapFallback from "kadesh/components/shared/MapFallback";
import { sightingTimeLabel } from "../sightings/time";

/** Un «Lo vi» en el mapa de la ficha. */
export interface MapSightingPoint {
  id: string;
  latitude: number;
  longitude: number;
  seenAt: string | null;
  place: string | null;
}

/** La línea al más reciente y el encuadre solo cuentan avistamientos de las últimas 72 h. */
const RECENT_SIGHTING_MS = 72 * 60 * 60 * 1000;

function isRecent(sighting: MapSightingPoint) {
  if (!sighting.seenAt) return false;
  const time = new Date(sighting.seenAt).getTime();
  return Number.isFinite(time) && Date.now() - time <= RECENT_SIGHTING_MS;
}

interface LogMapProps {
  lat: number;
  lng: number;
  status: string;
  /** Zona del registro (colonia, ciudad) para el respaldo cuando no se puede dibujar el mapa. */
  label?: string | null;
  className?: string;
  /** «Lo vi» visibles del reporte, el más reciente primero. */
  sightings?: MapSightingPoint[];
}

function toCoordinate(value: number | string): number | null {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return typeof num === "number" && Number.isFinite(num) ? num : null;
}

/**
 * Mapa de un registro. Úsalo con `AnimalLocationMap`, que lo carga solo en el navegador y lo
 * aísla con un error boundary. Sin WebGL no crea el mapa y muestra la zona con "Ver en Google Maps".
 */
export default function LogMap({ lat, lng, status, label, className, sightings }: LogMapProps) {
  const { resolvedTheme } = useTheme();
  const { ready, unavailable, markUnavailable } = useFreeMapStack();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const validLat = toCoordinate(lat);
  const validLng = toCoordinate(lng);
  // Llave estable: el mapa se rehace solo si cambian los avistamientos, no en cada render.
  const sightingsKey = (sightings ?? []).map((sighting) => sighting.id).join(",");
  const sightingsRef = useRef(sightings);
  sightingsRef.current = sightings;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const L = getLeaflet();
    const container = containerRef.current;
    if (!ready || !container || !L || validLat === null || validLng === null)
      return;

    const map = createFreeMap(container, {
      center: [validLat, validLng],
      zoom: 15,
      attributionControl: false,
      resolvedTheme,
      onUnavailable: markUnavailable,
    });
    if (!map) return;

    L.marker([validLat, validLng], {
      icon: createStatusPinIcon(L, getStatusColor(status)),
    }).addTo(map);

    // «Lo vi»: un punto con ojo por avistamiento (los viejos, tenues) y una línea punteada del pin
    // al más reciente si es de las últimas 72 h. El encuadre incluye los recientes.
    const color = getStatusColor(status);
    const points = sightingsRef.current ?? [];
    const recent = points.filter(isRecent);
    if (recent.length > 0) {
      L.polyline(
        [[validLat, validLng], [recent[0].latitude, recent[0].longitude]],
        { color, weight: 2, opacity: 0.7, dashArray: "4 6", interactive: false }
      ).addTo(map);
    }
    points.forEach((sighting, index) => {
      const when = sightingTimeLabel(sighting.seenAt).toLowerCase();
      const text = `Lo vieron ${when}${sighting.place ? ` · ${sighting.place}` : ""}`;
      L.marker([sighting.latitude, sighting.longitude], {
        icon: createSightingDotIcon(L, color, index > 0 || !isRecent(sighting)),
        title: text,
        alt: text,
        zIndexOffset: index === 0 ? 200 : 0,
      }).addTo(map);
    });
    if (recent.length > 0) {
      fitMapToPoints(map, [
        { lat: validLat, lng: validLng },
        ...recent.map((sighting) => ({ lat: sighting.latitude, lng: sighting.longitude })),
      ]);
    }

    const resize = () => {
      if (isMapAlive(map)) map.invalidateSize();
    };
    const frame = requestAnimationFrame(resize);
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    observer?.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      destroyMap(map);
    };
    // Recreate when the logged point changes; el tema se aplica aparte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, validLat, validLng, status, sightingsKey, markUnavailable]);

  useEffect(() => {
    if (!mounted || !ready) return;
    applyFreeMapThemeClass(containerRef.current, resolvedTheme);
  }, [mounted, ready, resolvedTheme]);

  if (validLat === null || validLng === null) {
    return (
      <div
        className={`flex h-full min-h-0 w-full items-center justify-center bg-[#f3f5f8] dark:bg-night ${className ?? ""}`}
      >
        <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
          Ubicación no disponible
        </p>
      </div>
    );
  }

  if (unavailable) {
    return (
      <MapFallback
        title={label}
        lat={validLat}
        lng={validLng}
        className={className}
      />
    );
  }

  const isDarkMode = mounted && isDarkMapTheme(resolvedTheme);

  return (
    <div
      className={`relative z-0 isolate h-full min-h-0 w-full overflow-hidden ${className ?? ""} [&_.leaflet-control-attribution]:hidden [&_.maplibregl-ctrl-attrib]:hidden`}
    >
      <div
        ref={containerRef}
        className={`h-full w-full ${
          isDarkMode ? "kadesh-free-map--night" : "kadesh-free-map--standard"
        }`}
      />
      {!ready && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#f7f8fa]/90 dark:bg-night-raised/90">
          <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            Cargando mapa…
          </p>
        </div>
      )}
    </div>
  );
}
