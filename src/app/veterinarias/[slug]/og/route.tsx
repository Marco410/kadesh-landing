import { NextResponse } from 'next/server';
import { SITE_URL } from 'kadesh/core/site';
import {
  OG_CONTENT_STYLE,
  OgBrandFooter,
  ogPng,
  ogVariant,
  renderOgCard,
  withOgEdgeCache,
  type OgVariant,
} from 'kadesh/core/og-card';
import { petPlaceShareFacts } from 'kadesh/components/veterinaries/pet-place-seo';
import { fetchPetPlaceForShare } from 'kadesh/components/veterinaries/server';

/**
 * Tarjeta para compartir una veterinaria: degradado de marca, el tipo de lugar, el nombre, la
 * ubicación y la calificación, centrados en la zona segura (ver `kadesh/core/og-card`).
 */

const BRAND = '#216BFA';
const BRAND_DARK = '#0b2f7a';

function fallbackResponse() {
  return NextResponse.redirect(`${SITE_URL}/og-image.png`, {
    status: 302,
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}

type Facts = ReturnType<typeof petPlaceShareFacts>;

function nameSize(name: string) {
  if (name.length <= 16) return 76;
  if (name.length <= 28) return 62;
  return 52;
}

async function renderCard(facts: Facts, variant: OgVariant) {
  const subtitle = [facts.location, facts.ratingLine]
    .filter(Boolean)
    .join('  ·  ');

  return renderOgCard(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        backgroundColor: BRAND_DARK,
        backgroundImage: `linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND} 55%, #0a1f4d 100%)`,
        fontFamily: 'Poppins',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -60,
          width: 420,
          height: 420,
          borderRadius: 999,
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -120,
          left: -80,
          width: 360,
          height: 360,
          borderRadius: 999,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          display: 'flex',
        }}
      />
      <div style={OG_CONTENT_STYLE}>
        <div
          style={{
            display: 'flex',
            backgroundColor: '#ffffff',
            color: BRAND,
            fontSize: 32,
            fontWeight: 800,
            padding: '10px 30px',
            borderRadius: 999,
          }}
        >
          {facts.typeLabel}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div
            style={{
              display: 'block',
              maxWidth: '100%',
              textAlign: 'center',
              color: '#ffffff',
              fontSize: nameSize(facts.name),
              fontWeight: 800,
              lineHeight: 1.1,
              lineClamp: 2,
            }}
          >
            {facts.name}
          </div>
          {subtitle ? (
            <div
              style={{
                display: 'block',
                maxWidth: '100%',
                textAlign: 'center',
                color: '#dbe7ff',
                fontSize: 30,
                fontWeight: 700,
                lineHeight: 1.3,
                marginTop: 16,
                lineClamp: 2,
              }}
            >
              {subtitle}
            </div>
          ) : null}
          <div
            style={{
              display: 'flex',
              color: '#ffd9b8',
              fontSize: 28,
              fontWeight: 700,
              marginTop: 18,
            }}
          >
            {facts.verified
              ? 'Ficha verificada'
              : facts.emergencies
                ? 'Urgencias 24/7'
                : 'Directorio KADESH'}
          </div>
        </div>

        <OgBrandFooter urlColor="#9eb6de" />
      </div>
    </div>,
    variant,
  );
}

async function buildCardResponse(slug: string, variant: OgVariant): Promise<Response> {
  const place = await fetchPetPlaceForShare(slug);
  if (!place) {
    return fallbackResponse();
  }

  try {
    return ogPng(await renderCard(petPlaceShareFacts(place), variant));
  } catch (error) {
    console.error('Pet place share card failed:', error);
    return fallbackResponse();
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const variant = ogVariant(request);
  return withOgEdgeCache(request, variant, () => buildCardResponse(slug, variant));
}
