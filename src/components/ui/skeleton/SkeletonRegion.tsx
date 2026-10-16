'use client';

import { useEffect, useState, type ReactNode } from 'react';

const SLOW_AFTER_MS = 10_000;

interface SkeletonRegionProps {
  /** Lo que se está cargando, para lectores de pantalla (p. ej. «Cargando reportes»). */
  label: string;
  /** Clases del contenedor de las piezas (grid, space-y…), igual que el del contenido real. */
  className?: string;
  children: ReactNode;
}

/**
 * Envuelve las piezas de un esqueleto: lo anuncia como ocupado y, si a los 10s sigue
 * cargando, avisa debajo que está tardando.
 */
export function SkeletonRegion({ label, className, children }: SkeletonRegionProps) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div role="status" aria-busy="true" aria-label={label}>
      <div className={className}>{children}</div>
      {slow && (
        <p className="mt-4 text-center text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
          Está tardando más de lo normal. Seguimos intentando…
        </p>
      )}
    </div>
  );
}
