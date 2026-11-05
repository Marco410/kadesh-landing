import { NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { ogFonts } from 'kadesh/core/og-fonts';
import { SITE_URL } from 'kadesh/core/site';
import { rescueAvatarTone, rescueInitials } from 'kadesh/components/rescue/RescueAvatar';
import { rescueShareFacts, type RescueShareFacts } from 'kadesh/components/rescue/rescue-seo';
import { fetchPublicRescueOrg } from 'kadesh/components/rescue/server';

/**
 * Tarjeta para compartir un espacio de rescate (WhatsApp, Facebook, X), como la de eventos: la
 * portada de fondo con un degradado (o el azul de marca), el logo, el nombre, la ciudad y sus
 * cifras. Con `?formato=logo` sirve solo el logo en cuadrado (512×512), para el JSON-LD: las URLs
 * del API caducan y esta no. Si el render falla con las fotos, se intenta sin ellas; si falla
 * todo, la imagen genérica del sitio.
 */

const WIDTH = 1200;
const HEIGHT = 630;
const LOGO_SIZE = 512;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const CACHE_CONTROL = 'public, max-age=600, s-maxage=600, stale-while-revalidate=86400';
const BRAND_GRADIENT = 'linear-gradient(135deg, #4788FF 0%, #216BFA 45%, #0E2D7A 100%)';

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
    console.error('Rescue share image fetch failed:', error);
    return null;
  }
}

function dataUrl(photo: Photo | null): string | null {
  return photo ? `data:${photo.contentType};base64,${Buffer.from(photo.bytes).toString('base64')}` : null;
}

function LogoCircle({ name, logoSrc, size, border }: { name: string; logoSrc: string | null; size: number; border: number }) {
  const tone = rescueAvatarTone(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9999,
        overflow: 'hidden',
        backgroundColor: logoSrc ? '#ffffff' : tone.bg,
        color: tone.fg,
        // Satori falla con `border: undefined`: la clave solo va si hay borde.
        ...(border ? { border: `${border}px solid #ffffff` } : {}),
        fontSize: Math.round(size * 0.38),
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      {logoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoSrc}
          alt=""
          width={size - border * 2}
          height={size - border * 2}
          style={{ width: size - border * 2, height: size - border * 2, objectFit: 'cover' }}
        />
      ) : (
        rescueInitials(name)
      )}
    </div>
  );
}

function Pill({ children, background, color = '#ffffff' }: { children: string; background: string; color?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: background,
        color,
        fontSize: 30,
        fontWeight: 800,
        padding: '6px 26px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
}

async function renderCard(facts: RescueShareFacts, cover: Photo | null, logo: Photo | null) {
  const coverSrc = dataUrl(cover);
  const logoSrc = dataUrl(logo);
  const titleSize = facts.name.length > 48 ? 54 : facts.name.length > 26 ? 64 : 76;

  const card = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#0b1530',
          backgroundImage: BRAND_GRADIENT,
          fontFamily: 'Poppins',
        }}
      >
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverSrc}
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
            backgroundImage: coverSrc
              ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.15) 100%)'
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
              <Pill background="rgba(255,255,255,0.18)">{facts.typeLabel}</Pill>
              {facts.isAlly ? <Pill background="#ffffff" color="#1441A8">Aliado KADESH</Pill> : null}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', color: '#ffffff', fontSize: 40, fontWeight: 800, letterSpacing: 4 }}>KADESH</div>
              <div style={{ display: 'flex', color: '#d1d5db', fontSize: 22, fontWeight: 700 }}>pet.kadesh.com.mx</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 36 }}>
            <LogoCircle name={facts.name} logoSrc={logoSrc} size={176} border={6} />
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  color: '#ffffff',
                  fontSize: titleSize,
                  fontWeight: 800,
                  lineHeight: 1.06,
                  maxWidth: 860,
                }}
              >
                {facts.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14 }}>
                <Pill background="#16a34a">Verificado</Pill>
                {facts.place ? (
                  <div style={{ display: 'flex', color: '#dbe7ff', fontSize: 30, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {facts.place}
                  </div>
                ) : null}
              </div>
              {facts.stats.length > 0 ? (
                <div style={{ display: 'flex', gap: 30, marginTop: 16 }}>
                  {facts.stats.map((stat) => (
                    <div key={stat.label} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <div style={{ display: 'flex', color: '#ffffff', fontSize: 38, fontWeight: 800 }}>{stat.value}</div>
                      <div style={{ display: 'flex', color: '#e5e7eb', fontSize: 28, fontWeight: 700 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts: ogFonts() },
  );

  // Forzar el render aquí para poder caer al plan B si Satori rechaza una foto.
  return card.arrayBuffer();
}

async function renderLogo(name: string, logo: Photo | null) {
  const card = new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', fontFamily: 'Poppins' }}>
        <LogoCircle name={name} logoSrc={dataUrl(logo)} size={LOGO_SIZE} border={0} />
      </div>
    ),
    { width: LOGO_SIZE, height: LOGO_SIZE, fonts: ogFonts() },
  );
  return card.arrayBuffer();
}

function png(bytes: ArrayBuffer) {
  return new NextResponse(bytes, { headers: { 'Content-Type': 'image/png', 'Cache-Control': CACHE_CONTROL } });
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await fetchPublicRescueOrg(slug);
  if (!org) return fallbackResponse();

  const facts = rescueShareFacts(org);

  if (new URL(request.url).searchParams.get('formato') === 'logo') {
    const logo = await fetchPhoto(facts.logoUrl);
    for (const attempt of logo ? [logo, null] : [null]) {
      try {
        return png(await renderLogo(org.name, attempt));
      } catch (error) {
        console.error('Rescue logo image failed:', error);
      }
    }
    return fallbackResponse();
  }

  const [cover, logo] = await Promise.all([fetchPhoto(facts.coverUrl), fetchPhoto(facts.logoUrl)]);
  // Con las dos fotos, sin la portada y sin ninguna: Satori no acepta todos los formatos.
  const attempts: Array<[Photo | null, Photo | null]> = [[cover, logo]];
  if (cover) attempts.push([null, logo]);
  if (logo) attempts.push([null, null]);

  for (const [coverAttempt, logoAttempt] of attempts) {
    try {
      return png(await renderCard(facts, coverAttempt, logoAttempt));
    } catch (error) {
      console.error('Rescue share card failed:', error);
    }
  }
  return fallbackResponse();
}
