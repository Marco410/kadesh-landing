"use client";

import dynamic from "next/dynamic";
import MapErrorBoundary from "kadesh/components/shared/MapErrorBoundary";
import MapFallback, { MapLoading } from "kadesh/components/shared/MapFallback";

/** Solo en el navegador: el mapa necesita `window` y WebGL, y no aporta nada al HTML del servidor. */
const LogMap = dynamic(() => import("./LogMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

interface AnimalLocationMapProps {
  lat: number;
  lng: number;
  status: string;
  /** Zona del registro (colonia, ciudad) para el respaldo. */
  label?: string | null;
  className?: string;
}

/**
 * Mapa de un registro de la ficha, aislado del resto: si no se puede dibujar (sin WebGL, como el
 * crawler de vista previa de Meta) o truena, en su lugar sale la zona con "Ver en Google Maps",
 * y fotos, datos, contacto y botones siguen funcionando.
 */
export default function AnimalLocationMap({
  lat,
  lng,
  status,
  label,
  className,
}: AnimalLocationMapProps) {
  return (
    <MapErrorBoundary
      resetKey={`${lat},${lng}`}
      fallback={
        <MapFallback title={label} lat={lat} lng={lng} className={className} />
      }
    >
      <LogMap
        lat={lat}
        lng={lng}
        status={status}
        label={label}
        className={className}
      />
    </MapErrorBoundary>
  );
}
