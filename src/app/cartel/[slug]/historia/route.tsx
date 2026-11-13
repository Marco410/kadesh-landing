import { ImageResponse } from 'next/og';
import { NextResponse } from 'next/server';
import { SITE_URL } from 'kadesh/core/site';
import { ogFonts } from 'kadesh/core/og-fonts';
import { OG_CACHE_CONTROL, fetchOgPhoto, ogPhotoSrc, withOgEdgeCache, type OgPhoto } from 'kadesh/core/og-card';
import { getStatusColor } from 'kadesh/components/animals/constants';
import { animalShareFacts } from 'kadesh/components/animals/animal-seo';
import { animalCoverUrl, fetchAnimalForShare, type AnimalShareData } from 'kadesh/components/animals/server';
import {
  folioDisplayUrl,
  formatFolio,
  posterCallToAction,
  posterHeadline,
} from 'kadesh/components/animals/poster/folio';
import { folioQrDataUri } from 'kadesh/components/animals/poster/qr';

/**
 * El cartel en formato de historia (1080×1920) para Instagram, Facebook y estados de WhatsApp: foto
 * arriba, titular, datos, QR al enlace corto y folio. Sin teléfono (circula mucho más que el impreso).
 * Caché del edge de 10 min, igual que las tarjetas para compartir.
 */

const WIDTH = 1080;
const HEIGHT = 1920;
const PHOTO_HEIGHT = 1000;

function nameSize(name: string) {
  if (name.length <= 12) return 120;
  if (name.length <= 18) return 92;
  return 72;
}

async function renderStory(animal: AnimalShareData, photo: OgPhoto | null) {
  const facts = animalShareFacts(animal);
  const color = getStatusColor(facts.status);
  const photoSrc = ogPhotoSrc(photo);
  const folio = animal.folio ?? null;
  const kind = [facts.typeLabel, facts.breed]
    .filter((part, index, all) => part && all.indexOf(part) === index)
    .join(' · ');
  const profile = [kind, ...facts.shortTraits].filter(Boolean).join('  ·  ');

  const image = new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          fontFamily: 'Poppins',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '40px 0',
            backgroundColor: color,
            color: '#ffffff',
            fontSize: 110,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          {posterHeadline(facts.status)}
        </div>
        <div style={{ display: 'flex', width: WIDTH, height: PHOTO_HEIGHT, backgroundColor: '#f3f5f8' }}>
          {photoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoSrc}
              alt=""
              width={WIDTH}
              height={PHOTO_HEIGHT}
              style={{ width: WIDTH, height: PHOTO_HEIGHT, objectFit: 'cover' }}
            />
          ) : null}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            padding: '36px 70px 0',
            textAlign: 'center',
            color: '#121212',
          }}
        >
          <div
            style={{
              display: 'block',
              maxWidth: WIDTH - 140,
              fontSize: nameSize(facts.name),
              fontWeight: 800,
              lineHeight: 1.05,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {facts.name}
          </div>
          {profile ? (
            <div style={{ display: 'block', fontSize: 38, fontWeight: 700, color: '#3a3a3a', marginTop: 10, lineClamp: 2 }}>
              {profile}
            </div>
          ) : null}
          {facts.location ? (
            <div
              style={{
                display: 'block',
                maxWidth: WIDTH - 140,
                fontSize: 34,
                color: '#3a3a3a',
                marginTop: 10,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {`Último lugar: ${facts.location}`}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            padding: '30px 70px 60px',
            borderTop: `10px solid ${color}`,
          }}
        >
          {folio ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={folioQrDataUri(folio)} alt="" width={240} height={240} style={{ width: 240, height: 240 }} />
          ) : null}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, color: '#121212' }}>
            <div style={{ display: 'block', fontSize: 38, fontWeight: 800, lineHeight: 1.2 }}>
              {posterCallToAction(facts.status)}
            </div>
            {folio ? (
              <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, color: '#3a3a3a', marginTop: 12 }}>
                {folioDisplayUrl(folio)}
              </div>
            ) : null}
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: '#5a5a5a', marginTop: 8, letterSpacing: 3 }}>
              {`${formatFolio(folio) ? `FOLIO ${formatFolio(folio)} · ` : ''}KADESH PET`}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts: ogFonts() },
  );
  return image.arrayBuffer();
}

function png(bytes: ArrayBuffer) {
  return new Response(bytes, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': OG_CACHE_CONTROL },
  });
}

async function buildStory(slug: string): Promise<Response> {
  const animal = await fetchAnimalForShare(slug);
  if (!animal) {
    return NextResponse.redirect(`${SITE_URL}/og-image.png`, 302);
  }
  const photo = await fetchOgPhoto(animalCoverUrl(animal));
  try {
    return png(await renderStory(animal, photo));
  } catch (error) {
    console.error('Animal story failed with photo:', error);
  }
  try {
    // Formato de foto que Satori no acepta: la historia sale sin foto antes que nada.
    return png(await renderStory(animal, null));
  } catch (error) {
    console.error('Animal story failed:', error);
    return NextResponse.redirect(`${SITE_URL}/og-image.png`, 302);
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return withOgEdgeCache(request, 'full', () => buildStory(slug));
}
