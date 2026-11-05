import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { ImageResponse } from 'next/og';
import { ogFonts } from 'kadesh/core/og-fonts';

/**
 * Piezas compartidas de las tarjetas para compartir (`app/<sección>/[slug]/og/route.tsx`).
 *
 * - **Zona segura**: Facebook en móvil muestra la tarjeta de un enlace recortada a ~1.3:1 y se
 *   pierden ~190 px por lado (se leía «ido» en vez de «Perdido»). Todo lo importante va centrado en
 *   una columna de `OG_SAFE_WIDTH`; los lados solo llevan fondo.
 * - **Variante WhatsApp**: WhatsApp arma la vista previa en el teléfono de quien comparte, con poco
 *   tiempo y un tope de peso (~300 KB). A 1200×630 un PNG con foto pasa de 900 KB y la vista previa
 *   salía vacía. A WhatsApp (y a Signal, que se presenta igual) se le manda la misma tarjeta a la
 *   mitad de escala (~¼ del peso). `?v=wa` la fuerza para revisarla en el navegador.
 * - **Caché del edge**: un reporte se comparte muchas veces seguidas; sin caché cada vista previa
 *   volvía a pedir los datos, bajar la foto original y renderizar (~4 s).
 */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_SAFE_WIDTH = 760;
/** Padding lateral que deja el contenido dentro de la zona segura. */
export const OG_SAFE_PADDING_X = (OG_WIDTH - OG_SAFE_WIDTH) / 2;
export const OG_CACHE_CONTROL =
  'public, max-age=600, s-maxage=600, stale-while-revalidate=86400';

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const WHATSAPP_UA = /WhatsApp/i;

export type OgVariant = 'full' | 'wa';
export type OgPhoto = { bytes: ArrayBuffer; contentType: string };

export function ogVariant(request: Request): OgVariant {
  const forced = new URL(request.url).searchParams.get('v') === 'wa';
  return forced || WHATSAPP_UA.test(request.headers.get('user-agent') ?? '') ? 'wa' : 'full';
}

/** Propiedades de estilo sin unidad: no se escalan. */
const UNITLESS_STYLES = new Set([
  'lineHeight',
  'fontWeight',
  'opacity',
  'flex',
  'flexGrow',
  'flexShrink',
  'zIndex',
  'lineClamp',
]);
const PX_VALUE = /(-?\d*\.?\d+)px/g;

function scaleStyleValue(key: string, value: unknown, scale: number): unknown {
  if (typeof value === 'number') return UNITLESS_STYLES.has(key) ? value : value * scale;
  if (typeof value === 'string') {
    return value.replace(PX_VALUE, (_, amount: string) => `${parseFloat(amount) * scale}px`);
  }
  return value;
}

type ScalableProps = {
  style?: Record<string, unknown>;
  children?: ReactNode;
  width?: unknown;
  height?: unknown;
};

/**
 * Copia el árbol de la tarjeta con todas las medidas multiplicadas por `scale` (números y valores
 * en `px` de los estilos, y `width`/`height` de las imágenes). Así Satori la maqueta de forma nativa
 * al tamaño chico; con `transform: scale()` los recortes (`overflow: hidden`, elipsis) se
 * calculaban sin escalar y se perdían textos. Los componentes de la tarjeta son funciones puras
 * (sin hooks), así que se expanden aquí.
 */
function scaleNode(node: ReactNode, scale: number): ReactNode {
  if (Array.isArray(node)) return node.map((child) => scaleNode(child, scale));
  if (!isValidElement<ScalableProps>(node)) return node;
  if (typeof node.type === 'function') {
    const render = node.type as (props: ScalableProps) => ReactNode;
    return scaleNode(render(node.props), scale);
  }
  const { style, children, width, height } = node.props;
  const props: ScalableProps = {};
  if (style) {
    props.style = Object.fromEntries(
      Object.entries(style).map(([key, value]) => [key, scaleStyleValue(key, value, scale)]),
    );
  }
  if (typeof width === 'number') props.width = width * scale;
  if (typeof height === 'number') props.height = height * scale;
  if (children !== undefined) props.children = scaleNode(children, scale);
  return cloneElement(node, props);
}

