import { cn } from 'kadesh/utils/cn';

interface LoadingBarProps {
  active: boolean;
  className?: string;
  /** Qué está esperando (lector de pantalla). Por defecto, el de los directorios. */
  label?: string;
}

/**
 * Barra de espera de 3px para recargas de algo que ya se ve (cambio de filtro).
 * Siempre ocupa su alto para que nada salte; el segmento solo aparece si está activa.
 */
export function LoadingBar({ active, className, label = 'Actualizando resultados' }: LoadingBarProps) {
  return (
    <div
      role={active ? 'progressbar' : undefined}
      aria-label={active ? label : undefined}
      aria-hidden={active ? undefined : true}
      data-active={active}
      className={cn('kadesh-loading-bar', className)}
    />
  );
}
