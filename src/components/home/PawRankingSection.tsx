import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { RankingIcon } from '@hugeicons/core-free-icons';
import PawRankRow from 'kadesh/components/paws/PawRankRow';
import RankingPodium from 'kadesh/components/paws/RankingPodium';
import type { PawLeaderboardEntry } from 'kadesh/components/paws/types';
import { Routes } from 'kadesh/core/routes';

/** Cuántas personas se muestran, y desde cuántas se pinta la sección (vacía se ve mal). */
export const HOME_RANKING_TAKE = 6;
const MIN_PEOPLE = 3;

/**
 * «Quién apoya más» en la portada: texto e invitación a la izquierda; podio y los siguientes a la
 * derecha. Los del mes (si este mes hay menos de 3, los de siempre). Componente de servidor: los
 * datos llegan en el HTML. Con menos de `MIN_PEOPLE` no se pinta.
 */
export default function PawRankingSection({
  month,
  allTime,
}: {
  month: PawLeaderboardEntry[];
  allTime: PawLeaderboardEntry[];
}) {
  const useMonth = month.length >= MIN_PEOPLE;
  const rows = (useMonth ? month : allTime).slice(0, HOME_RANKING_TAKE);
  if (rows.length < MIN_PEOPLE) return null;
  const total = (useMonth ? month : allTime).reduce((sum, entry) => sum + entry.points, 0);

  return (
    <section
      id="ranking"
      aria-labelledby="ranking-heading"
      className="w-full scroll-mt-20 bg-kadesh-50 py-20 dark:bg-kadesh/10 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-14 lg:px-8">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-kadesh-700 dark:text-kadesh-300">
            <HugeiconsIcon icon={RankingIcon} size={18} strokeWidth={1.8} aria-hidden="true" />
            {useMonth ? 'Ranking de este mes' : 'Ranking de huellitas'}
          </p>
          <h2
            id="ranking-heading"
            className="text-4xl font-black tracking-[-0.035em] text-[#121212] dark:text-white sm:text-5xl"
          >
            Quién apoya más
          </h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
            Cada reporte, cada «Lo vi» y cada caso cerrado suma huellitas. Sube de nivel ayudando a que más
            mascotas vuelvan a casa.
          </p>
          <dl className="mt-6 flex gap-8">
            <div>
              <dt className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">{useMonth ? 'Huellitas este mes' : 'Huellitas'}</dt>
              <dd className="text-3xl font-black tabular-nums text-[#121212] dark:text-white">{total.toLocaleString('es-MX')}</dd>
            </div>
            <div>
              <dt className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">Personas</dt>
              <dd className="text-3xl font-black tabular-nums text-[#121212] dark:text-white">
                {(useMonth ? month : allTime).length.toLocaleString('es-MX')}
              </dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={Routes.ranking}
              className="inline-flex min-h-11 items-center rounded-full bg-kadesh-600 px-5 text-sm font-semibold text-white hover:bg-kadesh-700"
            >
              Ver ranking completo
            </Link>
            <Link
              href={`${Routes.ranking}#como-se-gana`}
              className="inline-flex min-h-11 items-center rounded-full border border-[#d9dde3] bg-white px-5 text-sm font-semibold text-[#121212] hover:bg-[#f7f8fa] dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Cómo se ganan
            </Link>
          </div>
        </div>

        <div className="min-w-0">
          <RankingPodium entries={rows} />
          {rows.length > 3 ? (
            <ol
              start={4}
              className="mt-4 divide-y divide-[#ececec] overflow-hidden rounded-3xl border border-[#ececec] bg-white dark:divide-white/10 dark:border-white/10 dark:bg-night-raised"
            >
              {rows.slice(3).map((entry) => (
                <li key={entry.rank}>
                  <PawRankRow entry={entry} />
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>
    </section>
  );
}
