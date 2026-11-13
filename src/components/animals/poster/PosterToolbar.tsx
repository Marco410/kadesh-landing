'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, Download04Icon, PrinterIcon } from '@hugeicons/core-free-icons';

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
      <a
        href={storyHref}
        download={storyFileName}
        className={`${buttonClass} border-2 border-kadesh text-kadesh hover:bg-kadesh hover:text-white`}
      >
        <HugeiconsIcon icon={Download04Icon} size={16} strokeWidth={1.8} />
        Imagen para historias
      </a>
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
