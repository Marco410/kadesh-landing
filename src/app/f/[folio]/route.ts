import { NextResponse } from 'next/server';
import { SITE_URL } from 'kadesh/core/site';
import { Routes } from 'kadesh/core/routes';
import { fetchAnimalKeyByFolio } from 'kadesh/components/animals/server';
import { parseFolio } from 'kadesh/components/animals/poster/folio';

/**
 * Enlace corto del QR del cartel: `/f/1234` (o `/f/KP-01234`) → ficha del animal con `?src=cartel`.
 * 308 porque el folio de un reporte no cambia. Folio inválido o borrado → directorio de animales.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ folio: string }> }) {
  const { folio: raw } = await params;
  const folio = parseFolio(decodeURIComponent(raw));
  const key = folio ? await fetchAnimalKeyByFolio(folio) : null;
  if (!key) {
    return NextResponse.redirect(`${SITE_URL}${Routes.animals.index}`, 302);
  }
  return NextResponse.redirect(`${SITE_URL}${Routes.animals.detail(key)}?src=cartel`, 308);
}
