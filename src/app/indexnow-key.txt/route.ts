/**
 * Clave de IndexNow (https://www.indexnow.org): con ella Bing y otros buscadores aceptan los avisos
 * que manda kadesh-back cuando se publica, cambia o cancela un evento (`utils/seo/indexNow.ts`).
 * No es secreta: el protocolo pide publicarla. Debe ser la misma que `INDEXNOW_KEY` del backend.
 */
export const INDEXNOW_KEY = '6973631b0c498ed8f41a79e2d4c9211f';

export const dynamic = 'force-static';

export function GET() {
  return new Response(INDEXNOW_KEY, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
