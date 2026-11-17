/**
 * El pin de Kadesh, igual en todos los mapas (Leaflet y la ilustración del hero): círculo del color
 * del estado, borde blanco y una punta abajo que marca el lugar exacto. Adentro, la huella (animales),
 * la «T» (veterinarias) o un punto (lugar elegido, eventos).
 *
 * Círculo y punta son un solo trazo, así el borde blanco rodea todo sin cortes. Sin `'use client'`:
 * lo usan componentes de servidor y de navegador.
 */

export type PinGlyph = 'paw' | 'vet' | 'dot';

/** Medidas del SVG; la punta está en (20, 46). */
export const PIN_WIDTH = 40;
export const PIN_HEIGHT = 48;
export const PIN_TIP: [number, number] = [20, 46];

/** Círculo de radio 18 con centro (20, 20) y la punta hacia (20, 46). */
const PIN_PATH = 'M20 2a18 18 0 0 1 8.5 33.9L20 46l-8.5-10.1A18 18 0 0 1 20 2z';

const GLYPHS: Record<PinGlyph, string> = {
  paw: `<g transform="translate(9 8.6) scale(0.92)" fill="#fff">
      <circle cx="6.5" cy="8" r="2.15"/><circle cx="12" cy="5.6" r="2.2"/><circle cx="17.5" cy="8" r="2.15"/>
      <ellipse cx="12" cy="16.2" rx="5.1" ry="4.4"/></g>`,
  vet: '<path fill="#fff" d="M14.5 13h11v2.6h-4.2V27h-2.6V15.6h-4.2z"/>',
  dot: '<circle cx="20" cy="20" r="6.5" fill="#fff"/>',
};

/** SVG del pin como texto (para `L.divIcon` y para la ilustración). */
export function kadeshPinSvg(color: string, glyph: PinGlyph = 'paw'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PIN_WIDTH} ${PIN_HEIGHT}" width="${PIN_WIDTH}" height="${PIN_HEIGHT}" aria-hidden="true" class="kadesh-pin__svg"><path d="${PIN_PATH}" style="fill:${color}" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>${GLYPHS[glyph]}</svg>`;
}

/**
 * HTML completo del pin: el SVG y, con `pulse`, un aro que late en la punta (el lugar). Las clases
 * `kadesh-pin*` están en `globals.css`.
 */
export function kadeshPinHtml(color: string, glyph: PinGlyph = 'paw', pulse = false): string {
  return `<span class="kadesh-pin" style="--pin-color:${color}">${
    pulse ? '<span class="kadesh-pin__pulse" aria-hidden="true"></span>' : ''
  }${kadeshPinSvg(color, glyph)}</span>`;
}
