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
import { getStatusColor } from 'kadesh/components/animals/constants';
import { animalShareFacts } from 'kadesh/components/animals/animal-seo';
import {
  animalCoverUrl,
  fetchAnimalForShare,
} from 'kadesh/components/animals/server';

/**
 * Tarjeta para compartir un animal: la foto de portada de fondo con un degradado, el estado, el
 * nombre, sus rasgos y la última ubicación, centrados en la zona segura (ver `kadesh/core/og-card`).
 * Si el render falla con la foto, se sirve la portada tal cual; si falla todo, la imagen genérica.
 */

function fallbackResponse() {
  return NextResponse.redirect(`${SITE_URL}/og-image.png`, {
    status: 302,
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}

type Facts = ReturnType<typeof animalShareFacts>;

/** El nombre va en una línea: el tamaño baja con el largo para que quepa en la zona segura. */
function nameSize(name: string) {
  if (name.length <= 11) return 96;
  if (name.length <= 15) return 76;
  if (name.length <= 19) return 62;
  return 52;
}

async function renderCard(facts: Facts, photo: OgPhoto | null, variant: OgVariant) {
  const statusColor = getStatusColor(facts.status);
  const kind = [facts.typeLabel, facts.breed]
    .filter((part, index, all) => part && all.indexOf(part) === index)
    .join(' · ');
  const profile = [kind, ...facts.shortTraits].filter(Boolean).join('  ·  ');
  const location = facts.location ? `Última ubicación: ${facts.location}` : '';
  const photoSrc = ogPhotoSrc(photo);

  return renderOgCard(
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
          width={OG_WIDTH}
          height={OG_HEIGHT}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: OG_WIDTH,
            height: OG_HEIGHT,
            objectFit: 'cover',
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          backgroundImage:
            'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.05) 100%)',
        }}
      />
      <div style={OG_CONTENT_STYLE}>
        <div
          style={{
            display: 'flex',
            backgroundColor: statusColor,
            color: '#ffffff',
            fontSize: 40,
            fontWeight: 800,
            padding: '8px 36px',
            borderRadius: 999,
            border: '3px solid rgba(255,255,255,0.85)',
          }}
        >
          {facts.statusLabel}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div
            style={{
              display: 'block',
              maxWidth: OG_SAFE_WIDTH,
              color: '#ffffff',
              fontSize: nameSize(facts.name),
              fontWeight: 800,
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {facts.name}
          </div>
          {profile ? (
            <div
              style={{
                display: 'block',
                maxWidth: '100%',
                textAlign: 'center',
                color: '#f3f4f6',
                fontSize: 32,
                fontWeight: 700,
                lineHeight: 1.3,
                marginTop: 8,
                lineClamp: 2,
              }}
            >
              {profile}
            </div>
          ) : null}
          {location ? (
            <div
              style={{
                display: 'block',
                maxWidth: OG_SAFE_WIDTH,
                color: '#ffd9b8',
                fontSize: 28,
                fontWeight: 700,
                marginTop: 12,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {location}
            </div>
          ) : null}
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
  const animal = await fetchAnimalForShare(slug);
  if (!animal) {
    return fallbackResponse();
  }

  const facts = animalShareFacts(animal);
  const photo = await fetchOgPhoto(animalCoverUrl(animal));

  try {
    return ogPng(await renderCard(facts, photo, variant));
  } catch (error) {
    console.error('Animal share card failed with photo:', error);
  }

  // Formato de foto no soportado por el render: se sirve la portada tal cual.
  if (photo) {
    return new Response(photo.bytes, {
      headers: { 'Content-Type': photo.contentType, 'Cache-Control': OG_CACHE_CONTROL },
    });
  }

  try {
    return ogPng(await renderCard(facts, null, variant));
  } catch (error) {
    console.error('Animal share card failed:', error);
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
