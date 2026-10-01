'use client';

import { useCallback, useLayoutEffect, useState } from 'react';
import {
  GEO_OPTIONS_CACHED,
  geolocationErrorMessage,
  isGeolocationAvailable,
  readGrantedLocation,
  requestCurrentPosition,
  syncGrantedLocation,
  type GeoCoords,
} from 'kadesh/utils/geolocation';

/**
 * Coordenada que sobrevive a la recarga. La primera vez hace falta un click;
 * después se lee lo guardado y, si el navegador ya concedió el permiso, se actualiza sin prompt.
 */
export function useRememberedLocation(
  options: PositionOptions = GEO_OPTIONS_CACHED,
) {
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useLayoutEffect(() => {
    const stored = readGrantedLocation();
    if (stored) setCoords(stored);

    let cancelled = false;
    void syncGrantedLocation().then((result) => {
      if (cancelled) return;
      setPermissionDenied(result.denied);
      setCoords(result.coords);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const request = useCallback(() => {
    if (!isGeolocationAvailable()) {
      setError('La geolocalización no está disponible');
      setPermissionDenied(true);
      setCoords(null);
      return;
    }

    setIsLocating(true);
    setError(null);
    requestCurrentPosition(options)
      .then((next) => {
        setCoords(next);
        setPermissionDenied(false);
        setError(null);
      })
      .catch((err: GeolocationPositionError | Error) => {
        const denied = 'code' in err && err.code === err.PERMISSION_DENIED;
        setPermissionDenied(denied);
        setCoords(null);
        setError(
          'code' in err
            ? geolocationErrorMessage(err)
            : err.message || 'No se pudo obtener tu ubicación',
        );
      })
      .finally(() => setIsLocating(false));
  }, [options]);

  return { coords, permissionDenied, error, isLocating, request };
}
