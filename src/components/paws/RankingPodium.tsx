import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Fire03Icon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import LevelAvatar from './LevelAvatar';
import type { PawLeaderboardEntry } from './types';

const n = (value: number) => value.toLocaleString('es-MX');

const PLACE = {
  1: { medal: 'bg-amber-400 text-amber-950', card: 'sm:-translate-y-4 border-amber-300/80 dark:border-amber-400/40', glow: 'from-amber-100/80 dark:from-amber-400/15' },
  2: { medal: 'bg-slate-300 text-slate-900', card: 'border-[#e3e6ea] dark:border-white/10', glow: 'from-slate-100 dark:from-white/5' },
  3: { medal: 'bg-orange-300 text-orange-950', card: 'border-[#e3e6ea] dark:border-white/10', glow: 'from-orange-100/70 dark:from-orange-400/10' },
} as const;

/**
 * Los tres primeros, de lado (2.º · 1.º · 3.º) en pantallas anchas y en orden en celular. Cada
 * tarjeta lleva al perfil público si está abierto. Sin hooks.
 */
export default function RankingPodium({
  entries,
  highlightRank,
}: {
  entries: PawLeaderboardEntry[];
  highlightRank?: number | null;
}) {
  const top = entries.slice(0, 3);
  if (top.length === 0) return null;
  // En pantallas anchas: 2.º a la izquierda, 1.º al centro, 3.º a la derecha.
  const order = ['sm:order-2', 'sm:order-1', 'sm:order-3'];

  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end sm:pt-4" aria-label="Los tres primeros">
      {top.map((entry, index) => {
        const place = PLACE[entry.rank as 1 | 2 | 3] ?? PLACE[3];
        const content = (
          <>
            <span
              className={cn(
                'absolute inset-x-0 top-0 h-24 rounded-t-3xl bg-gradient-to-b to-transparent',
                place.glow,
              )}
              aria-hidden
            />
            <span
              className={cn(
                'absolute left-4 top-4 flex size-8 items-center justify-center rounded-full text-sm font-black',
                place.medal,
              )}
            >
              {entry.rank}
            </span>
            <span className="relative flex flex-col items-center text-center">
              <LevelAvatar
                name={entry.name}
                avatarUrl={entry.avatarUrl}
                level={entry.level}
                size="lg"
              />
              <span className="mt-3 max-w-full truncate text-base font-bold text-[#121212] dark:text-white">
                {entry.name}
                {highlightRank === entry.rank ? (
                  <span className="ml-1.5 rounded-full bg-kadesh-600 px-2 py-0.5 align-middle text-[11px] font-bold text-white">
                    Tú
                  </span>
                ) : null}
              </span>
              <span className="text-[13px] text-[#5a5a5a] dark:text-[#9aa3b2]">
                Nivel {entry.level.level} · {entry.level.label}
              </span>
              <span className="mt-3 text-3xl font-black tabular-nums tracking-[-0.03em] text-[#121212] dark:text-white">
                {n(entry.points)}
              </span>
              <span className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">huellitas</span>
              {entry.streakWeeks > 1 ? (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[12px] font-medium text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                  <HugeiconsIcon icon={Fire03Icon} size={13} strokeWidth={1.8} aria-hidden="true" />
                  {entry.streakWeeks} semanas seguidas
                </span>
              ) : null}
            </span>
          </>
        );
        const cardClass = cn(
          'relative block overflow-hidden rounded-3xl border bg-white px-4 pb-5 pt-6 dark:bg-night-raised',
          place.card,
        );
        return (
          <li key={entry.rank} className={order[index]}>
            {entry.username ? (
              <Link
                href={Routes.publicProfile(entry.username)}
                className={cn(
                  cardClass,
                  'transition-[transform,box-shadow] duration-200 hover:shadow-[0_16px_40px_rgba(15,35,80,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400',
                )}
              >
                {content}
              </Link>
            ) : (
              <div className={cardClass}>{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
