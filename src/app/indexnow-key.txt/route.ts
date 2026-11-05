import { INDEXNOW_KEY } from 'kadesh/core/indexnow';

// Un `route.ts` solo puede exportar handlers y opciones de ruta: la clave vive en `core/indexnow.ts`.
export const dynamic = 'force-static';

export function GET() {
  return new Response(INDEXNOW_KEY, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
