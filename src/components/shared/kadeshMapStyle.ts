'use client';

/**
 * Estilo de todos los mapas del sitio: la paleta del mapa ilustrado del hero
 * (`components/home/HeroMap.tsx`), con el mismo fondo, calles, parques y agua en claro y en oscuro,
 * sin puntos de interés ni escudos. Parte de Liberty (OpenFreeMap) y solo cambia colores y
 * visibilidad. `createFreeMap` lo usa por defecto y lo cambia al cambiar el tema.
 *
 * Si el estilo base no se puede bajar, queda la URL de Liberty (sin la paleta).
 */

/** Liberty (OpenFreeMap), sin API key: la base que se recolorea. */
export const LIBERTY_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export type MapTheme = 'light' | 'dark';

type Palette = {
  ground: string;
  landuse: string;
  park: string;
  water: string;
  building: string;
  road: string;
  roadMinor: string;
  casing: string;
  boundary: string;
  label: string;
  labelHalo: string;
};

/** Los mismos colores que `StreetLayer` en `HeroMap.tsx`. Si cambias uno, cambia el otro. */
export const HERO_MAP_PALETTE: Record<MapTheme, Palette> = {
  light: {
    ground: '#eef3f8',
    landuse: '#e8eef5',
    park: '#d5e4d8',
    water: '#dbe6f4',
    building: '#e2e9f1',
    road: '#ffffff',
    roadMinor: '#fbfcfe',
    casing: '#e1e8f0',
    boundary: '#c3cedb',
    label: '#6b7a8f',
    labelHalo: '#eef3f8',
  },
  dark: {
    ground: '#1a2433',
    landuse: '#1c2737',
    park: '#1e3a2a',
    water: '#1c2d48',
    building: '#202c3d',
    road: '#2a3548',
    roadMinor: '#253042',
    casing: '#1a2433',
    boundary: '#33415a',
    label: '#8a98ad',
    labelHalo: '#1a2433',
  },
};

type StyleLayer = {
  id: string;
  type: string;
  'source-layer'?: string;
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
};

type StyleJson = { layers: StyleLayer[] } & Record<string, unknown>;

let baseStylePromise: Promise<StyleJson | null> | null = null;
/** Estilos ya recoloreados por tema: se arman una vez por sesión. */
const themed: Partial<Record<MapTheme, object>> = {};

function loadBaseStyle(): Promise<StyleJson | null> {
  if (!baseStylePromise) {
    baseStylePromise = fetch(LIBERTY_STYLE_URL)
      .then((res) => (res.ok ? (res.json() as Promise<StyleJson>) : null))
      .catch(() => null)
      .then((style) => {
        if (!style) baseStylePromise = null;
        return style;
      });
  }
  return baseStylePromise;
}

const hide = (layer: StyleLayer) => ({ ...layer, layout: { ...layer.layout, visibility: 'none' } });

function recolor(layer: StyleLayer, c: Palette): StyleLayer {
  const id = layer.id;
  const source = layer['source-layer'] ?? '';
  const paint = { ...layer.paint };

  // Fuera lo que la ilustración no tiene: relieve, puntos de interés, escudos, flechas, 3D, vías.
  if (
    layer.type === 'raster' ||
    layer.type === 'fill-extrusion' ||
    source === 'poi' ||
    source === 'aeroway' ||
    source === 'aerodrome_label' ||
    id.includes('shield') ||
    id.includes('one_way') ||
    id.includes('rail') ||
    id === 'road_area_pattern'
  ) {
    return hide(layer);
  }

  if (layer.type === 'background') return { ...layer, paint: { 'background-color': c.ground } };

  if (layer.type === 'fill') {
    delete paint['fill-pattern'];
    delete paint['fill-outline-color'];
    let color = c.landuse;
    if (source === 'water') color = c.water;
    else if (id === 'park' || id.includes('grass') || id.includes('wood') || id.includes('wetland') || id.includes('pitch') || id.includes('cemetery')) color = c.park;
    else if (source === 'building') color = c.building;
    return { ...layer, paint: { ...paint, 'fill-color': color, 'fill-opacity': 1 } };
  }

  if (layer.type === 'line') {
    delete paint['line-pattern'];
    delete paint['line-dasharray'];
    let color = c.road;
    let opacity = 1;
    if (source === 'waterway') color = c.water;
    else if (source === 'park') color = c.park;
    else if (source === 'boundary') {
      color = c.boundary;
      opacity = 0.7;
    } else if (id.includes('casing')) color = c.casing;
    else if (id.includes('minor') || id.includes('service') || id.includes('street') || id.includes('path')) color = c.roadMinor;
    if (id.startsWith('tunnel_')) opacity = 0.5;
    if (id.includes('path_pedestrian')) opacity = 0.6;
    return { ...layer, paint: { ...paint, 'line-color': color, 'line-opacity': opacity } };
  }

  if (layer.type === 'symbol') {
    // Solo nombres de lugares, calles y agua, en tono apagado. Sin íconos.
    const layout = { ...layer.layout };
    delete layout['icon-image'];
    return {
      ...layer,
      layout,
      paint: { ...paint, 'text-color': c.label, 'text-halo-color': c.labelHalo, 'text-halo-width': 1.2 },
    };
  }

  return layer;
}

/** Estilo con la paleta para el tema, o la URL de Liberty si no se pudo bajar. */
export async function kadeshMapStyle(theme: MapTheme): Promise<string | object> {
  if (themed[theme]) return themed[theme]!;
  const base = await loadBaseStyle();
  if (!base) return LIBERTY_STYLE_URL;
  const palette = HERO_MAP_PALETTE[theme];
  themed[theme] = { ...base, layers: base.layers.map((layer) => recolor(layer, palette)) };
  return themed[theme]!;
}

/** El estilo si ya está armado (sin esperar); si no, null. */
export function kadeshMapStyleSync(theme: MapTheme): object | null {
  return themed[theme] ?? null;
}

/**
 * Mientras baja el estilo: solo el color de fondo de la paleta, para que el mapa no parpadee en
 * blanco ni en el color del otro tema.
 */
export function kadeshPlaceholderStyle(theme: MapTheme): object {
  return {
    version: 8,
    sources: {},
    layers: [{ id: 'background', type: 'background', paint: { 'background-color': HERO_MAP_PALETTE[theme].ground } }],
  };
}
