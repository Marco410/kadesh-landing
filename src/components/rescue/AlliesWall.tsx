import Link from 'next/link';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import AlliesWallFrame from './AlliesWallFrame';
import RescueAvatar, { RESCUE_AVATAR_SIZES } from './RescueAvatar';
import { rescueLocation } from './rescue-seo';
import type { RescueAlly } from './types';

type LinkedAlly = RescueAlly & { slug: string };

/** «12 adopciones»; sin adopciones, cuántos animales ha publicado. */
export function allyImpactText(ally: Pick<RescueAlly, 'adoptedCount' | 'publishedCount'>): string {
  if (ally.adoptedCount > 0) {
    return `${ally.adoptedCount.toLocaleString('es-MX')} ${ally.adoptedCount === 1 ? 'adopción' : 'adopciones'}`;
  }
  if (ally.publishedCount > 0) {
    return `${ally.publishedCount.toLocaleString('es-MX')} ${ally.publishedCount === 1 ? 'animal publicado' : 'animales publicados'}`;
  }
  return '';
}

const tooltipVisibility =
  'invisible opacity-0 motion-safe:transition-[opacity,visibility] motion-safe:duration-150 group-hover/avatar:visible group-hover/avatar:opacity-100 group-focus-visible/avatar:visible group-focus-visible/avatar:opacity-100 group-data-[dismissed=true]/wall:invisible! group-data-[dismissed=true]/wall:opacity-0!';

/**
 * Muro de aliados al estilo de los contribuidores de GitHub: logos redondos que se acomodan en
 * filas, cada uno enlaza a su perfil y al pasar el puntero o llegar con el teclado muestra nombre,
 * ciudad y adopciones. Con `max`, los que no caben se resumen en una burbuja «+N» que lleva a
 * `/aliados`. Componente de servidor: lo de cliente es solo `AlliesWallFrame` (Esc).
 */
export default function AlliesWall({
  allies,
  total,
  max,
  size = 'md',
  label = 'Aliados KADESH',
  className,
}: {
  allies: RescueAlly[];
  /** Total de aliados (para la burbuja «+N» cuando se pidieron menos). */
  total?: number;
  max?: number;
  size?: 'md' | 'lg';
  label?: string;
  className?: string;
}) {
  const linked = allies.filter((ally): ally is LinkedAlly => Boolean(ally.slug));
  const shown = max != null ? linked.slice(0, max) : linked;
  const hidden = max != null ? Math.max((total ?? linked.length) - shown.length, 0) : 0;
  if (shown.length === 0) return null;

  return (
    <AlliesWallFrame className={className}>
      <ul aria-label={label} className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
        {shown.map((ally) => {
          const place = rescueLocation(ally);
          const impact = allyImpactText(ally);
          return (
            <li key={ally.id} data-ally-avatar className="relative hover:z-10 focus-within:z-10">
              <Link
                href={Routes.organizations.detail(ally.slug)}
                aria-label={[ally.name, place, impact].filter(Boolean).join('. ')}
                className="group/avatar relative block rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-0.5"
              >
                <RescueAvatar
                  name={ally.name}
                  logoUrl={ally.logoUrl}
                  size={size}
                  className="shadow-[0_4px_12px_rgba(15,35,80,0.12)] ring-2 ring-white dark:ring-night"
                />
                {/* Etiqueta visual; el lector de pantalla ya la oye en el `aria-label`. */}
                <span
                  aria-hidden="true"
                  className={cn('absolute bottom-full left-1/2 z-20 w-max max-w-56 -translate-x-1/2 pb-2', tooltipVisibility)}
                >
                  <span className="relative block rounded-xl bg-[#121212] px-3 py-2 text-center text-xs leading-snug text-white shadow-[0_10px_24px_rgba(15,35,80,0.25)] dark:bg-white dark:text-[#3a3a3a]">
                    <span className="block text-[13px] font-bold text-white dark:text-[#121212]">{ally.name}</span>
                    {place ? <span className="block">{place}</span> : null}
                    {impact ? <span className="block font-semibold text-kadesh-200 dark:text-kadesh-700">{impact}</span> : null}
                    <span className="absolute top-full left-1/2 size-0 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-[#121212] dark:border-t-white" />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
        {hidden > 0 ? (
          <li data-ally-avatar className="relative">
            <Link
              href={Routes.allies}
              aria-label={`Ver ${hidden.toLocaleString('es-MX')} ${hidden === 1 ? 'aliado más' : 'aliados más'}`}
              className={cn(
                'flex items-center justify-center rounded-full border-2 border-dashed border-kadesh-300 bg-white font-bold text-kadesh-700 transition-colors hover:border-kadesh hover:bg-kadesh-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-kadesh/50 dark:bg-night dark:text-kadesh-200 dark:hover:bg-kadesh/15',
                RESCUE_AVATAR_SIZES[size].className,
              )}
            >
              +{hidden > 999 ? '999' : hidden.toLocaleString('es-MX')}
            </Link>
          </li>
        ) : null}
      </ul>
    </AlliesWallFrame>
  );
}
