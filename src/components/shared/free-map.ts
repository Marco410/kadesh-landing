'use client';

import { hasWebGLSupport, isWebGLError } from 'kadesh/utils/webgl';
import {
  createSafeGlLayer,
  GL_UNAVAILABLE_EVENT,
  type GlLayerClass,
} from 'kadesh/components/shared/free-map-layer';

/** Liberty (OpenFreeMap) — sin API key. El dark se aplica con filtros CSS. */
export const FREE_MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

export const DEFAULT_MAP_CENTER = { lat: 19.4326, lng: -99.1332 };
export const DEFAULT_MAP_ZOOM = 10;

export function getBrandColor(): string {
  if (typeof window === 'undefined') return '#216BFA';
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-kadesh')
    .trim();
  return value || '#216BFA';
}

function leafletFromWindow(): LeafletLib | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { L?: LeafletLib }).L ?? null;
}

function setWindowLeaflet(L: LeafletLib) {
  (window as unknown as { L: LeafletLib }).L = L;
}

let leafletLoadPromise: Promise<LeafletLib> | null = null;

async function importLeafletStack(): Promise<LeafletLib> {
  const leafletMod = await import('leaflet');
  const L = (leafletMod.default ?? leafletMod) as unknown as LeafletLib;
  setWindowLeaflet(L);

  await import('maplibre-gl');
  const plugin = await import('@maplibre/maplibre-gl-leaflet');
  const GlLayer = (plugin as { MaplibreGL?: unknown }).MaplibreGL as GlLayerClass | undefined;
  const setTransform = L.DomUtil?.setTransform;
  if (GlLayer && setTransform) {
    // La capa del plugin con sus fallas cubiertas (ver `createSafeGlLayer`).
    const SafeGlLayer = createSafeGlLayer(GlLayer, setTransform);
    L.maplibreGL = (options) => new SafeGlLayer(options) as LeafletTileLayer;
  } else {
    const maplibreGL =
      (plugin as { default?: LeafletLib['maplibreGL']; maplibreGL?: LeafletLib['maplibreGL'] })
        .default ?? (plugin as { maplibreGL?: LeafletLib['maplibreGL'] }).maplibreGL;
    if (maplibreGL) {
      L.maplibreGL = maplibreGL;
    }
  }

  return leafletFromWindow() ?? L;
}

export function loadLeafletStack(): Promise<LeafletLib> {
  if (!leafletLoadPromise) {
    leafletLoadPromise = importLeafletStack().catch((err) => {
      leafletLoadPromise = null;
      throw err;
    });
  }
  return leafletLoadPromise;
}

export function loadLeafletCluster(): Promise<LeafletLib> {
  return loadLeafletStack();
}

export interface LeafletLayer {
  addTo(map: LeafletMap): void;
  remove(): void;
  bringToBack?(): LeafletLayer;
  bringToFront?(): LeafletLayer;
  on?(event: string, fn: (event?: { error?: unknown }) => void): LeafletLayer;
}

export type LeafletTileLayer = LeafletLayer;

export interface LeafletMap {
  setView(center: [number, number], zoom: number): LeafletMap;
  getZoom(): number;
  getCenter(): { lat: number; lng: number };
  fitBounds(
    bounds: unknown,
    options?: { padding?: [number, number]; maxZoom?: number }
  ): void;
  on(event: string, fn: (...args: unknown[]) => void): void;
  off(event: string, fn: (...args: unknown[]) => void): void;
  once(event: string, fn: (...args: unknown[]) => void): void;
  panTo(center: { lat: number; lng: number }, options?: { animate?: boolean; duration?: number }): LeafletMap;
  removeLayer(layer: LeafletLayer): LeafletMap;
  invalidateSize(): void;
  remove(): void;
  createPane(name: string): void;
  getPane(name: string): HTMLElement | undefined;
  closePopup(): void;
}

