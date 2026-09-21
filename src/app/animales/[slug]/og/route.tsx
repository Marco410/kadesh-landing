import { readFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { SITE_URL } from 'kadesh/core/site';
import { getStatusColor } from 'kadesh/components/animals/constants';
import { animalShareFacts } from 'kadesh/components/animals/animal-seo';
import {
  animalCoverUrl,
  fetchAnimalForShare,
} from 'kadesh/components/animals/server';

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const CACHE_CONTROL =
  'public, max-age=600, s-maxage=600, stale-while-revalidate=86400';

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
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_BYTES) {
      return null;
    }
    return { bytes, contentType };
  } catch (error) {
    console.error('Animal share image fetch failed:', error);
    return null;
  }
}

async function loadFonts() {
  try {
    const [bold, black] = await Promise.all([
      readFile(new URL('./poppins-700.woff', import.meta.url)),
      readFile(new URL('./poppins-800.woff', import.meta.url)),
    ]);
    return [
      { name: 'Poppins', data: bold, weight: 700 as const, style: 'normal' as const },
      { name: 'Poppins', data: black, weight: 800 as const, style: 'normal' as const },
    ];
  } catch (error) {
    console.error('Animal share fonts failed to load:', error);
    return undefined;
  }
}

type Facts = ReturnType<typeof animalShareFacts>;

async function renderCard(facts: Facts, photo: Photo | null) {
  const statusColor = getStatusColor(facts.status);
  const kind = [facts.typeLabel, facts.breed]
    .filter((part, index, all) => part && all.indexOf(part) === index)
    .join(' · ');
  const profile = [kind, ...facts.shortTraits].filter(Boolean).join('  ·  ');
  const location = facts.location ? `Última ubicación: ${facts.location}` : '';
  const nameSize = facts.name.length > 22 ? 64 : facts.name.length > 14 ? 80 : 96;
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
          backgroundColor: '#1a1a1a',
          backgroundImage: `linear-gradient(135deg, #2a2a2a 0%, ${statusColor} 160%)`,
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
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: WIDTH,
              height: HEIGHT,
              objectFit: 'cover',
            }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: WIDTH,
            height: HEIGHT,
            backgroundImage:
              'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 38%, rgba(0,0,0,0.05) 100%)',
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
                backgroundColor: statusColor,
                color: '#ffffff',
                fontSize: 40,
                fontWeight: 800,
                padding: '8px 34px',
                borderRadius: 999,
              }}
            >
              {facts.statusLabel}
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
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {facts.name}
            </div>
            {profile ? (
              <div
                style={{
                  display: 'flex',
                  color: '#f3f4f6',
                  fontSize: 36,
                  fontWeight: 700,
                  marginTop: 8,
                  maxWidth: 1072,
                }}
              >
                {profile}
              </div>
            ) : null}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 14,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  color: '#ffd9b8',
                  fontSize: 30,
                  fontWeight: 700,
                }}
              >
                {location}
              </div>
              <div
                style={{
                  display: 'flex',
                  color: '#d1d5db',
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

  // Forzar el render aquí para poder caer al plan B si Satori rechaza la foto.
  return card.arrayBuffer();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const animal = await fetchAnimalForShare(slug);
  if (!animal) {
    return fallbackResponse();
  }

  const facts = animalShareFacts(animal);
  const photo = await fetchPhoto(animalCoverUrl(animal));

  try {
    const png = await renderCard(facts, photo);
    return new NextResponse(png, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': CACHE_CONTROL },
    });
  } catch (error) {
    console.error('Animal share card failed with photo:', error);
  }

  // Formato de foto no soportado por el render: se sirve la portada tal cual.
  if (photo) {
    return new NextResponse(photo.bytes, {
      headers: {
        'Content-Type': photo.contentType,
        'Cache-Control': CACHE_CONTROL,
      },
    });
  }

  try {
    const png = await renderCard(facts, null);
    return new NextResponse(png, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': CACHE_CONTROL },
    });
  } catch (error) {
    console.error('Animal share card failed:', error);
    return fallbackResponse();
  }
}
