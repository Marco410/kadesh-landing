import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon } from '@hugeicons/core-free-icons';
import { cn } from 'kadesh/utils/cn';

const DEFAULT_HINT = 'No pudimos mostrar el mapa en este navegador.';

/** Abre el punto en Google Maps (app o web). */
export function googleMapsPlaceUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
}

interface MapFallbackProps {
  /** Zona del punto (colonia, ciudad…). Sin ella dice "Mapa no disponible". */
  title?: string | null;
  /** Con punto, sale el botón "Ver en Google Maps". */
  lat?: number | null;
  lng?: number | null;
  hint?: string;
  className?: string;
}

/**
 * Lo que se ve en lugar del mapa cuando no se puede dibujar: sin WebGL (crawlers de vista previa,
 * WebGL desactivado), el código del mapa no cargó o el mapa falló. Llena el contenedor del mapa.
 */
export default function MapFallback({
  title,
  lat,
  lng,
  hint = DEFAULT_HINT,
  className,
}: MapFallbackProps) {
  const point =
    typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng)
      ? { lat, lng }
      : null;

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-3 bg-[#f3f5f8] px-4 py-6 text-center dark:bg-night',
        className
      )}
    >
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-kadesh-50 text-kadesh dark:bg-kadesh/15">
        <HugeiconsIcon icon={Location01Icon} size={22} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <div className="max-w-xs">
        <p className="line-clamp-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
          {title?.trim() || 'Mapa no disponible'}
        </p>
        <p className="mt-1 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">{hint}</p>
      </div>
      {point ? (
        <a
          href={googleMapsPlaceUrl(point.lat, point.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 lg:min-h-9"
        >
          Ver en Google Maps
        </a>
      ) : null}
    </div>
  );
}

/** Mientras baja el código del mapa (p. ej. el `loading` de `next/dynamic`). */
export function MapLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-[#f7f8fa] dark:bg-night-raised',
        className
      )}
    >
      <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">Cargando mapa…</p>
    </div>
  );
}
