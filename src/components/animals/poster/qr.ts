import 'server-only';
import { renderSVG } from 'uqr';
import { folioUrl } from './folio';

/**
 * QR del enlace corto del cartel como `data:` SVG (sirve en `<img>` y en Satori). Solo servidor: así
 * `uqr` no entra al bundle del navegador. Corrección media: aguanta un cartel arrugado o mojado.
 */
export function folioQrDataUri(folio: number): string {
  const svg = renderSVG(folioUrl(folio), { ecc: 'M', border: 1 });
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
