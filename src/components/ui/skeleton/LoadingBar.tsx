import { cn } from 'kadesh/utils/cn';

interface LoadingBarProps {
  active: boolean;
  className?: string;
}

/**
 * Barra de espera de 3px para recargas de algo que ya se ve (cambio de filtro).
 * Siempre ocupa su alto para que nada salte; el segmento solo aparece si está activa.
 */
export function LoadingBar({ active, className }: LoadingBarProps) {
  return (
    <div
      role={active ? 'progressbar' : undefined}
      aria-label={active ? 'Actualizando resultados' : undefined}
      aria-hidden={active ? undefined : true}
      data-active={active}
      className={cn('kadesh-loading-bar', className)}
    />
  );
}
