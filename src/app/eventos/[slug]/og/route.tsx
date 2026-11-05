import { NextResponse } from 'next/server';
import { SITE_URL } from 'kadesh/core/site';
import {
  OG_CACHE_CONTROL,
  OG_CONTENT_STYLE,
  OG_HEIGHT,
  OG_SAFE_WIDTH,
  OG_WIDTH,
  OgBrandFooter,
  fetchOgPhoto,
  ogPhotoSrc,
  ogPng,
  ogVariant,
  renderOgCard,
  withOgEdgeCache,
  type OgPhoto,
  type OgVariant,
} from 'kadesh/core/og-card';
import { eventCategory } from 'kadesh/components/events/constants';
import { eventShareFacts, type EventShareFacts } from 'kadesh/components/events/events-seo';
import { fetchPublicEventBySlug } from 'kadesh/components/events/server';

/**
 * Tarjeta para compartir un evento (WhatsApp, Facebook, X): como la de animales, la foto o el
 * cartel de portada de fondo con un degradado, el tipo de evento, el título, la próxima fecha, el
 * lugar y el costo, centrados en la zona segura (ver `kadesh/core/og-card`). Sin foto, un fondo
 * del color del tipo. Si el render falla con la foto, se sirve la portada tal cual; si falla todo,
 * la imagen genérica del sitio.
 */

function fallbackResponse() {
  return NextResponse.redirect(`${SITE_URL}/og-image.png`, {
    status: 302,
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}

function titleSize(title: string) {
  if (title.length > 60) return 46;
  if (title.length > 30) return 56;
  return 68;
}

function Pill({ children, background, border }: { children: string; background: string; border?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: background,
        color: '#ffffff',
        fontSize: 32,
        fontWeight: 800,
        padding: '8px 28px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
        // Satori falla con `border: undefined`: la clave solo va si hay borde.
        ...(border ? { border: '3px solid rgba(255,255,255,0.85)' } : {}),
      }}
    >
      {children}
    </div>
  );
}

async function renderCard(facts: EventShareFacts, photo: OgPhoto | null, variant: OgVariant) {
  const color = eventCategory(facts.category).color;
  const photoSrc = ogPhotoSrc(photo);

  return renderOgCard(
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
          width={OG_WIDTH}
          height={OG_HEIGHT}
          style={{ position: 'absolute', top: 0, left: 0, width: OG_WIDTH, height: OG_HEIGHT, objectFit: 'cover' }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          backgroundImage: photoSrc
            ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.1) 100%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 60%)',
        }}
      />
      <div style={OG_CONTENT_STYLE}>
        <div style={{ display: 'flex', gap: 14 }}>
          <Pill background={color} border>
            {facts.categoryLabel}
          </Pill>
          {facts.status ? <Pill background="#dc2626">{facts.status}</Pill> : null}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div
            style={{
              display: 'block',
              maxWidth: '100%',
              textAlign: 'center',
              color: '#ffffff',
              fontSize: titleSize(facts.title),
              fontWeight: 800,
              lineHeight: 1.08,
              lineClamp: 3,
            }}
          >
            {facts.title}
          </div>
          {facts.when ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 14 }}>
              <div style={{ display: 'flex', color: '#ffffff', fontSize: 36, fontWeight: 800 }}>{facts.when}</div>
              {facts.moreDates ? (
                <div style={{ display: 'flex', color: '#e5e7eb', fontSize: 26, fontWeight: 700 }}>{facts.moreDates}</div>
              ) : null}
            </div>
          ) : null}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              marginTop: 14,
              maxWidth: OG_SAFE_WIDTH,
            }}
          >
            {facts.price ? (
              <div
                style={{
                  display: 'flex',
                  backgroundColor: facts.isFree ? '#16a34a' : 'rgba(255,255,255,0.18)',
                  color: '#ffffff',
                  fontSize: 26,
                  fontWeight: 800,
                  padding: '4px 20px',
                  borderRadius: 999,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {facts.price}
              </div>
            ) : null}
            {facts.place ? (
              <div
                style={{
                  display: 'block',
                  color: '#ffd9b8',
                  fontSize: 28,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 0,
                }}
              >
                {facts.place}
              </div>
            ) : null}
          </div>
          <div style={{ display: 'flex', marginTop: 22 }}>
            <OgBrandFooter />
          </div>
        </div>
      </div>
    </div>,
    variant,
  );
}

async function buildCardResponse(slug: string, variant: OgVariant): Promise<Response> {
  const event = await fetchPublicEventBySlug(slug);
  if (!event) return fallbackResponse();

  const facts = eventShareFacts(event);
  const photo = await fetchOgPhoto(facts.coverUrl);

  try {
    return ogPng(await renderCard(facts, photo, variant));
  } catch (error) {
    console.error('Event share card failed with photo:', error);
  }

  // Formato de foto que el render no acepta: se sirve la portada tal cual.
  if (photo) {
    return new Response(photo.bytes, {
      headers: { 'Content-Type': photo.contentType, 'Cache-Control': OG_CACHE_CONTROL },
    });
  }

  try {
    return ogPng(await renderCard(facts, null, variant));
  } catch (error) {
    console.error('Event share card failed:', error);
    return fallbackResponse();
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const variant = ogVariant(request);
  return withOgEdgeCache(request, variant, () => buildCardResponse(slug, variant));
}
