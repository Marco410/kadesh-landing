import { HugeiconsIcon } from '@hugeicons/react';
import { FileNotFoundIcon } from '@hugeicons/core-free-icons';
import Link from 'next/link';
import { Routes } from 'kadesh/core/routes';

export default function ChangelogEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[#e0e0e0] bg-white px-6 py-16 text-center dark:border-white/15 dark:bg-night-raised">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-kadesh/10 text-kadesh dark:bg-kadesh/20 dark:text-kadesh-300">
        <HugeiconsIcon icon={FileNotFoundIcon} size={28} />
      </span>
      <h2 className="text-lg font-bold text-[#121212] dark:text-white">
        Aún no hay novedades publicadas
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
        Cuando publiquemos una nueva versión de KADESH, aparecerá aquí con el
        detalle de mejoras y correcciones. El roadmap de la portada sigue
        mostrando qué ya opera y qué viene.
      </p>
      <Link
        href={`${Routes.home}${Routes.navigation.roadmap}`}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white hover:bg-kadesh-600"
      >
        Ver el roadmap
      </Link>
    </div>
  );
}
