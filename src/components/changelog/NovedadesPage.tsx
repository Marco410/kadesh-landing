'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { motion, useReducedMotion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Loading03Icon } from '@hugeicons/core-free-icons';
import { Footer, Navigation } from 'kadesh/components/layout';
import { Routes } from 'kadesh/core/routes';
import ChangelogTimeline from './ChangelogTimeline';
import ChangelogEmptyState from './ChangelogEmptyState';
import ChangelogLoadingSkeleton from './ChangelogLoadingSkeleton';
import { CHANGELOG_PAGE_SIZE } from './constants';
import { PET_CHANGELOG_LIST_QUERY } from './queries';
import type {
  PetChangelogListResponse,
  PetChangelogListVariables,
} from './types';
import { NOVEDADES_FAQ } from './novedades-seo';

export default function NovedadesPage() {
  const reduceMotion = useReducedMotion();
  const [loadedCount, setLoadedCount] = useState(CHANGELOG_PAGE_SIZE);

  const { data, loading, error, fetchMore } = useQuery<
    PetChangelogListResponse,
    PetChangelogListVariables
  >(PET_CHANGELOG_LIST_QUERY, {
    variables: { take: loadedCount, skip: 0 },
  });

  const releases = data?.systemReleases ?? [];
  const totalCount = data?.systemReleasesCount ?? 0;
  const hasMore = releases.length < totalCount;
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = useCallback(async () => {
    const nextTake = loadedCount + CHANGELOG_PAGE_SIZE;
    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { take: nextTake, skip: 0 },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
      setLoadedCount(nextTake);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchMore, loadedCount]);

  const isInitialLoading = loading && !data;
  const showEmpty = !isInitialLoading && !error && releases.length === 0;
  const fadeInUp = {
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] dark:bg-night">
      <Navigation />

      <header className="relative w-full overflow-hidden bg-gradient-to-br from-kadesh via-kadesh-500 to-kadesh-700 dark:from-night dark:via-night-raised dark:to-night">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-[-5rem] bottom-1/4 h-96 w-96 rounded-full bg-kadesh-800/30 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <motion.div {...fadeInUp}>
            <h1 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-5xl">
              Novedades de KADESH
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white/90">
              Historial oficial de versiones de la plataforma de bienestar
              animal: reportes, directorio veterinario, adopciones y citas. Sin
              métricas inventadas; solo lo que el equipo publica aquí.
            </p>
          </motion.div>
        </div>
      </header>

      <section
        aria-labelledby="changelog-heading"
        className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      >
        <h2 id="changelog-heading" className="sr-only">
          Historial de versiones
        </h2>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          >
            No pudimos cargar las novedades. Intenta de nuevo en unos momentos.
          </div>
        )}

        {isInitialLoading && <ChangelogLoadingSkeleton />}

        {showEmpty && <ChangelogEmptyState />}

        {!isInitialLoading && releases.length > 0 && (
          <>
            <p className="mb-8 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
              {totalCount === 1
                ? '1 versión publicada'
                : `${totalCount} versiones publicadas`}
            </p>
            <ChangelogTimeline releases={releases} />

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => void handleLoadMore()}
                  disabled={loadingMore}
                  className="inline-flex min-h-11 min-w-[200px] items-center justify-center gap-2 rounded-xl bg-kadesh px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,35,80,0.18)] transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loadingMore ? (
                    <>
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        size={18}
                        className="animate-spin"
                      />
                      Cargando…
                    </>
                  ) : (
                    `Cargar más versiones (${releases.length} de ${totalCount})`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section
        aria-labelledby="novedades-faq-heading"
        className="border-t border-[#ececec] bg-white py-12 dark:border-white/10 dark:bg-night-raised"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2
            id="novedades-faq-heading"
            className="text-xl font-bold tracking-[-0.02em] text-[#121212] dark:text-white sm:text-2xl"
          >
            Preguntas frecuentes sobre las actualizaciones
          </h2>
          <p className="mt-2 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
            Respuestas sobre el changelog de KADESH para quien reporta, adopta o
            busca una veterinaria en México.
          </p>
          <dl className="mt-8 space-y-8">
            {NOVEDADES_FAQ.map((item) => (
              <div key={item.question}>
                <dt className="text-lg font-semibold text-[#121212] dark:text-white">
                  {item.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0] sm:text-base">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-[#ececec] bg-[#f7f8fa] py-12 dark:border-white/10 dark:bg-night">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[#5a5a5a] dark:text-[#b0b0b0]">
            ¿Quieres usar lo que ya está en línea?
          </p>
          <div className="mt-4 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href={Routes.veterinaries.index}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600"
            >
              Ver veterinarias
            </Link>
            <Link
              href={Routes.animals.index}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-kadesh px-6 py-3 text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh hover:text-white dark:text-kadesh-300"
            >
              Ver animales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
