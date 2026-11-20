'use client';

import { useState } from 'react';
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

type StoryState = 'idle' | 'loading' | 'done';

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

  const downloadStory = async () => {
    if (storyState === 'loading') return;
    setStoryState('loading');
    try {
      const response = await fetch(storyHref);
      if (!response.ok) throw new Error(`story ${response.status}`);
      saveBlob(await response.blob(), storyFileName);
      setStoryState('done');
      sileo.success({
        title: 'Imagen descargada',
        description: 'Búscala en tus descargas o en tu galería para subirla a tus historias.',
      });
      setTimeout(() => setStoryState('idle'), STORY_DONE_MS);
    } catch {
      setStoryState('idle');
      sileo.error({ title: 'No se pudo descargar la imagen', description: 'Intenta de nuevo en un momento.' });
    }
  };

  const storyIcon =
    storyState === 'loading' ? Loading03Icon : storyState === 'done' ? Tick02Icon : Download04Icon;
  const storyLabel =
    storyState === 'loading'
      ? 'Preparando imagen…'
      : storyState === 'done'
        ? 'Imagen descargada'
        : 'Imagen para historias';

  return (
    <div className="mx-auto flex w-full max-w-[11in] flex-wrap items-center gap-2 px-4 py-4 print:hidden">
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
