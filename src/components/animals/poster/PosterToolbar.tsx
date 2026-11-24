'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { sileo } from 'sileo';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  Download04Icon,
  Loading03Icon,
  PrinterIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';

interface PosterToolbarProps {
  detailHref: string;
  storyHref: string;
  storyFileName: string;
  /** Enlace que alterna el teléfono en el cartel (null si el reporte no tiene uno válido). */
  phoneToggleHref: string | null;
  showPhone: boolean;
  portraitHref: string;
  landscapeHref: string;
  landscape: boolean;
}

const buttonClass =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-colors';
const outlineClass =
  'border border-[#d8dee8] bg-white text-[#121212] hover:bg-[#f3f5f8] dark:border-white/15 dark:bg-night-raised dark:text-[#eef1f6]';
/** How long the button keeps saying «Descargada» after the file is saved. */
const STORY_DONE_MS = 2500;

/** `ready`: the image is in memory but the share sheet needs a fresh tap (see `downloadStory`). */
type StoryState = 'idle' | 'loading' | 'ready' | 'done';

/**
 * In-app browsers (Facebook, Instagram, Messenger, TikTok, LINE…). They ignore `download` on a
 * blob link and open `blob:…` as a page instead, where the image cannot be saved or shared.
 */
const IN_APP_BROWSER = /FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger|musical_ly|BytedanceWebview|Line\/|; wv\)/i;

function isInAppBrowser() {
  return IN_APP_BROWSER.test(navigator.userAgent);
}

/**
 * Phones get the system share sheet: on iOS it is the only way to land the image in Photos
 * («Guardar imagen») instead of Files, and it also offers Instagram/WhatsApp directly.
 */
function canShareFile(file: File) {
  return (
    window.matchMedia('(pointer: coarse)').matches &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  );
}

function isNamedError(error: unknown, name: string) {
  return error instanceof DOMException && error.name === name;
}

/** Saves a blob with the given file name (object URL + temporary link). */
function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser time to start the download before releasing the URL.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const segmentClass = 'inline-flex min-h-11 items-center px-4 text-sm font-semibold transition-colors';

/**
 * Barra del cartel (no se imprime): volver, vertical u horizontal, mostrar u ocultar el teléfono,
 * bajar la imagen para historias e imprimir. Las opciones viven en la URL (las lee el servidor).
 */