export interface LeafletMarker {
  setLatLng(latlng: [number, number]): LeafletMarker;
  getLatLng(): { lat: number; lng: number };
  addTo(map: LeafletMap | LeafletMarkerClusterGroup): LeafletMarker;
  bringToFront?(): LeafletMarker;
  on(event: string, fn: () => void): LeafletMarker;
  remove(): void;
}

export interface LeafletPopup {
  setLatLng(latlng: [number, number]): LeafletPopup;
  setContent(el: HTMLElement | string): LeafletPopup;
  openOn(map: LeafletMap): LeafletPopup;
  remove(): void;
  on(event: string, fn: () => void): LeafletPopup;
}

export interface LeafletCircle extends LeafletLayer {
  setLatLng(latlng: [number, number]): LeafletCircle;
  setRadius(meters: number): LeafletCircle;
  getBounds(): unknown;
}

export interface LeafletMarkerClusterGroup extends LeafletLayer {
  addLayer(layer: LeafletMarker): void;
  clearLayers(): void;
}

export interface LeafletDivIcon {
  options: {
    className: string;
    html: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
  };
}

export interface LeafletLib {
  map(
    el: HTMLElement,
    options?: { zoomControl?: boolean; attributionControl?: boolean }
  ): LeafletMap;
  divIcon(options: {
    className: string;
    html: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
  }): LeafletDivIcon;
  marker(
    latlng: [number, number],
    options?: { icon: LeafletDivIcon; zIndexOffset?: number; draggable?: boolean }
  ): LeafletMarker;
  popup(options?: {
    closeButton?: boolean;
    offset?: [number, number];
    className?: string;
    maxWidth?: number;
    minWidth?: number;
  }): LeafletPopup;
  latLngBounds(points: [number, number][]): unknown;
  circle(
    latlng: [number, number],
    options: {
      radius: number;
      color?: string;
      weight?: number;
      fillColor?: string;
      fillOpacity?: number;
      interactive?: boolean;
    }
  ): LeafletCircle;
  maplibreGL?: (options: { style: string; pane?: string }) => LeafletTileLayer;
  DomUtil?: {
    setTransform(el: HTMLElement, offset: unknown, scale?: number): void;
  };
  tileLayer?(
    url: string,
    options?: { attribution?: string; pane?: string }
  ): LeafletTileLayer;
  markerClusterGroup?(options?: {
    showCoverageOnHover?: boolean;
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
    disableClusteringAtZoom?: number;
    iconCreateFunction?: (cluster: { getChildCount: () => number }) => LeafletDivIcon;
  }): LeafletMarkerClusterGroup;
}

export function getLeaflet(): LeafletLib | null {
  return leafletFromWindow();
}

export function resetLeafletContainer(container: HTMLElement) {
  const el = container as HTMLElement & { _leaflet_id?: number };
  if (el._leaflet_id) {
    delete el._leaflet_id;
  }
}

type LeafletMapInternals = LeafletMap & { _mapPane?: HTMLElement; _animatingZoom?: boolean };

/**
 * ¿El mapa sigue montado? Leaflet no marca el mapa como quitado: después de `remove()` sus
 * métodos (`invalidateSize`, `setView`, `fitBounds`…) truenan con "reading '_leaflet_pos'".
 * Revísalo en todo lo que corre después de crearlo: frames, timeouts, ResizeObserver y efectos.
 */
export function isMapAlive(map: LeafletMap | null | undefined): map is LeafletMap {
  return Boolean(map && (map as LeafletMapInternals)._mapPane);
}

/** Quita el mapa sin dejar trabajo pendiente que lo toque después. Nunca lanza. */
export function destroyMap(map: LeafletMap | null | undefined) {
  if (!isMapAlive(map)) return;
  // La animación de zoom termina con un setTimeout de 250 ms que mueve el mapa: así ya no corre.
  (map as LeafletMapInternals)._animatingZoom = false;
  try {
    map.remove();
  } catch (error) {
    console.warn('[map] no se pudo quitar el mapa', error);
  }
}

