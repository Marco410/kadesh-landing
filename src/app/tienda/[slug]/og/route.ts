import { NextResponse } from 'next/server';
import { fetchStoreProduct } from 'kadesh/components/store/server';
import { SITE_URL } from 'kadesh/core/site';

/**
 * Stable image URL of a product (share cards and the Product JSON-LD). Uploaded photos have a URL
 * that expires in 1 h, so this serves the current cover, like `/blog/<url>/og`. Without a cover, or
 * if the download fails or is too big, the generic image.
 */

export const revalidate = 3600;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';

function fallbackResponse() {
  return NextResponse.redirect(`${SITE_URL}/og-image.png`, {
    status: 302,
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchStoreProduct(slug);
  const source = product?.images[0]?.url || product?.item.coverUrl;
  if (!source) return fallbackResponse();

  try {
    const upstream = await fetch(source, { cache: 'no-store' });
    const contentType = upstream.headers.get('content-type') ?? '';
    const declaredBytes = Number(upstream.headers.get('content-length') || 0);
    if (!upstream.ok || !contentType.startsWith('image/') || declaredBytes > MAX_IMAGE_BYTES) {
      await upstream.body?.cancel();
      return fallbackResponse();
    }

    const body = await upstream.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > MAX_IMAGE_BYTES) return fallbackResponse();

    return new NextResponse(body, {
      headers: { 'Content-Type': contentType, 'Cache-Control': CACHE_CONTROL },
    });
  } catch (error) {
    console.error('Store share image fetch failed:', error);
    return fallbackResponse();
  }
}
