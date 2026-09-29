import { readFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { SITE_URL } from 'kadesh/core/site';
import { petPlaceShareFacts } from 'kadesh/components/veterinaries/pet-place-seo';
import { fetchPetPlaceForShare } from 'kadesh/components/veterinaries/server';

const WIDTH = 1200;
const HEIGHT = 630;
const BRAND = '#216BFA';
const BRAND_DARK = '#0b2f7a';
const CACHE_CONTROL =
  'public, max-age=600, s-maxage=600, stale-while-revalidate=86400';

function fallbackResponse() {
  return NextResponse.redirect(`${SITE_URL}/og-image.png`, {
    status: 302,
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}

async function loadFonts() {
  try {
    const [bold, black] = await Promise.all([
      readFile(new URL('./poppins-700.woff', import.meta.url)),
      readFile(new URL('./poppins-800.woff', import.meta.url)),
    ]);
    return [
      {
        name: 'Poppins',
        data: bold,
        weight: 700 as const,
        style: 'normal' as const,
      },
      {
        name: 'Poppins',
        data: black,
        weight: 800 as const,
        style: 'normal' as const,
      },
    ];
  } catch (error) {
    console.error('Pet place share fonts failed to load:', error);
    return undefined;
  }
}

type Facts = ReturnType<typeof petPlaceShareFacts>;

async function renderCard(facts: Facts) {
  const nameSize =
    facts.name.length > 28 ? 52 : facts.name.length > 18 ? 64 : 76;
  const subtitle = [facts.location, facts.ratingLine]
    .filter(Boolean)
    .join('  ·  ');

  const card = new ImageResponse(
    (
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                backgroundColor: '#ffffff',
                color: BRAND,
                fontSize: 32,
                fontWeight: 800,
                padding: '10px 28px',
                borderRadius: 999,
              }}
            >
              {facts.typeLabel}
            </div>
            <div
              style={{
                display: 'flex',
                color: '#ffffff',
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: 4,
              }}
            >
              KADESH
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                color: '#ffffff',
                fontSize: nameSize,
                fontWeight: 800,
                lineHeight: 1.1,
                maxWidth: 1072,
              }}
            >
              {facts.name}
            </div>
            {subtitle ? (
              <div
                style={{
                  display: 'flex',
                  color: '#dbe7ff',
                  fontSize: 32,
                  fontWeight: 700,
                  marginTop: 16,
                  maxWidth: 1072,
                }}
              >
                {subtitle}
              </div>
            ) : null}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 28,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  color: '#ffd9b8',
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {facts.verified
                  ? 'Ficha verificada'
                  : facts.emergencies
                    ? 'Urgencias 24/7'
                    : 'Directorio KADESH'}
              </div>
              <div
                style={{
                  display: 'flex',
                  color: '#9eb6de',
                  fontSize: 26,
                  fontWeight: 700,
                }}
              >
                pet.kadesh.com.mx
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts: await loadFonts() },
  );

  return card.arrayBuffer();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const place = await fetchPetPlaceForShare(slug);
  if (!place) {
    return fallbackResponse();
  }

  const facts = petPlaceShareFacts(place);

  try {
    const png = await renderCard(facts);
    return new NextResponse(png, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': CACHE_CONTROL },
    });
  } catch (error) {
    console.error('Pet place share card failed:', error);
    return fallbackResponse();
  }
}