export interface CreateFreeMapOptions {
  center: [number, number];
  zoom: number;
  zoomControl?: boolean;
  attributionControl?: boolean;
  resolvedTheme?: string;
  /**
   * El mapa no se puede dibujar (sin WebGL, o MapLibre falló): el componente muestra su respaldo.
   * Puede llegar después de crear el mapa, si MapLibre avisa de un error de WebGL más tarde.
   */
  onUnavailable: (error?: unknown) => void;
}

/**
 * Crea el mapa de Leaflet con la capa base de MapLibre. Nunca lanza: sin WebGL ni siquiera crea
 * el mapa, y si algo falla quita lo que alcanzó a crear. En ambos casos llama `onUnavailable` y
 * devuelve `null`.
 */
export function createFreeMap(
  container: HTMLElement,
  options: CreateFreeMapOptions
): LeafletMap | null {
  const L = getLeaflet();
  if (!L) return null;
  if (!hasWebGLSupport()) {
    options.onUnavailable();
    return null;
  }

  let reported = false;
  const fail = (error?: unknown) => {
    reported = true;
    options.onUnavailable(error);
  };

  resetLeafletContainer(container);
  let map: LeafletMap | null = null;
  try {
    map = L.map(container, {
      zoomControl: options.zoomControl ?? true,
      // Solo si viene: `undefined` le quitaría a Leaflet su valor por defecto.
      ...(options.attributionControl === undefined
        ? {}
        : { attributionControl: options.attributionControl }),
    }).setView(options.center, options.zoom);
    const base = attachFreeMapBaseLayer(map, { onUnavailable: fail });
    if (!base) {
      destroyMap(map);
      if (!reported) options.onUnavailable();
      return null;
    }
    applyFreeMapThemeClass(container, options.resolvedTheme);
    return map;
  } catch (error) {
    destroyMap(map);
    if (!isWebGLError(error)) console.error('[map] no se pudo crear el mapa', error);
    if (!reported) options.onUnavailable(error);
    return null;
  }
}

export function createMarkerGroup(
  _L: LeafletLib,
  map: LeafletMap
): LeafletMarkerClusterGroup {
  const layers: LeafletMarker[] = [];
  return {
    addTo() {},
    remove() {
      layers.forEach((marker) => marker.remove());
      layers.length = 0;
    },
    addLayer(layer) {
      layer.addTo(map);
      layers.push(layer);
    },
    clearLayers() {
      layers.forEach((marker) => marker.remove());
      layers.length = 0;
    },
  };
}

export function isDarkMapTheme(resolvedTheme: string | undefined): boolean {
  if (
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  ) {
    return true;
  }
  return resolvedTheme === 'dark';
}

export function applyFreeMapThemeClass(
  container: HTMLElement | null,
  resolvedTheme: string | undefined
) {
  if (!container) return;
  const isDark = isDarkMapTheme(resolvedTheme);
  container.classList.toggle('kadesh-free-map--night', isDark);
  container.classList.toggle('kadesh-free-map--standard', !isDark);
}

/**
 * Pone la capa base (MapLibre) en el mapa. Devuelve `null` sin lanzar si no hay WebGL o MapLibre
 * no pudo crear su contexto, y avisa con `onUnavailable` (también si falla después).
 * Para crear un mapa completo usa `createFreeMap`.
 */
export function attachFreeMapBaseLayer(
  map: LeafletMap,
  { onUnavailable }: { onUnavailable?: (error?: unknown) => void } = {}
): LeafletTileLayer | null {
  const L = getLeaflet();
  if (!L) return null;

  map.createPane('kadeshMapBase');
  const basePane = map.getPane('kadeshMapBase');
  if (basePane) basePane.style.zIndex = '200';

  if (L.maplibreGL) {
    if (!hasWebGLSupport()) {
      onUnavailable?.();
      return null;
    }
    const baseLayer = L.maplibreGL({
      style: FREE_MAP_STYLE,
      pane: 'kadeshMapBase',
    });
    let failed = false;
    baseLayer.on?.(GL_UNAVAILABLE_EVENT, (event) => {
      failed = true;
      onUnavailable?.(event?.error);
    });
    baseLayer.addTo(map);
    if (failed) return null;
    baseLayer.bringToBack?.();
    return baseLayer;
  }

  if (L.tileLayer) {
    const raster = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap',
        pane: 'kadeshMapBase',
      }
    );
    raster.addTo(map);
    raster.bringToBack?.();
    return raster;
  }

  return null;
}

