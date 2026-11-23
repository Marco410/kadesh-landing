import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { Routes } from 'kadesh/core/routes';
import { rewardPosterText } from 'kadesh/components/animals/reward';
import { SITE_URL } from 'kadesh/core/site';
import { getStatusColor } from 'kadesh/components/animals/constants';
import { animalShareFacts } from 'kadesh/components/animals/animal-seo';
import { animalCoverUrl, fetchAnimalForShare } from 'kadesh/components/animals/server';
import { sortMultimediaByOrder } from 'kadesh/components/animals/sortMultimedia';
import {
  folioDisplayUrl,
  formatFolio,
  posterCallToAction,
  posterHeadline,
  posterHref,
} from 'kadesh/components/animals/poster/folio';
import { folioQrDataUri } from 'kadesh/components/animals/poster/qr';
import PosterToolbar from 'kadesh/components/animals/poster/PosterToolbar';
import PosterFit from 'kadesh/components/animals/poster/PosterFit';
import {
  POSTER_FIT_INNER_ID,
  POSTER_WIDTH_PX,
  posterFitScript,
} from 'kadesh/components/animals/poster/fit';
import { normalizeMxPhone } from 'kadesh/utils/phone';


/** «pet.kadesh.com.mx/canal», como se lee impreso. */
const CHANNEL_DISPLAY = `${new URL(SITE_URL).host}${Routes.channel}`;
/**
 * Cartel para imprimir (carta) con foto, datos, QR al enlace corto y folio. Lo puede imprimir
 * cualquiera (dueños y voluntarios que pegan carteles).
 *
 * - Teléfono: sale por defecto (ya es público en la ficha y en la calle es lo más rápido para
 *   avisar). `?telefono=0` lo quita para quien no quiera exponerlo.
 * - Formato: vertical por defecto; `?formato=horizontal` para carta horizontal (paredes, vitrinas).
 *
 * - Tamaño: el cartel se maqueta siempre al tamaño real de la hoja (tipografía fija, sin `sm:` ni
 *   `vw`) y `PosterFit` lo reduce para que quepa en pantallas angostas: en el celular se ve la hoja
 *   completa en miniatura, igual que saldrá impresa.
 *
 * Datos: `fetchAnimalForShare` (la misma consulta que la metadata de la ficha, caché de 60 s), así
 * que la URL firmada de la foto siempre está vigente.
 */

export const metadata: Metadata = {
  title: 'Cartel para imprimir',
  robots: { index: false, follow: false },
};

const MAX_MARKS = 220;
/** En horizontal la columna de texto es alta: caben más señas y hasta 3 fotos más. */
const MAX_MARKS_LANDSCAPE = 360;
const MAX_EXTRA_PHOTOS = 3;

function formatPhone(raw: string | null | undefined): string | null {
  const phone = normalizeMxPhone(raw ?? '');
  if (!phone.ok) return null;
  return `${phone.digits.slice(0, 2)} ${phone.digits.slice(2, 6)} ${phone.digits.slice(6)}`;
}

