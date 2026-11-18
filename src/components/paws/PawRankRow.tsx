import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Fire03Icon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import LevelAvatar from './LevelAvatar';
import type { PawLeaderboardEntry } from './types';

const n = (value: number) => value.toLocaleString('es-MX');

/**
 * Fila del ranking del 4.º lugar en adelante: lugar, foto con la insignia del nivel, nombre, nivel,
 * racha y huellitas. Toda la fila lleva al perfil público si la persona lo tiene abierto. Sin hooks:
 * la usan `/ranking` y la portada.
 */
export default function PawRankRow({
  entry,
  highlight = false,
}: {
  entry: PawLeaderboardEntry;
  /** La fila de quien está viendo. */
  highlight?: boolean;
}) {
  const body = (
    <>
      <span className="w-7 shrink-0 text-center text-sm font-bold tabular-nums text-[#5a5a5a] dark:text-[#9aa3b2]">
        {entry.rank}
      </span>
      <LevelAvatar name={entry.name} avatarUrl={entry.avatarUrl} level={entry.level} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-semibold text-[#121212] dark:text-white">{entry.name}</span>
          {highlight ? (
            <span className="shrink-0 rounded-full bg-kadesh-600 px-2 py-0.5 text-[11px] font-bold text-white">Tú</span>
          ) : null}
        </span>
        <span className="block truncate text-[13px] text-[#5a5a5a] dark:text-[#9aa3b2]">
          Nivel {entry.level.level} · {entry.level.label}
        </span>
      </span>
      <span className="hidden w-24 shrink-0 items-center gap-1 text-[13px] text-[#5a5a5a] sm:inline-flex dark:text-[#9aa3b2]">
        {entry.streakWeeks > 1 ? (
          <>
            <HugeiconsIcon icon={Fire03Icon} size={14} strokeWidth={1.8} className="text-orange-500" aria-hidden="true" />
            {entry.streakWeeks} sem.
          </>
        ) : null}
      </span>
      <span className="w-20 shrink-0 text-right">
        <span className="block font-bold tabular-nums text-[#121212] dark:text-white">{n(entry.points)}</span>
        <span className="block text-[11px] text-[#5a5a5a] dark:text-[#9aa3b2]">huellitas</span>
      </span>
    </>
  );

  const rowClass = cn(
    'flex items-center gap-3 px-3 py-2.5 sm:px-4',
    highlight ? 'bg-kadesh-50 dark:bg-kadesh-500/15' : '',
  );

  return entry.username ? (
    <Link
      href={Routes.publicProfile(entry.username)}
      className={cn(
        rowClass,
        'transition-colors hover:bg-[#f7f8fa] focus:outline-none focus-visible:bg-[#f1f3f6] dark:hover:bg-white/5 dark:focus-visible:bg-white/10',
      )}
    >
      {body}
    </Link>
  ) : (
    <div className={rowClass}>{body}</div>
  );
}