const PIN_SIZE = { width: 36, height: 44 } as const;

export function createBrandPinIcon(L: LeafletLib, fill = getBrandColor()) {
  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 44" width="36" height="44" aria-hidden="true">
      <path
        fill="${fill}"
        stroke="#ffffff"
        stroke-width="2"
        d="M18 2C10.82 2 5 7.82 5 15c0 9.75 13 25.5 13 25.5S31 24.75 31 15C31 7.82 25.18 2 18 2z"
      />
      <circle cx="18" cy="15" r="5.5" fill="#ffffff" />
      <circle cx="18" cy="15" r="3" fill="${fill}" />
    </svg>
  `.trim();

  return L.divIcon({
    className: 'kadesh-map-pin-icon',
    html: pinSvg,
    iconSize: [PIN_SIZE.width, PIN_SIZE.height],
    iconAnchor: [PIN_SIZE.width / 2, PIN_SIZE.height],
  });
}

export function createUserLocationIcon(L: LeafletLib) {
  const color = getBrandColor();
  const svg = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="32" height="32" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="${color}" opacity="0.28"/>
      <circle cx="12" cy="12" r="7" fill="${color}" opacity="0.5"/>
      <circle cx="12" cy="12" r="4" fill="#ffffff" stroke="${color}" stroke-width="2"/>
    </svg>
  `.trim();

  return L.divIcon({
    className: 'kadesh-map-pin-icon',
    html: svg,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function createStatusPinIcon(L: LeafletLib, color: string) {
  const teardropPath =
    'M12 2C16.8706 2 21 6.03298 21 10.9258C21 15.8965 16.8033 19.3847 12.927 21.7567C12.6445 21.9162 12.325 22 12 22C11.675 22 11.3555 21.9162 11.073 21.7567C7.2039 19.3616 3 15.9137 3 10.9258C3 6.03298 7.12944 2 12 2Z';
  const svg = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="40" height="40" aria-hidden="true">
      <path d="${teardropPath}" fill="${color}" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="12" cy="10.5" r="3.2" fill="#ffffff"/>
    </svg>
  `.trim();

  return L.divIcon({
    className: 'kadesh-map-pin-icon',
    html: svg,
    iconSize: [40, 40],
    iconAnchor: [20, 38],
  });
}

export function createVeterinaryPinIcon(L: LeafletLib) {
  const color = getBrandColor();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 44" width="36" height="44" aria-hidden="true">
      <path fill="${color}" stroke="#ffffff" stroke-width="2"
        d="M18 2C10.82 2 5 7.82 5 15c0 9.75 13 25.5 13 25.5S31 24.75 31 15C31 7.82 25.18 2 18 2z"/>
      <path fill="#ffffff" d="M13 10h10v2h-4v8h-2v-8h-4z"/>
    </svg>
  `.trim();

  return L.divIcon({
    className: 'kadesh-map-pin-icon',
    html: svg,
    iconSize: [PIN_SIZE.width, PIN_SIZE.height],
    iconAnchor: [PIN_SIZE.width / 2, PIN_SIZE.height],
  });
}

export function fitMapToPoints(
  map: LeafletMap,
  points: { lat: number; lng: number }[]
) {
  const L = getLeaflet();
  if (!L || points.length === 0 || !isMapAlive(map)) return;
  if (points.length === 1) {
    map.setView([points[0].lat, points[0].lng], 13);
    return;
  }
  const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
  map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
}