function clip(text: string, max: number) {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export default async function AnimalPosterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ telefono?: string; formato?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const animal = await fetchAnimalForShare(slug);
  if (!animal) notFound();
  if (animal.duplicateOf) {
    permanentRedirect(Routes.animals.poster(animal.duplicateOf.slug || animal.duplicateOf.id));
  }

  const key = animal.slug || animal.id;
  const facts = animalShareFacts(animal);
  const color = getStatusColor(facts.status);
  const cover = animalCoverUrl(animal);
  const folio = animal.folio ?? null;
  const folioLabel = formatFolio(folio);
  const phone = formatPhone(animal.contactNumber);
  const phoneOn = query.telefono !== '0';
  const showPhone = phoneOn && Boolean(phone);
  const landscape = query.formato === 'horizontal';
  const posterWidth = landscape ? POSTER_WIDTH_PX.landscape : POSTER_WIDTH_PX.portrait;
  const marks = clip(animal.physical_description ?? '', landscape ? MAX_MARKS_LANDSCAPE : MAX_MARKS);
  // Horizontal: otras fotos del reporte (la portada ya va grande) para reconocerlo desde otro ángulo.
  const extraPhotos = landscape
    ? sortMultimediaByOrder(animal.multimedia)
        .map((item) => item.image?.url)
        .filter((url): url is string => Boolean(url) && url !== cover)
        .slice(0, MAX_EXTRA_PHOTOS)
    : [];
  const kind = [facts.typeLabel, facts.breed]
    .filter((part, index, all) => part && all.indexOf(part) === index)
    .join(' · ');

  const reward = rewardPosterText(animal, facts.status);
  const headline = (
    <header className="shrink-0 text-center">
      <div className="px-6 py-6 text-white" style={{ backgroundColor: color }}>
        <p className="text-[4.5rem] font-black leading-none tracking-[-0.03em]">
          {posterHeadline(facts.status)}
        </p>
      </div>
      {/* Recompensa: franja ámbar bajo el título, para que se lea de lejos. */}
      {reward ? (
        <p className="bg-amber-400 px-6 py-2 text-[2.25rem] font-black uppercase leading-tight tracking-[-0.01em] text-[#3d2800]">
          {reward}
        </p>
      ) : null}
    </header>
  );

  const photo = cover ? (
    // eslint-disable-next-line @next/next/no-img-element -- se imprime: `next/image` agrega carga diferida y tamaños que no sirven aquí.
    <img src={cover} alt={`Foto de ${facts.name}`} className="absolute inset-0 h-full w-full object-cover" />
  ) : (
    <div className="flex h-full items-center justify-center text-lg font-semibold text-[#5a5a5a]">Sin foto</div>
  );

  // En horizontal todo va más grande: la columna de texto tiene alto de sobra y el cartel se lee de lejos.
  const details = (
    <div className={landscape ? 'shrink-0 space-y-2 text-left' : 'space-y-2 px-10 pt-4 text-center'}>
      <h1
        className={`font-black leading-tight tracking-[-0.03em] ${
          landscape ? 'text-[3.25rem]' : 'text-5xl'
        }`}
      >
        {facts.name}
      </h1>
      {kind || facts.shortTraits.length ? (
        <p className={`font-semibold text-[#3a3a3a] ${landscape ? 'text-xl' : 'text-lg'}`}>
          {[kind, ...facts.shortTraits].filter(Boolean).join(' · ')}
        </p>
      ) : null}
      {facts.location ? (
        <p className="text-lg text-[#3a3a3a]">
          <strong>Último lugar:</strong> {facts.location}
          {facts.seenAt ? ` · ${facts.seenAt}` : ''}
        </p>
      ) : null}
      {marks ? (
        <p className="text-base leading-snug text-[#3a3a3a]">
          {marks}
        </p>
      ) : null}
    </div>
  );

  // Lo único elástico de la columna: ocupa lo que sobre y se encoge (o no se ve) si no cabe, para
  // que el pie con el QR y el teléfono siempre quepa completo.
  const morePhotos = extraPhotos.length ? (
    <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
      {extraPhotos.map((url, index) => (
        <div key={url} className="relative aspect-square h-full max-h-36 min-h-0 overflow-hidden rounded-lg bg-[#f3f5f8]">
          {/* eslint-disable-next-line @next/next/no-img-element -- se imprime, igual que la portada. */}
          <img src={url} alt={`Otra foto de ${facts.name} (${index + 2})`} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      ))}
    </div>
  ) : null;

  const contact = (
    <footer
      className={`flex items-center gap-6 border-t-4 ${landscape ? 'mt-auto shrink-0 pt-3' : 'mt-4 px-10 py-4'}`}
      style={{ borderColor: color }}
    >
      {folio ? (
        // eslint-disable-next-line @next/next/no-img-element -- SVG en línea (data:), sin optimización.
        <img
          src={folioQrDataUri(folio)}
          alt="Código QR del reporte"
          className={`shrink-0 ${landscape ? 'h-32 w-32' : 'h-36 w-36'}`}
        />
      ) : null}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xl font-bold leading-snug">
          {posterCallToAction(facts.status)}
        </p>
        {showPhone ? (
          <p className="text-3xl font-black tracking-tight">
            Llama al {phone}
          </p>
        ) : null}
        {folio ? <p className="break-all text-base font-semibold text-[#3a3a3a]">{folioDisplayUrl(folio)}</p> : null}
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5a5a5a]">
          {folioLabel ? `Folio ${folioLabel} · ` : ''}KADESH Pet
        </p>
        {/* Canal de WhatsApp: `/canal` y no el enlace de WhatsApp, para no reimprimir si cambia. */}
        <p className="text-sm text-[#5a5a5a]">
          Más casos de tu zona en WhatsApp: <span className="font-semibold text-[#3a3a3a]">{CHANNEL_DISPLAY}</span>
        </p>
      </div>
    </footer>
  );

  return (
    <main className="min-h-dvh bg-[#e9edf2] pb-10 print:bg-white print:p-0 dark:bg-night">
      {/* Solo se imprime el cartel: ni la barra ni lo que agrega el layout raíz (botón de ayuda). */}
      <style>{`
        @page { size: letter ${landscape ? 'landscape' : 'portrait'}; margin: 0.35in; }
        @media print {
          body * { visibility: hidden; }
          #cartel, #cartel * { visibility: visible; }
          #cartel { position: absolute; inset: 0; width: 100%; margin: 0; box-shadow: none; border: 0; }
          /* Fills the printable area exactly. With equal margins the area is not 11:8.5 (landscape:
             10.3 × 7.8 in), so keeping the ratio left the sheet a few px taller than the page and
             Chrome pushed the footer (QR and phone) onto a second page. */
          #cartel { height: 100%; aspect-ratio: auto; break-inside: avoid; }
          #${POSTER_FIT_INNER_ID} { zoom: 1 !important; }
          #cartel { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <PosterToolbar
        detailHref={Routes.animals.detail(key)}
        storyHref={Routes.animals.story(key)}
        storyFileName={`kadesh-${key}-historia.png`}
        phoneToggleHref={phone ? posterHref(key, { phone: !phoneOn, landscape }) : null}
        showPhone={showPhone}
        portraitHref={posterHref(key, { phone: phoneOn, landscape: false })}
        landscapeHref={posterHref(key, { phone: phoneOn, landscape: true })}
        landscape={landscape}
      />

      <div className="px-4 sm:px-6 print:p-0">
        <PosterFit widthPx={posterWidth}>
          {landscape ? (
            <article
              id="cartel"
              className="flex aspect-[11/8.5] w-full flex-col overflow-hidden bg-white text-[#121212] shadow-[0_16px_40px_rgba(15,35,80,0.18)]"
            >
              {headline}
              <div className="grid min-h-0 flex-1 grid-cols-[55%_1fr]">
                <div className="relative min-h-0 bg-[#f3f5f8]">{photo}</div>
                <div className="flex min-h-0 flex-col gap-4 p-7">
                  {details}
                  {morePhotos}
                  {contact}
                </div>
              </div>
            </article>
          ) : (
            <article
              id="cartel"
              className="flex aspect-[8.5/11] w-full flex-col overflow-hidden bg-white text-[#121212] shadow-[0_16px_40px_rgba(15,35,80,0.18)]"
            >
              {headline}
              <div className="relative min-h-0 flex-1 bg-[#f3f5f8]">{photo}</div>
              {details}
              {contact}
            </article>
          )}
        </PosterFit>
        {/* Escala la hoja antes del primer pintado (sin esperar a que cargue React). */}
        <script dangerouslySetInnerHTML={{ __html: posterFitScript(posterWidth) }} />
      </div>
    </main>
  );
}
