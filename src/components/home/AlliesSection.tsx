import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, Award01Icon } from '@hugeicons/core-free-icons';
import AlliesWall from 'kadesh/components/rescue/AlliesWall';
import type { RescueAlliesResult } from 'kadesh/components/rescue/server';
import { Routes } from 'kadesh/core/routes';
import AlliesWallReveal from './AlliesWallReveal';

/** Cuántos aliados se piden y se muestran en la portada; el resto va en la burbuja «+N». */
export const HOME_ALLIES_MAX = 28;

/**
 * «Aliados que rescatan con KADESH» en la portada. Componente de servidor: los logos llegan en el
 * HTML, como los contribuidores de un repositorio de GitHub. Sin aliados no se pinta nada.
 */
export default function AlliesSection({ allies }: { allies: RescueAlliesResult }) {
  if (!allies.allies.some((ally) => ally.slug)) return null;

  return (
    <section
      id="aliados"
      aria-labelledby="aliados-heading"
      className="w-full scroll-mt-20 bg-white py-24 dark:bg-night"
    >
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-kadesh-50 px-3 py-1.5 text-sm font-semibold text-kadesh-700 dark:bg-white/10 dark:text-kadesh-300">
          <HugeiconsIcon icon={Award01Icon} size={16} strokeWidth={1.8} aria-hidden="true" />
          Aliados KADESH
        </p>
        <h2
          id="aliados-heading"
          className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl"
        >
          Aliados que rescatan con KADESH
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-[#5a5a5a] dark:text-[#b0b0b0]">
          Rescatistas, refugios y hogares temporales verificados que publican aquí a sus rescatados. Conócelos: puedes
          adoptar, donar o echarles la mano.
        </p>

        <AlliesWallReveal>
          <AlliesWall
            allies={allies.allies}
            total={allies.total}
            max={HOME_ALLIES_MAX}
            size="lg"
            className="mx-auto mt-6 max-w-4xl pt-14"
          />
        </AlliesWallReveal>

        <Link
          href={Routes.allies}
          className="mt-8 inline-flex min-h-11 items-center gap-1.5 font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
        >
          Ver todos los aliados
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