export default function PosterToolbar({
  detailHref,
  storyHref,
  storyFileName,
  phoneToggleHref,
  showPhone,
  portraitHref,
  landscapeHref,
  landscape,
}: PosterToolbarProps) {
  // The story image is drawn on the server and takes a few seconds; a plain `<a download>` gave
  // no sign of life in the meantime, so the button fetches it and shows its own progress.
  const [storyState, setStoryState] = useState<StoryState>('idle');
  // The fetched image, kept for the second tap when the share sheet refused the first one.
  const storyFileRef = useRef<File | null>(null);

  const finish = (title: string, description: string) => {
    storyFileRef.current = null;
    setStoryState('done');
    sileo.success({ title, description });
    setTimeout(() => setStoryState('idle'), STORY_DONE_MS);
  };

  /** Opens the share sheet; returns false when the browser wants a fresh tap first. */
  const shareStory = async (file: File): Promise<boolean> => {
    try {
      await navigator.share({ files: [file] });
      finish('Imagen lista', 'Si elegiste «Guardar imagen», ya está en tu galería para subirla a tus historias.');
      return true;
    } catch (error) {
      if (isNamedError(error, 'AbortError')) {
        // Closed the sheet without choosing anything: not an error.
        storyFileRef.current = null;
        setStoryState('idle');
        return true;
      }
      // Safari only opens the sheet within a few seconds of the tap, and drawing the image takes
      // longer: keep it and ask for one more tap («Guardar imagen»).
      if (isNamedError(error, 'NotAllowedError')) return false;
      throw error;
    }
  };

  const downloadStory = async () => {
    if (storyState === 'loading') return;

    // Second tap: the image is already here, so the sheet opens right away.
    if (storyState === 'ready' && storyFileRef.current) {
      try {
        if (!(await shareStory(storyFileRef.current))) {
          saveBlob(storyFileRef.current, storyFileName);
          finish('Imagen descargada', 'Búscala en tus descargas para subirla a tus historias.');
        }
      } catch {
        storyFileRef.current = null;
        setStoryState('idle');
        sileo.error({ title: 'No se pudo guardar la imagen', description: 'Intenta de nuevo en un momento.' });
      }
      return;
    }

    setStoryState('loading');
    try {
      const response = await fetch(storyHref);
      if (!response.ok) throw new Error(`story ${response.status}`);
      const blob = await response.blob();
      const file = new File([blob], storyFileName, { type: blob.type || 'image/png' });

      if (canShareFile(file)) {
        if (!(await shareStory(file))) {
          storyFileRef.current = file;
          setStoryState('ready');
        }
        return;
      }

      if (isInAppBrowser()) {
        // No share sheet and no downloads here: open the real image (not a `blob:` page), where a
        // long press saves it. The response is cached at the edge, so this costs no new render.
        setStoryState('idle');
        sileo.info({
          title: 'Mantén presionada la imagen',
          description: 'Elige «Guardar imagen». Si no aparece, abre esta página en Safari o Chrome.',
        });
        window.location.assign(storyHref);
        return;
      }

      saveBlob(file, storyFileName);
      finish('Imagen descargada', 'Búscala en tus descargas o en tu galería para subirla a tus historias.');
    } catch {
      storyFileRef.current = null;
      setStoryState('idle');
      sileo.error({ title: 'No se pudo descargar la imagen', description: 'Intenta de nuevo en un momento.' });
    }
  };

  const storyIcon =
    storyState === 'loading' ? Loading03Icon : storyState === 'done' ? Tick02Icon : Download04Icon;
  const storyLabel =
    storyState === 'loading'
      ? 'Preparando imagen…'
      : storyState === 'ready'
        ? 'Guardar imagen'
        : storyState === 'done'
          ? 'Imagen lista'
          : 'Imagen para historias';

  return (
    <div className="mx-auto flex w-full max-w-[297mm] flex-wrap items-center gap-2 px-4 py-4 print:hidden">
      <Link
        href={detailHref}
        className="mr-auto inline-flex min-h-11 items-center gap-1 text-sm font-medium text-kadesh hover:underline"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
        Volver a la ficha
      </Link>
      <div
        role="group"
        aria-label="Formato del cartel"
        className="inline-flex overflow-hidden rounded-xl border border-[#d8dee8] bg-white dark:border-white/15 dark:bg-night-raised"
      >
        {[
          { href: portraitHref, label: 'Vertical', active: !landscape },
          { href: landscapeHref, label: 'Horizontal', active: landscape },
        ].map((option) => (
          <Link
            key={option.label}
            href={option.href}
            replace
            scroll={false}
            aria-current={option.active ? 'true' : undefined}
            className={`${segmentClass} ${
              option.active
                ? 'bg-kadesh text-white'
                : 'text-[#121212] hover:bg-[#f3f5f8] dark:text-[#eef1f6] dark:hover:bg-white/10'
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>
      {phoneToggleHref ? (
        <Link href={phoneToggleHref} replace scroll={false} className={`${buttonClass} ${outlineClass}`}>
          {showPhone ? 'Quitar teléfono' : 'Mostrar teléfono'}
        </Link>
      ) : null}
      <button
        type="button"
        onClick={downloadStory}
        disabled={storyState === 'loading'}
        aria-busy={storyState === 'loading'}
        className={`${buttonClass} border-2 border-kadesh text-kadesh hover:bg-kadesh hover:text-white disabled:cursor-wait disabled:opacity-80 disabled:hover:bg-transparent disabled:hover:text-kadesh`}
      >
        <HugeiconsIcon
          icon={storyIcon}
          size={16}
          strokeWidth={1.8}
          className={storyState === 'loading' ? 'animate-spin motion-reduce:animate-none' : undefined}
        />
        <span aria-live="polite">{storyLabel}</span>
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className={`${buttonClass} bg-kadesh text-white hover:bg-kadesh-600`}
      >
        <HugeiconsIcon icon={PrinterIcon} size={16} strokeWidth={1.8} />
        Imprimir
      </button>
    </div>
  );
}
