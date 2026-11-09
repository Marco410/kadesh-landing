'use client';

import { Component, type ReactNode } from 'react';
import { isChunkLoadError, reportClientError } from 'kadesh/utils/activity';

interface MapErrorBoundaryProps {
  children: ReactNode;
  /** Lo que se ve si el mapa truena (normalmente `MapFallback`). */
  fallback: ReactNode;
  /** Al cambiar (otro punto), vuelve a intentar con el mapa. */
  resetKey?: string | number;
}

interface MapErrorBoundaryState {
  failed: boolean;
  resetKey?: string | number;
}

/**
 * Si el mapa truena, solo cae el mapa: sale `fallback` y el resto de la pantalla sigue
 * funcionando (sin esto, el error llega a `app/error.tsx` y se va la pantalla completa).
 *
 * Se reporta como `script` (la pantalla no se cayó) o `chunk`; la falta de WebGL y los bots los
 * descarta `reportClientError`.
 */
export default class MapErrorBoundary extends Component<
  MapErrorBoundaryProps,
  MapErrorBoundaryState
> {
  state: MapErrorBoundaryState = { failed: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError(): Partial<MapErrorBoundaryState> {
    return { failed: true };
  }

  static getDerivedStateFromProps(
    props: MapErrorBoundaryProps,
    state: MapErrorBoundaryState
  ): Partial<MapErrorBoundaryState> | null {
    if (props.resetKey === state.resetKey) return null;
    return { failed: false, resetKey: props.resetKey };
  }

  componentDidCatch(error: Error) {
    reportClientError({
      kind: isChunkLoadError(error.message) ? 'chunk' : 'script',
      message: error.message,
      stack: error.stack ?? null,
    });
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
