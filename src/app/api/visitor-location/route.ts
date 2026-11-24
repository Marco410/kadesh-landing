import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Approximate location of the visitor (city level, from their IP) as Cloudflare sees it. Only for
 * zone ads on pages without a place of their own (blog, store). It is answered by the worker
 * itself: it never reaches the backend, and the browser keeps it a day (`components/ads/visitorLocation.ts`).
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  let lat: number | null = null;
  let lng: number | null = null;
  try {
    const { cf } = await getCloudflareContext({ async: true });
    const parsedLat = Number.parseFloat(String(cf?.latitude ?? ''));
    const parsedLng = Number.parseFloat(String(cf?.longitude ?? ''));
    if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
      lat = parsedLat;
      lng = parsedLng;
    }
  } catch {
    // Outside Cloudflare (local `next dev`): no location, only national ads.
  }
  return Response.json({ lat, lng }, { headers: { 'cache-control': 'private, max-age=86400' } });
}
