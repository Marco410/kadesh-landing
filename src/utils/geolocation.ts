/**
 * La primera vez, la ubicación solo se pide con un gesto (Best Practices / Lighthouse).
 * Si la persona ya aprobó, la coordenada queda en localStorage y se reutiliza al recargar.
 * Un refresco silencioso solo ocurre si el navegador ya tiene el permiso en «concedido».
 */

export type GeoCoords = { lat: number; lng: number };

const GRANTED_LOCATION_KEY = 'kadesh-granted-location';

function isCoord(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= max;
}

export function readGrantedLocation(): GeoCoords | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(GRANTED_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GeoCoords>;
    if (!isCoord(parsed.lat, 90) || !isCoord(parsed.lng, 180)) return null;
    return { lat: parsed.lat, lng: parsed.lng };
  } catch {
    return null;
  }
}

export function rememberGrantedLocation(coords: GeoCoords): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GRANTED_LOCATION_KEY, JSON.stringify(coords));
  } catch {
    // Modo privado o almacenamiento lleno: la sesión igual usa la coordenada en memoria.
  }
}

export function clearGrantedLocation(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(GRANTED_LOCATION_KEY);
  } catch {
    // Sin almacenamiento no hay nada que borrar.
  }
}

export async function geolocationPermissionState(): Promise<
  PermissionState | 'unknown'
> {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return 'unknown';
  }
  try {
    const status = await navigator.permissions.query({
      name: 'geolocation' as PermissionName,
    });
    return status.state;
  } catch {
    return 'unknown';
  }
}

export const GEO_OPTIONS_FRESH: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

export const GEO_OPTIONS_CACHED: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300_000,
};

export function isGeolocationAvailable(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.geolocation);
}

export function geolocationErrorMessage(error: GeolocationPositionError): string {
  if (error.code === error.PERMISSION_DENIED) {
    return 'Permiso de ubicación denegado. Actívala en el navegador para ver resultados cerca de ti.';
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return 'No se pudo obtener tu ubicación.';
  }
  return 'Se agotó el tiempo al obtener tu ubicación. Intenta de nuevo.';
}

/**
 * Pide la posición actual. La primera vez debe invocarse desde un click/tap.
 * Si el permiso ya está concedido, también sirve para refrescar sin mostrar el prompt.
 */
export function requestCurrentPosition(
  options: PositionOptions = GEO_OPTIONS_FRESH,
): Promise<GeoCoords> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationAvailable()) {
      reject(new Error('La geolocalización no está disponible'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        rememberGrantedLocation(coords);
        resolve(coords);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) clearGrantedLocation();
        reject(error);
      },
      options,
    );
  });
}

function isPermissionDenied(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as GeolocationPositionError).code === 1
  );
}

let syncInflight: Promise<{ coords: GeoCoords | null; denied: boolean }> | null =
  null;

/**
 * Restaura la ubicación ya aprobada. No muestra el prompt del navegador.
 */
export function syncGrantedLocation(): Promise<{
  coords: GeoCoords | null;
  denied: boolean;
}> {
  if (syncInflight) return syncInflight;

  syncInflight = (async () => {
    const stored = readGrantedLocation();
    const state = await geolocationPermissionState();

    if (state === 'denied') {
      clearGrantedLocation();
      return { coords: null, denied: true };
    }

    if (state !== 'granted') {
      return { coords: stored, denied: false };
    }

    try {
      const fresh = await requestCurrentPosition(GEO_OPTIONS_CACHED);
      return { coords: fresh, denied: false };
    } catch (error) {
      if (isPermissionDenied(error)) {
        return { coords: null, denied: true };
      }
      return { coords: stored, denied: false };
    }
  })().finally(() => {
    syncInflight = null;
  });

  return syncInflight;
}
