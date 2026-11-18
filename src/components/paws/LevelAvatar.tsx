import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'kadesh/utils/cn';
import { pawLevelIcon } from './constants';

export type LevelAvatarLevel = { level: number; key: string; label: string } | null | undefined;

/** Color de la insignia por nivel: sube de neutro a dorado. */
const LEVEL_TONE: Record<string, string> = {
  puppy: 'bg-slate-500 text-white',
  explorer: 'bg-emerald-600 text-white',
  guardian: 'bg-sky-600 text-white',
  rescuer: 'bg-violet-600 text-white',
  hero: 'bg-amber-500 text-amber-950',
  legend: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 text-amber-950',
};

/** Anillo alrededor de la foto, del color del nivel. */
const LEVEL_RING: Record<string, string> = {
  puppy: 'ring-slate-400/70',
  explorer: 'ring-emerald-500/80',
  guardian: 'ring-sky-500/80',
  rescuer: 'ring-violet-500/80',
  hero: 'ring-amber-400',
  legend: 'ring-yellow-400',
};

const SIZES = {
  sm: { box: 'size-9 text-sm', px: 36, badge: 'size-4 -bottom-0.5 -right-0.5', icon: 10, ring: 'ring-2' },
  md: { box: 'size-12 text-base', px: 48, badge: 'size-5 -bottom-0.5 -right-0.5', icon: 12, ring: 'ring-2' },
  lg: { box: 'size-16 text-xl', px: 64, badge: 'size-7 -bottom-1 -right-1', icon: 15, ring: 'ring-[3px]' },
  xl: { box: 'size-28 text-4xl sm:size-32', px: 128, badge: 'size-10 -bottom-1 -right-1', icon: 20, ring: 'ring-4' },
} as const;

export function levelTone(key: string | null | undefined): string {
  return LEVEL_TONE[key ?? ''] ?? LEVEL_TONE.puppy;
}

export type LevelColors = {
  /** Fondo sólido y texto encima (insignia, ícono del nivel actual). */
  solid: string;
  /** Fondo suave con texto del color (chips, niveles alcanzados). */
  soft: string;
  /** Texto del color, para cifras y detalles. */
  text: string;
  /** Relleno de la barra de progreso. */
  bar: string;
  /** Borde del nivel actual. */
  border: string;
  /** Brillo de fondo de la tarjeta del nivel. */
  glow: string;
};

/** Las clases van completas (no armadas) para que Tailwind las genere. */
const LEVEL_COLORS: Record<string, LevelColors> = {
  puppy: {
    solid: LEVEL_TONE.puppy,
    soft: 'bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-200',
    text: 'text-slate-600 dark:text-slate-300',
    bar: 'bg-slate-500',
    border: 'border-slate-400 dark:border-slate-400/60',
    glow: 'from-slate-400/15',
  },
  explorer: {
    solid: LEVEL_TONE.explorer,
    soft: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    text: 'text-emerald-700 dark:text-emerald-300',
    bar: 'bg-emerald-500',
    border: 'border-emerald-500 dark:border-emerald-400/60',
    glow: 'from-emerald-500/20',
  },
  guardian: {
    solid: LEVEL_TONE.guardian,
    soft: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    text: 'text-sky-700 dark:text-sky-300',
    bar: 'bg-sky-500',
    border: 'border-sky-500 dark:border-sky-400/60',
    glow: 'from-sky-500/20',
  },
  rescuer: {
    solid: LEVEL_TONE.rescuer,
    soft: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    text: 'text-violet-700 dark:text-violet-300',
    bar: 'bg-violet-500',
    border: 'border-violet-500 dark:border-violet-400/60',
    glow: 'from-violet-500/20',
  },
  hero: {
    solid: LEVEL_TONE.hero,
    soft: 'bg-amber-50 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
    text: 'text-amber-700 dark:text-amber-300',
    bar: 'bg-amber-400',
    border: 'border-amber-400 dark:border-amber-400/60',
    glow: 'from-amber-400/20',
  },
  legend: {
    solid: LEVEL_TONE.legend,
    soft: 'bg-yellow-50 text-amber-800 dark:bg-yellow-400/15 dark:text-yellow-300',
    text: 'text-amber-700 dark:text-yellow-300',
    bar: 'bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500',
    border: 'border-yellow-400 dark:border-yellow-400/60',
    glow: 'from-yellow-400/25',
  },
};

/** Colores de un nivel: los mismos de la insignia en todo el sitio. */
export function levelColors(key: string | null | undefined): LevelColors {
  return LEVEL_COLORS[key ?? ''] ?? LEVEL_COLORS.puppy;
}

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || 'K';
}

/**
 * Foto (o inicial) de una persona con un anillo y una insignia del color de su nivel de huellitas,
 * con el ícono del nivel. Sin nivel (huellitas apagadas) es un avatar normal. Sin hooks: sirve en
 * servidor y en navegador.
 */
export default function LevelAvatar({
  name,
  avatarUrl,
  level,
  size = 'md',
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  level?: LevelAvatarLevel;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  const title = level ? `Nivel ${level.level} · ${level.label}` : undefined;
  return (
    <span className={cn('relative inline-flex shrink-0', className)} title={title}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          width={s.px}
          height={s.px}
          className={cn(
            'rounded-full object-cover ring-offset-2 ring-offset-white dark:ring-offset-night',
            s.box,
            level ? `${s.ring} ${LEVEL_RING[level.key] ?? LEVEL_RING.puppy}` : null,
          )}
        />
      ) : (
        <span
          aria-hidden
          className={cn(
            'flex items-center justify-center rounded-full bg-kadesh-600 font-bold text-white ring-offset-2 ring-offset-white dark:ring-offset-night',
            s.box,
            level ? `${s.ring} ${LEVEL_RING[level.key] ?? LEVEL_RING.puppy}` : null,
          )}
        >
          {initialOf(name)}
        </span>
      )}
      {level ? (
        <span
          className={cn(
            'absolute flex items-center justify-center rounded-full border-2 border-white shadow-sm dark:border-night',
            s.badge,
            levelTone(level.key),
          )}
        >
          <HugeiconsIcon icon={pawLevelIcon(level.key)} size={s.icon} strokeWidth={2} aria-hidden="true" />
          <span className="sr-only">{title}</span>
        </span>
      ) : null}
    </span>
  );
}
