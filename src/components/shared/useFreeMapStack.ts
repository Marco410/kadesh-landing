'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasWebGLSupport } from 'kadesh/utils/webgl';
import { loadLeafletStack } from 'kadesh/components/shared/free-map';

export type FreeMapStatus = 'loading' | 'ready' | 'unavailable';

/**
 * Carga Leaflet + MapLibre para un mapa. Sin WebGL ni siquiera baja ese código y queda
 * `unavailable`: el componente muestra su respaldo (`MapFallback`) en lugar del mapa. También
 * queda `unavailable` si el código no cargó, o cuando el mapa avisa que falló (`markUnavailable`,
 * que va como `onUnavailable` de `createFreeMap`).
 *
 * Con `enabled = false` espera (p. ej. un mapa dentro de un paso oculto de un formulario).
 */
export function useFreeMapStack(enabled = true) {
  const [status, setStatus] = useState<FreeMapStatus>('loading');

  useEffect(() => {
    if (!enabled) return;
    if (!hasWebGLSupport()) {
      setStatus('unavailable');
      return;
    }
    let cancelled = false;
    loadLeafletStack()
      .then(() => {
        if (!cancelled) setStatus((current) => (current === 'unavailable' ? current : 'ready'));
      })
      .catch((error) => {
        console.error('Leaflet load error', error);
        if (!cancelled) setStatus('unavailable');
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const markUnavailable = useCallback(() => setStatus('unavailable'), []);

  return {
    status,
    ready: status === 'ready',
    unavailable: status === 'unavailable',
    markUnavailable,
  };
}
