import Image from 'next/image';
import { cn } from 'kadesh/utils/cn';

/**
 * Logo redondo de un espacio de rescate. Sin logo, sus iniciales sobre un color suave que sale del
 * nombre (siempre el mismo para el mismo nombre). Es decorativo: el nombre siempre va al lado o en
 * el `aria-label` del enlace que lo contiene.
 *
 * Las iniciales quedan debajo de la imagen: si la URL firmada ya caducó y la imagen no carga, se
 * ven las iniciales en lugar de un hueco.
 */

export const RESCUE_AVATAR_SIZES = {
  xs: { className: 'size-7 text-[11px]', px: 28 },
  sm: { className: 'size-9 text-xs', px: 36 },
  md: { className: 'size-11 text-sm', px: 44 },
  lg: { className: 'size-12 text-base sm:size-14 sm:text-lg', px: 56 },
  xl: { className: 'size-24 text-3xl sm:size-28 sm:text-4xl', px: 112 },
} as const;

export type RescueAvatarSize = keyof typeof RESCUE_AVATAR_SIZES;

/** Tonos para las iniciales: clases para la página y hex para la tarjeta OG. Opacos: el logo va sobre la portada. */
const TONES = [
  { className: 'bg-kadesh-100 text-kadesh-800 dark:bg-kadesh-900 dark:text-kadesh-100', bg: '#d6e5ff', fg: '#0e2d7a' },
  { className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100', bg: '#d1fae5', fg: '#065f46' },
  { className: 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100', bg: '#fef3c7', fg: '#78350f' },
  { className: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100', bg: '#ffe4e6', fg: '#9f1239' },
  { className: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100', bg: '#ccfbf1', fg: '#115e59' },
  { className: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100', bg: '#e0f2fe', fg: '#075985' },
  { className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100', bg: '#e0e7ff', fg: '#3730a3' },
  { className: 'bg-lime-100 text-lime-900 dark:bg-lime-900 dark:text-lime-100', bg: '#ecfccb', fg: '#365314' },
] as const;

export type RescueAvatarTone = (typeof TONES)[number];

const STOP_WORDS = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'en', 'a', 'ac', 'abp', 'iap', 'sc']);

/** «Patitas Felices A.C.» → «PF». */
export function rescueInitials(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => word.replace(/[^0-9A-Za-zÀ-ÖØ-öø-ÿ]/g, ''))
    .filter(Boolean);
  const meaningful = words.filter((word) => !STOP_WORDS.has(word.toLowerCase()));
  const picked = (meaningful.length > 0 ? meaningful : words).slice(0, 2);
  return picked.map((word) => word.charAt(0)).join('').toLocaleUpperCase('es-MX') || 'K';
}

/** Color estable para un nombre. */
export function rescueAvatarTone(name: string): RescueAvatarTone {
  let hash = 5381;
  for (const char of name.trim().toLowerCase()) hash = ((hash << 5) + hash + char.charCodeAt(0)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
}

export default function RescueAvatar({
  name,
  logoUrl,
  size = 'md',
  className,
}: {
  name: string;
  logoUrl?: string | null;
  size?: RescueAvatarSize;
  className?: string;
}) {
  const { className: sizeClass, px } = RESCUE_AVATAR_SIZES[size];
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-bold leading-none',
        rescueAvatarTone(name).className,
        sizeClass,
        className,
      )}
    >
      {rescueInitials(name)}
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt=""
          width={px}
          height={px}
          className="absolute inset-0 h-full w-full bg-white object-cover"
        />
      ) : null}
    </span>
  );
}
