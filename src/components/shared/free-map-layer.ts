'use client';

import { isWebGLError } from 'kadesh/utils/webgl';

/** Lo dispara la capa base cuando MapLibre no pudo usar WebGL, al crearse o después. */
export const GL_UNAVAILABLE_EVENT = 'kadesh:glunavailable';

type GlMap = {
  jumpTo(options: { center: unknown; zoom: number }): void;
  once(type: string, listener: () => void): void;
  on(type: string, listener: (event?: { error?: unknown }) => void): void;
  _actualCanvas?: HTMLElement;
};

type HostMap = {
  getZoom(): number;
  getCenter(): unknown;
  getBounds(): { getNorthWest(): unknown };
  latLngToContainerPoint(latlng: unknown): unknown;
};

/** Lo que se usa aquí de la capa `MaplibreGL` de @maplibre/maplibre-gl-leaflet (0.1.x). */
interface GlLayer {
  _map: HostMap | null;
  _glMap: GlMap | null | undefined;
  _container?: HTMLElement;
  _resizeContainer(): void;
  _zoomEnd(): void;
  fire(type: string, data?: object): unknown;
}

type LayerMethod = (this: GlLayer, ...args: unknown[]) => unknown;

export interface GlLayerClass {
  new (options: object): unknown;
  prototype: Record<string, LayerMethod>;
  extend(props: Record<string, LayerMethod>): GlLayerClass;
}

type SetTransform = (el: HTMLElement, offset: unknown, scale?: number) => void;

/**
 * La capa de MapLibre para Leaflet con dos arreglos al plugin:
 *
 * 1. Si `new maplibregl.Map()` lanza (sin WebGL: crawlers, WebGL desactivado), no tumba la
 *    pantalla: la capa queda inerte y avisa con `GL_UNAVAILABLE_EVENT`. Igual si MapLibre emite
 *    después un `error` de WebGL.
 * 2. Sus callbacks diferidos (throttle de `move`, `requestAnimationFrame` al redimensionar,
 *    `moveend`) revisan que la capa siga montada. El plugin no lo hace: si el mapa se desmonta
 *    antes de que corran, truena con "Cannot read properties of null (reading 'getZoom')" o
 *    "(reading 'jumpTo')".
 */
export function createSafeGlLayer(Base: GlLayerClass, setTransform: SetTransform): GlLayerClass {
  const base = Base.prototype;
  const whileMounted =
    (name: string): LayerMethod =>
    function (this: GlLayer, ...args: unknown[]) {
      if (!this._map || !this._glMap) return undefined;
      return base[name].apply(this, args);
    };

  return Base.extend({
    onAdd(this: GlLayer, ...args: unknown[]) {
      try {
        base.onAdd.apply(this, args);
      } catch (error) {
        this._glMap = null;
        this._container?.remove();
        this.fire(GL_UNAVAILABLE_EVENT, { error });
        return;
      }
      this._glMap?.on('error', (event) => {
        const error = event?.error ?? event;
        if (isWebGLError(error)) {
          this.fire(GL_UNAVAILABLE_EVENT, { error });
          return;
        }
        // Lo mismo que hace MapLibre cuando nadie escucha `error` (p. ej. un tile que no cargó).
        console.error(error);
      });
    },
    onRemove(this: GlLayer, ...args: unknown[]) {
      if (!this._glMap) {
        this._container?.remove();
        return;
      }
      base.onRemove.apply(this, args);
    },
    _update: whileMounted('_update'),
    _pinchZoom: whileMounted('_pinchZoom'),
    _animateZoom: whileMounted('_animateZoom'),
    _zoomEnd: whileMounted('_zoomEnd'),
    // Mismo cuerpo que el del plugin, pero revisa que la capa siga montada cuando corre el frame.
    _transitionEnd(this: GlLayer) {
      if (!this._map || !this._glMap) return;
      window.requestAnimationFrame(() => {
        const map = this._map;
        const gl = this._glMap;
        if (!map || !gl) return;
        const zoom = map.getZoom();
        const center = map.getCenter();
        const offset = map.latLngToContainerPoint(map.getBounds().getNorthWest());
        this._resizeContainer();
        if (gl._actualCanvas) setTransform(gl._actualCanvas, offset, 1);
        gl.once('moveend', () => this._zoomEnd());
        gl.jumpTo({ center, zoom: zoom - 1 });
      });
    },
  });
}
