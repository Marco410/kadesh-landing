/**
 * Geolocalización solo tras un gesto del usuario (Best Practices / Lighthouse).
 * No llamar getCurrentPosition en mount ni en efectos de carga.
 */

export type GeoCoords = { lat: number; lng: number };

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
 * Pide la posición actual. Debe invocarse desde un click/tap (o equivalente).
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
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      reject,
      options,
    );
  });
}
