import type { Metadata } from 'next';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { RankingIcon } from '@hugeicons/core-free-icons';
import { Footer, Navigation } from 'kadesh/components/layout';
import { PAW_WAYS_TO_EARN, PawLevelsList, RankingBoard } from 'kadesh/components/paws';
import { fetchPawLeaderboard } from 'kadesh/components/paws/server';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';

/** Igual que `PAW_RANKING_REVALIDATE_SECONDS` (5 min); las fotos son URLs firmadas de 1 h. */
export const revalidate = 300;

const TITLE = 'Quién apoya más';
const DESCRIPTION =
  'Las personas que más ayudan a encontrar mascotas perdidas en KADESH Pet: reportes, avisos «Lo vi», casos cerrados y adopciones.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${Routes.ranking}` },
  openGraph: { title: `${TITLE} | KADESH`, description: DESCRIPTION, url: `${SITE_URL}${Routes.ranking}` },
};

/**
 * `/ranking`: ranking público de huellitas, este mes y de siempre (los 50 primeros). Podio, lista y
 * una columna lateral con tu lugar, cómo se gana y los niveles. Las dos listas se piden en el
 * servidor; con sesión, `RankingBoard` marca tu lugar. Cada persona lleva a su perfil público.
 */
export default async function RankingPage() {
  const [month, allTime] = await Promise.all([fetchPawLeaderboard('month'), fetchPawLeaderboard('all_time')]);

  const aside = (
    <>
      <section id="como-se-gana" className="scroll-mt-24 rounded-3xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised">
        <h2 className="font-bold text-[#121212] dark:text-white">Cómo se ganan</h2>
        <p className="mt-1 text-[13px] text-[#5a5a5a] dark:text-[#9aa3b2]">Hasta 60 al día. Likes y visitas no cuentan.</p>
        <ul className="mt-3 space-y-2">
          {PAW_WAYS_TO_EARN.map((way) => (
            <li key={way.action} className="flex items-start justify-between gap-3 text-sm">
              <span className="text-[#3a3a3a] dark:text-[#d0d0d0]">{way.label}</span>
              <span className="shrink-0 font-bold tabular-nums text-kadesh-700 dark:text-kadesh-300">+{way.points}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised">
        <h2 className="font-bold text-[#121212] dark:text-white">Niveles</h2>
        <div className="mt-3">
          <PawLevelsList />
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-[#5a5a5a] dark:text-[#9aa3b2]">
          Solo se ven tu nombre con inicial y tu foto. Para no aparecer, apágalo en{' '}
          <Link href={Routes.profileTab('paws')} className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300">
            tus huellitas
          </Link>
          .
        </p>
      </section>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-night">
      <Navigation />

      <header className="border-b border-[#ececec] bg-white px-4 pb-10 pt-[calc(72px+2.5rem)] dark:border-white/10 dark:bg-night-raised sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-kadesh-700 dark:text-kadesh-300">
              <HugeiconsIcon icon={RankingIcon} size={18} strokeWidth={1.8} aria-hidden="true" />
              Ranking de huellitas
            </p>
            <h1 className="text-4xl font-black tracking-[-0.035em] text-[#121212] dark:text-white sm:text-5xl">{TITLE}</h1>
            <p className="mt-3 text-lg leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
              Quienes reportan, avisan y no dejan de buscar. Gracias a ellos, más mascotas vuelven a casa.
            </p>
          </div>
          <Link
            href={`${Routes.animals.index}`}
            className="inline-flex min-h-11 shrink-0 items-center self-start rounded-full bg-kadesh-600 px-5 text-sm font-semibold text-white hover:bg-kadesh-700 md:self-auto"
          >
            Ayudar a buscar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <RankingBoard month={month} allTime={allTime} aside={aside} />
      </main>

      <Footer />
    </div>
  );
}
