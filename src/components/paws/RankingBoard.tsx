'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { useUser } from 'kadesh/utils/UserContext';
import LevelAvatar from './LevelAvatar';
import PawRankRow from './PawRankRow';
import RankingPodium from './RankingPodium';
import { MY_PAWS_SUMMARY_QUERY } from './queries';
import type { MyPawsSummaryResponse, PawLeaderboardEntry, PawLeaderboardPeriod } from './types';

const TABS: Array<{ id: PawLeaderboardPeriod; label: string; empty: string }> = [
  { id: 'month', label: 'Este mes', empty: 'Este mes todavía nadie suma huellitas.' },
  { id: 'all_time', label: 'De siempre', empty: 'Todavía nadie aparece en el ranking.' },
];

const n = (value: number) => value.toLocaleString('es-MX');

/**
 * Cuerpo de `/ranking`: pestañas, podio, lista del 4.º en adelante y la columna lateral (`aside`,
 * que llega del servidor) con tu lugar arriba. Las dos listas vienen del servidor; aquí solo se
 * cambia de pestaña. Con sesión se pide el resumen de huellitas (la misma consulta que la tarjeta de
 * Inicio) para la tarjeta «Tú» y para marcar tu fila en «De siempre» por lugar y nombre.
 */
export default function RankingBoard({
  month,
  allTime,
  aside,
}: {
  month: PawLeaderboardEntry[];
  allTime: PawLeaderboardEntry[];
  aside?: ReactNode;
}) {
  const [period, setPeriod] = useState<PawLeaderboardPeriod>(month.length > 0 ? 'month' : 'all_time');
  const { user } = useUser();
  const { data } = useQuery<MyPawsSummaryResponse>(MY_PAWS_SUMMARY_QUERY, {
    skip: !user?.id,
    fetchPolicy: 'cache-first',
  });
  const me = user?.id && data?.myPaws?.enabled ? data.myPaws : null;
  const rows = period === 'month' ? month : allTime;
  const tab = TABS.find((item) => item.id === period) ?? TABS[0];

  // Las filas no traen ids: tu fila es la de tu lugar con tu nombre público («Marco C.»).
  const myRow =
    period === 'all_time' && me?.rank
      ? allTime.find((entry) => entry.rank === me.rank && sameFirstName(entry.name, user?.name))
      : null;
  const totalPoints = rows.reduce((sum, entry) => sum + entry.points, 0);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
      <div className="min-w-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Periodo del ranking" className="inline-flex rounded-full bg-[#f1f3f6] p-1 dark:bg-white/10">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === period}
                onClick={() => setPeriod(item.id)}
                className={cn(
                  'min-h-10 rounded-full px-5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400',
                  item.id === period
                    ? 'bg-white text-[#121212] shadow-sm dark:bg-white dark:text-[#121212]'
                    : 'text-[#5a5a5a] hover:text-[#121212] dark:text-[#b0b0b0] dark:hover:text-white',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          {rows.length > 0 ? (
            <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
              {rows.length === 1 ? '1 persona' : `${n(rows.length)} personas`} · {n(totalPoints)} huellitas
            </p>
          ) : null}
        </div>

        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#d9dde3] px-6 py-16 text-center dark:border-white/15">
            <p className="font-semibold text-[#121212] dark:text-white">{tab.empty}</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
              Publica un reporte o avisa que viste a un animal perdido y aparece aquí.
            </p>
            <Link
              href={Routes.animals.index}
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-kadesh-600 px-5 text-sm font-semibold text-white hover:bg-kadesh-700"
            >
              Ver animales perdidos
            </Link>
          </div>
        ) : (
          <>
            <RankingPodium entries={rows} highlightRank={myRow?.rank ?? null} />
            {rows.length > 3 ? (
              <ol
                start={4}
                className="mt-6 divide-y divide-[#ececec] overflow-hidden rounded-3xl border border-[#ececec] bg-white dark:divide-white/10 dark:border-white/10 dark:bg-night-raised"
                aria-label={`Ranking ${tab.label.toLowerCase()}, del 4.º lugar en adelante`}
              >
                {rows.slice(3).map((entry) => (
                  <li key={`${period}-${entry.rank}`}>
                    <PawRankRow entry={entry} highlight={myRow?.rank === entry.rank} />
                  </li>
                ))}
              </ol>
            ) : null}
          </>
        )}
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        {me ? (
          <MyStanding
            me={me}
            name={user?.name ?? ''}
            avatarUrl={user?.profileImage?.url ?? null}
            boardFull={allTime.length >= 50}
          />
        ) : (
          <JoinCard signedIn={Boolean(user?.id)} />
        )}
        {aside}
      </aside>
    </div>
  );
}

function sameFirstName(publicName: string, sessionName?: string | null): boolean {
  const a = publicName.trim().split(/\s+/)[0]?.toLowerCase();
  const b = (sessionName ?? '').trim().split(/\s+/)[0]?.toLowerCase();
  return Boolean(a && b && a === b);
}

function MyStanding({
  me,
  name,
  avatarUrl,
  boardFull,
}: {
  me: NonNullable<MyPawsSummaryResponse['myPaws']>;
  name: string;
  avatarUrl: string | null;
  boardFull: boolean;
}) {
  let text: string;
  if (me.rankingHidden) text = 'No apareces en el ranking: lo ocultaste en tu perfil.';
  else if (me.rank) text = `Vas en el lugar ${me.rank} de siempre.`;
  else if (me.lifetimeEarned > 0)
    text = boardFull ? 'Sigue ayudando para entrar a los 50 primeros.' : 'El ranking se actualiza cada pocos minutos.';
  else text = 'Publica un reporte o avisa que viste a un animal para ganar tus primeras huellitas.';

  return (
    <section className="rounded-3xl bg-[#121a2b] p-5 text-white dark:bg-kadesh-500/15">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/60">Tú</p>
      <div className="mt-3 flex items-center gap-3">
        <LevelAvatar name={name} avatarUrl={avatarUrl} level={me.level} size="md" />
        <div className="min-w-0">
          <p className="truncate font-bold">Nivel {me.level.level} · {me.level.label}</p>
          <p className="text-sm text-white/70">{n(me.lifetimeEarned)} huellitas</p>
        </div>
        {me.rank && !me.rankingHidden ? (
          <p className="ml-auto text-right">
            <span className="block text-2xl font-black tabular-nums">#{me.rank}</span>
          </p>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-white/80">{text}</p>
      <Link href={Routes.profileTab('paws')} className="mt-3 inline-flex text-sm font-semibold text-kadesh-300 hover:underline">
        Tus huellitas →
      </Link>
    </section>
  );
}

function JoinCard({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="rounded-3xl bg-[#121a2b] p-5 text-white dark:bg-kadesh-500/15">
      <p className="font-bold">¿Quieres aparecer aquí?</p>
      <p className="mt-1 text-sm text-white/80">
        Cada reporte, cada «Lo vi» y cada caso cerrado suma huellitas y te sube de nivel.
      </p>
      <Link
        href={signedIn ? Routes.animals.index : Routes.auth.login}
        className="mt-4 inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-[#121212] hover:bg-white/90"
      >
        {signedIn ? 'Ver animales perdidos' : 'Crear mi cuenta'}
      </Link>
    </section>
  );
}
