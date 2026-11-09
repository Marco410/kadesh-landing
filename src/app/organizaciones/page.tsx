import type { Metadata } from 'next';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, ArrowRight01Icon, FavouriteIcon } from '@hugeicons/core-free-icons';
import JsonLd from 'kadesh/components/blog/JsonLd';
import { Footer, Navigation } from 'kadesh/components/layout';
import RescueDirectory from 'kadesh/components/rescue/RescueDirectory';
import {
  RESCUE_DIRECTORY_DESCRIPTION,
  RESCUE_DIRECTORY_TITLE,
  buildRescueListingJsonLd,
  buildRescueListingMetadata,
} from 'kadesh/components/rescue/rescue-seo';
import { fetchRescueDirectory } from 'kadesh/components/rescue/server';
import { Routes } from 'kadesh/core/routes';

/** Las imágenes del API son URLs firmadas de 1 h: la página no se guarda más de 30 min. */
export const revalidate = 1800;

export const metadata: Metadata = buildRescueListingMetadata({
  path: Routes.organizations.index,
  title: RESCUE_DIRECTORY_TITLE,
  description: RESCUE_DIRECTORY_DESCRIPTION,
});

/** `/organizaciones`: directorio de espacios de rescate verificados. */
export default async function OrganizationsPage() {
  const orgs = await fetchRescueDirectory();

  return (
    <>
      <JsonLd
        data={buildRescueListingJsonLd({
          path: Routes.organizations.index,
          name: RESCUE_DIRECTORY_TITLE,
          description: RESCUE_DIRECTORY_DESCRIPTION,
          crumb: 'Organizaciones',
          orgs,
        })}
      />
      <div className="min-h-screen bg-white dark:bg-night">
        <Navigation />

        <header className="bg-kadesh-50 px-4 pt-[calc(72px+2.5rem)] pb-12 dark:bg-kadesh/10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-kadesh-700 dark:bg-white/10 dark:text-kadesh-300">
              <HugeiconsIcon icon={FavouriteIcon} size={16} strokeWidth={1.8} aria-hidden="true" />
              Espacios de rescate
            </p>
            <h1 className="mb-4 max-w-3xl text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl">
              Rescatistas, refugios y hogares temporales
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
              Quienes rescatan en México y publican aquí a sus animales. Cada espacio lo verifica el equipo de KADESH
              antes de mostrarlo. Entra a su perfil para adoptar, donar o sumarte como voluntario u hogar temporal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={Routes.rescueActivate}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
              >
                <HugeiconsIcon icon={Add01Icon} size={18} aria-hidden="true" />
                ¿Rescatas? Activa tu espacio
              </Link>
              <Link
                href={Routes.allies}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-kadesh-200 bg-white px-6 font-semibold text-kadesh-700 hover:border-kadesh dark:border-white/15 dark:bg-transparent dark:text-kadesh-300"
              >
                Conoce a los aliados KADESH
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-10 pb-20 sm:px-6 lg:px-8">
          <section aria-labelledby="espacios-verificados">
            <h2 id="espacios-verificados" className="mb-6 text-2xl font-black tracking-[-0.02em] text-[#121212] dark:text-white">
              Espacios verificados
            </h2>
            {orgs.length > 0 ? (
              <RescueDirectory orgs={orgs} />
            ) : (
              <div className="rounded-3xl border border-dashed border-[#d8dee8] bg-[#f7f8fa] px-6 py-14 text-center dark:border-white/15 dark:bg-night-raised">
                <p className="text-lg font-bold text-[#121212] dark:text-white">Muy pronto verás aquí a los primeros espacios</p>
                <p className="mx-auto mt-2 max-w-lg text-[#5a5a5a] dark:text-[#b0b0b0]">
                  Estamos verificando a rescatistas y refugios de todo México. Si rescatas, activa tu espacio y sé de los
                  primeros en aparecer.
                </p>
                <Link
                  href={Routes.rescueActivate}
                  className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600"
                >
                  Activar mi espacio
                </Link>
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
