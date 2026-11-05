import { NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { ogFonts } from 'kadesh/core/og-fonts';
import { SITE_URL } from 'kadesh/core/site';
import {
  OG_CONTENT_STYLE,
  OG_HEIGHT,
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
import { rescueAvatarTone, rescueInitials } from 'kadesh/components/rescue/RescueAvatar';
import { rescueShareFacts, type RescueShareFacts } from 'kadesh/components/rescue/rescue-seo';
import { fetchPublicRescueOrg } from 'kadesh/components/rescue/server';

/**
 * Tarjeta para compartir un espacio de rescate (WhatsApp, Facebook, X), como la de eventos: la
 * portada de fondo con un degradado (o el azul de marca), el logo, el nombre, la ciudad y sus
 * cifras, centrados en la zona segura (ver `kadesh/core/og-card`). Con `?formato=logo` sirve solo
 * el logo en cuadrado (512×512), para el JSON-LD: las URLs del API caducan y esta no. Si el render
 * falla con las fotos, se intenta sin ellas; si falla todo, la imagen genérica del sitio.
 */

const LOGO_SIZE = 512;
const BRAND_GRADIENT = 'linear-gradient(135deg, #4788FF 0%, #216BFA 45%, #0E2D7A 100%)';

function fallbackResponse() {
  return NextResponse.redirect(`${SITE_URL}/og-image.png`, {
    status: 302,
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
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
        fontSize: 28,
        fontWeight: 800,
        padding: '6px 24px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
}

function titleSize(name: string) {
  if (name.length > 48) return 44;
  if (name.length > 26) return 52;
  return 64;
}

async function renderCard(facts: RescueShareFacts, cover: OgPhoto | null, logo: OgPhoto | null, variant: OgVariant) {
  const coverSrc = ogPhotoSrc(cover);
  const logoSrc = ogPhotoSrc(logo);

  return renderOgCard(
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
          backgroundImage: coverSrc
            ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.3) 100%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 60%)',
        }}
      />
      <div style={OG_CONTENT_STYLE}>
        <div style={{ display: 'flex', gap: 14 }}>
          <Pill background="rgba(255,255,255,0.18)">{facts.typeLabel}</Pill>
          {facts.isAlly ? <Pill background="#ffffff" color="#1441A8">Aliado KADESH</Pill> : null}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <LogoCircle name={facts.name} logoSrc={logoSrc} size={128} border={5} />
          <div
            style={{
              display: 'block',
              maxWidth: '100%',
              textAlign: 'center',
              color: '#ffffff',
              fontSize: titleSize(facts.name),
              fontWeight: 800,
              lineHeight: 1.06,
              marginTop: 18,
              lineClamp: 2,
            }}
          >
            {facts.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 14, maxWidth: '100%' }}>
            <Pill background="#16a34a">Verificado</Pill>
            {facts.place ? (
              <div
                style={{
                  display: 'block',
                  color: '#dbe7ff',
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
          {facts.stats.length > 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 12 }}>
              {facts.stats.map((stat) => (
                <div key={stat.label} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ display: 'flex', color: '#ffffff', fontSize: 34, fontWeight: 800 }}>{stat.value}</div>
                  <div style={{ display: 'flex', color: '#e5e7eb', fontSize: 26, fontWeight: 700 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <OgBrandFooter />
      </div>
    </div>,
    variant,
  );
}

async function renderLogo(name: string, logo: OgPhoto | null) {
  const card = new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', fontFamily: 'Poppins' }}>
        <LogoCircle name={name} logoSrc={ogPhotoSrc(logo)} size={LOGO_SIZE} border={0} />
      </div>
    ),
    { width: LOGO_SIZE, height: LOGO_SIZE, fonts: ogFonts() },
  );
  return card.arrayBuffer();
}

async function buildResponse(request: Request, slug: string, variant: OgVariant): Promise<Response> {
  const org = await fetchPublicRescueOrg(slug);
  if (!org) return fallbackResponse();

  const facts = rescueShareFacts(org);

  if (new URL(request.url).searchParams.get('formato') === 'logo') {
    const logo = await fetchOgPhoto(facts.logoUrl);
    for (const attempt of logo ? [logo, null] : [null]) {
      try {
        return ogPng(await renderLogo(org.name, attempt));
      } catch (error) {
        console.error('Rescue logo image failed:', error);
      }
    }
    return fallbackResponse();
  }

  const [cover, logo] = await Promise.all([fetchOgPhoto(facts.coverUrl), fetchOgPhoto(facts.logoUrl)]);
  // Con las dos fotos, sin la portada y sin ninguna: Satori no acepta todos los formatos.
  const attempts: Array<[OgPhoto | null, OgPhoto | null]> = [[cover, logo]];
  if (cover) attempts.push([null, logo]);
  if (logo) attempts.push([null, null]);

  for (const [coverAttempt, logoAttempt] of attempts) {
    try {
      return ogPng(await renderCard(facts, coverAttempt, logoAttempt, variant));
    } catch (error) {
      console.error('Rescue share card failed:', error);
    }
  }
  return fallbackResponse();
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const variant = ogVariant(request);
  return withOgEdgeCache(request, variant, () => buildResponse(request, slug, variant));
}