/**
 * Renderiza una tarjeta diseñada a 1200×630. Para WhatsApp la maqueta directamente a la mitad
 * (no se reescala un PNG), así que texto y foto salen nítidos.
 */
export async function renderOgCard(card: ReactElement, variant: OgVariant): Promise<ArrayBuffer> {
  const scale = variant === 'wa' ? 0.5 : 1;
  const root = scale === 1 ? card : (scaleNode(card, scale) as ReactElement);
  const image = new ImageResponse(root, {
    width: Math.round(OG_WIDTH * scale),
    height: Math.round(OG_HEIGHT * scale),
    fonts: ogFonts(),
  });
  // Forzar el render aquí para que quien llama pueda caer al plan B si Satori rechaza una foto.
  return image.arrayBuffer();
}

export function ogPng(bytes: ArrayBuffer) {
  return new Response(bytes, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': OG_CACHE_CONTROL },
  });
}

/** Caché del edge de Cloudflare (solo existe en el worker; en `next dev` se omite). */
function edgeCache(): Cache | null {
  const storage = (globalThis as { caches?: CacheStorage & { default?: Cache } }).caches;
  return storage?.default ?? null;
}

/**
 * Sirve la tarjeta desde la caché del edge (10 min, una entrada por variante y por parámetros de
 * la URL) o la construye y la guarda. Solo se guardan respuestas 200 (no las redirecciones a la
 * imagen genérica).
 */
export async function withOgEdgeCache(
  request: Request,
  variant: OgVariant,
  build: () => Promise<Response>,
): Promise<Response> {
  const keyUrl = new URL(request.url);
  keyUrl.searchParams.set('v', variant);
  keyUrl.searchParams.sort();
  const key = new Request(keyUrl.toString());
  const cache = edgeCache();

  try {
    const cached = await cache?.match(key);
    if (cached) return withVary(cached);
  } catch (error) {
    console.error('Share card cache read failed:', error);
  }

  const response = await build();
  if (cache && response.status === 200) {
    try {
      await cache.put(key, response.clone());
    } catch (error) {
      console.error('Share card cache write failed:', error);
    }
  }
  return withVary(response);
}

function withVary(response: Response) {
  const copy = new Response(response.body, response);
  copy.headers.set('Vary', 'User-Agent');
  return copy;
}

export async function fetchOgPhoto(url: string | null | undefined): Promise<OgPhoto | null> {
  if (!url) return null;
  try {
    const upstream = await fetch(url, { cache: 'no-store' });
    const contentType = upstream.headers.get('content-type') ?? '';
    if (!upstream.ok || !contentType.startsWith('image/')) return null;
    const bytes = await upstream.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_PHOTO_BYTES) return null;
    return { bytes, contentType };
  } catch (error) {
    console.error('Share card photo fetch failed:', error);
    return null;
  }
}

export function ogPhotoSrc(photo: OgPhoto | null): string | null {
  return photo
    ? `data:${photo.contentType};base64,${Buffer.from(photo.bytes).toString('base64')}`
    : null;
}

/** Pie común de todas las tarjetas: la marca y el dominio, centrados dentro de la zona segura. */
export function OgBrandFooter({ urlColor = '#d1d5db' }: { urlColor?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <div style={{ display: 'flex', color: '#ffffff', fontSize: 32, fontWeight: 800, letterSpacing: 4 }}>
        KADESH
      </div>
      <div style={{ display: 'flex', width: 8, height: 8, borderRadius: 999, backgroundColor: urlColor }} />
      <div style={{ display: 'flex', color: urlColor, fontSize: 26, fontWeight: 700 }}>
        pet.kadesh.com.mx
      </div>
    </div>
  );
}

/** Contenedor del contenido: columna centrada en la zona segura, de arriba (pastillas) a abajo (pie). */
export const OG_CONTENT_STYLE = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: OG_WIDTH,
  height: OG_HEIGHT,
  padding: `44px ${OG_SAFE_PADDING_X}px 40px`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  textAlign: 'center',
} as const;
