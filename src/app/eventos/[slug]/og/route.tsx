import { NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { ogFonts } from 'kadesh/core/og-fonts';
import { SITE_URL } from 'kadesh/core/site';
import { eventCategory } from 'kadesh/components/events/constants';
import { eventShareFacts, type EventShareFacts } from 'kadesh/components/events/events-seo';
import { fetchPublicEventBySlug } from 'kadesh/components/events/server';

/**
 * Tarjeta para compartir un evento (WhatsApp, Facebook, X): como la de animales, la foto o el
 * cartel de portada de fondo con un degradado, el tipo de evento, el título, la próxima fecha, el
 * lugar y el costo. Sin foto, un fondo del color del tipo. Si el render falla con la foto, se sirve
 * la portada tal cual; si falla todo, la imagen genérica del sitio.
 */

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const CACHE_CONTROL = 'public, max-age=600, s-maxage=600, stale-while-revalidate=86400';

type Photo = { bytes: ArrayBuffer; contentType: string };

function fallbackResponse() {
  return NextResponse.redirect(`${SITE_URL}/og-image.png`, {
    status: 302,
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}

async function fetchPhoto(url: string | null): Promise<Photo | null> {
  if (!url) return null;
  try {
    const upstream = await fetch(url, { cache: 'no-store' });
    const contentType = upstream.headers.get('content-type') ?? '';
    if (!upstream.ok || !contentType.startsWith('image/')) return null;
    const bytes = await upstream.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_BYTES) return null;
    return { bytes, contentType };
  } catch (error) {
    console.error('Event share image fetch failed:', error);
    return null;
  }
}

async function renderCard(facts: EventShareFacts, photo: Photo | null) {
  const color = eventCategory(facts.category).color;
  const titleSize = facts.title.length > 60 ? 52 : facts.title.length > 30 ? 62 : 74;
  const photoSrc = photo
    ? `data:${photo.contentType};base64,${Buffer.from(photo.bytes).toString('base64')}`
    : null;

  const card = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#0b1530',
          backgroundImage: `linear-gradient(135deg, ${color} 0%, #0b2f7a 70%, #0a1330 100%)`,
          fontFamily: 'Poppins',
        }}
      >
        {photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoSrc}
            alt=""
            width={WIDTH}
            height={HEIGHT}
            style={{ position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, objectFit: 'cover' }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: WIDTH,
            height: HEIGHT,
            backgroundImage: photoSrc
              ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 42%, rgba(0,0,0,0.1) 100%)'
              : 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 60%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: WIDTH,
            height: HEIGHT,
            padding: '48px 64px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  backgroundColor: color,
                  color: '#ffffff',
                  fontSize: 34,
                  fontWeight: 800,
                  padding: '8px 30px',
                  borderRadius: 999,
                  border: '3px solid rgba(255,255,255,0.85)',
                }}
              >
                {facts.categoryLabel}
              </div>
              {facts.status ? (
                <div
                  style={{
                    display: 'flex',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: 34,
                    fontWeight: 800,
                    padding: '8px 30px',
                    borderRadius: 999,
                  }}
                >
                  {facts.status}
                </div>
              ) : null}
            </div>
            <div style={{ display: 'flex', color: '#ffffff', fontSize: 40, fontWeight: 800, letterSpacing: 4 }}>
              KADESH
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                color: '#ffffff',
                fontSize: titleSize,
                fontWeight: 800,
                lineHeight: 1.08,
                maxWidth: 1072,
              }}
            >
              {facts.title}
            </div>
            {facts.when ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 14 }}>
                <div style={{ display: 'flex', color: '#ffffff', fontSize: 38, fontWeight: 800 }}>{facts.when}</div>
                {facts.moreDates ? (
                  <div style={{ display: 'flex', color: '#e5e7eb', fontSize: 28, fontWeight: 700 }}>{facts.moreDates}</div>
                ) : null}
              </div>
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, maxWidth: 820 }}>
                {facts.price ? (
                  <div
                    style={{
                      display: 'flex',
                      backgroundColor: facts.isFree ? '#16a34a' : 'rgba(255,255,255,0.18)',
                      color: '#ffffff',
                      fontSize: 28,
                      fontWeight: 800,
                      padding: '4px 20px',
                      borderRadius: 999,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {facts.price}
                  </div>
                ) : null}
                <div style={{ display: 'flex', color: '#ffd9b8', fontSize: 30, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {facts.place}
                </div>
              </div>
              <div style={{ display: 'flex', color: '#d1d5db', fontSize: 26, fontWeight: 700 }}>pet.kadesh.com.mx</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts: ogFonts() },
  );

  // Forzar el render aquí para poder caer al plan B si Satori rechaza la foto.
  return card.arrayBuffer();
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await fetchPublicEventBySlug(slug);
  if (!event) return fallbackResponse();

  const facts = eventShareFacts(event);
  const photo = await fetchPhoto(facts.coverUrl);

  try {
    const png = await renderCard(facts, photo);
    return new NextResponse(png, { headers: { 'Content-Type': 'image/png', 'Cache-Control': CACHE_CONTROL } });
  } catch (error) {
    console.error('Event share card failed with photo:', error);
  }

  // Formato de foto que el render no acepta: se sirve la portada tal cual.
  if (photo) {
    return new NextResponse(photo.bytes, {
      headers: { 'Content-Type': photo.contentType, 'Cache-Control': CACHE_CONTROL },
    });
  }

  try {
    const png = await renderCard(facts, null);
    return new NextResponse(png, { headers: { 'Content-Type': 'image/png', 'Cache-Control': CACHE_CONTROL } });
  } catch (error) {
    console.error('Event share card failed:', error);
    return fallbackResponse();
  }
}
