import type { Metadata } from 'next';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, ArrowRight01Icon, Award01Icon, Location01Icon } from '@hugeicons/core-free-icons';
import JsonLd from 'kadesh/components/blog/JsonLd';
import { Footer, Navigation } from 'kadesh/components/layout';
import AlliesWall, { allyImpactText } from 'kadesh/components/rescue/AlliesWall';
import { RESCUE_ORG_TYPE_OPTIONS } from 'kadesh/components/rescue/constants';
import RescueAvatar from 'kadesh/components/rescue/RescueAvatar';
import {
  ALLIES_DESCRIPTION,
  ALLIES_TITLE,
  buildRescueListingJsonLd,
  buildRescueListingMetadata,
  rescueLocation,
  rescueTypePluralLabel,
} from 'kadesh/components/rescue/rescue-seo';
import { fetchRescueAllies } from 'kadesh/components/rescue/server';
import type { RescueAlly } from 'kadesh/components/rescue/types';
import { Routes } from 'kadesh/core/routes';

/** Las imágenes del API son URLs firmadas de 1 h: la página no se guarda más de 30 min. */
export const revalidate = 1800;

export const metadata: Metadata = buildRescueListingMetadata({
  path: Routes.allies,
  title: ALLIES_TITLE,
  description: ALLIES_DESCRIPTION,
  absoluteTitle: true,
});

type LinkedAlly = RescueAlly & { slug: string };

/** Aliados agrupados por tipo, en el orden del asistente; los de un tipo desconocido, al final. */
function groupByType(allies: LinkedAlly[]) {
  const known = RESCUE_ORG_TYPE_OPTIONS.map((option) => option.value as string);
  const groups = RESCUE_ORG_TYPE_OPTIONS.map((option) => ({
    type: option.value as string,
    allies: allies.filter((ally) => ally.type === option.value),
  }));
  groups.push({ type: 'other', allies: allies.filter((ally) => !known.includes(ally.type)) });
  return groups.filter((group) => group.allies.length > 0);
}

/**
 * `/aliados`: todos los Aliados KADESH. El muro completo (sin «+N») y debajo la lista por tipo de
 * espacio, con ciudad y adopciones. Sin aliados todavía, un vacío amable y la invitación a unirse.
 */
export default async function AlliesPage() {
  const { allies } = await fetchRescueAllies();
  const linked = allies.filter((ally): ally is LinkedAlly => Boolean(ally.slug));
  const groups = groupByType(linked);

  return (
    <>
      <JsonLd
        data={buildRescueListingJsonLd({
          path: Routes.allies,
          name: ALLIES_TITLE,
          description: ALLIES_DESCRIPTION,
          crumb: 'Aliados',
          orgs: linked,
        })}
      />
      <div className="min-h-screen bg-white dark:bg-night">
        <Navigation />

        <header className="bg-kadesh-50 px-4 pt-[calc(72px+2.5rem)] pb-12 dark:bg-kadesh/10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-kadesh-700 dark:bg-white/10 dark:text-kadesh-300">
              <HugeiconsIcon icon={Award01Icon} size={16} strokeWidth={1.8} aria-hidden="true" />
              Aliados KADESH
            </p>
            <h1 className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl">
              Quienes rescatan con nosotros
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
              Rescatistas, refugios y hogares temporales verificados que trabajan de la mano con KADESH. Publican aquí a
              sus rescatados y sus finales felices. Entra a su perfil para adoptar, donar o echarles la mano.
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-12 pb-20 sm:px-6 lg:px-8">
          {linked.length > 0 ? (
            <>
              <section aria-labelledby="muro-aliados" className="text-center">
                <h2 id="muro-aliados" className="mb-2 text-2xl font-black tracking-[-0.02em] text-[#121212] dark:text-white">
                  {linked.length === 1 ? '1 aliado' : `${linked.length.toLocaleString('es-MX')} aliados`}
                </h2>
                <p className="mb-8 text-[#5a5a5a] dark:text-[#b0b0b0]">Pasa el puntero por cada logo para ver quién es, o tócalo para abrir su perfil.</p>
                <AlliesWall allies={linked} size="lg" className="mx-auto max-w-4xl pt-14" />
              </section>

              <section aria-labelledby="aliados-por-tipo" className="mt-20">
                <h2 id="aliados-por-tipo" className="mb-8 text-2xl font-black tracking-[-0.02em] text-[#121212] dark:text-white">
                  Aliados por tipo de espacio
                </h2>
                <div className="space-y-10">
                  {groups.map((group) => (
                    <section key={group.type} aria-labelledby={`aliados-${group.type}`}>
                      <h3 id={`aliados-${group.type}`} className="mb-4 text-lg font-bold text-[#121212] dark:text-white">
                        {rescueTypePluralLabel(group.type)}{' '}
                        <span className="font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">({group.allies.length})</span>
                      </h3>
                      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {group.allies.map((ally) => {
                          const place = rescueLocation(ally);
                          const impact = allyImpactText(ally);
                          return (
                            <li key={ally.id}>
                              <Link
                                href={Routes.organizations.detail(ally.slug)}
                                className="flex min-h-16 items-center gap-3 rounded-2xl border border-[#ececec] bg-white p-3 transition-colors hover:border-kadesh-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-white/10 dark:bg-night-raised dark:hover:border-kadesh/50"
                              >
                                <RescueAvatar name={ally.name} logoUrl={ally.logoUrl} size="md" />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-bold text-[#121212] dark:text-white">{ally.name}</span>
                                  {place ? (
                                    <span className="flex items-center gap-1 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
                                      <HugeiconsIcon icon={Location01Icon} size={13} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
                                      <span className="truncate">{place}</span>
                                    </span>
                                  ) : null}
                                  {impact ? (
                                    <span className="block text-sm font-semibold text-kadesh-700 dark:text-kadesh-300">{impact}</span>
                                  ) : null}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section
              aria-labelledby="sin-aliados"
              className="mx-auto max-w-2xl rounded-3xl border border-dashed border-[#d8dee8] bg-[#f7f8fa] px-6 py-14 text-center dark:border-white/15 dark:bg-night-raised"
            >
              <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-kadesh-50 text-kadesh dark:bg-kadesh/15 dark:text-kadesh-200">
                <HugeiconsIcon icon={Award01Icon} size={28} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h2 id="sin-aliados" className="text-xl font-bold text-[#121212] dark:text-white">
                Muy pronto conocerás a nuestros primeros aliados
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-[#5a5a5a] dark:text-[#b0b0b0]">
                Estamos verificando a rescatistas y refugios de todo México. Mientras, puedes conocer los espacios que ya
                están en KADESH.
              </p>
              <Link
                href={Routes.organizations.index}
                className="mt-6 inline-flex min-h-11 items-center gap-1.5 font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
              >
                Ver espacios de rescate
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} aria-hidden="true" />
              </Link>
            </section>
          )}

          <section
            aria-labelledby="unete-aliado"
            className="mx-auto mt-20 flex max-w-4xl flex-col items-center gap-5 rounded-3xl bg-kadesh px-6 py-10 text-center text-white dark:bg-kadesh-800 sm:px-10"
          >
            <h2 id="unete-aliado" className="text-3xl font-black tracking-[-0.03em]">
              ¿Rescatas? Únete como aliado
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-white">
              Activa gratis tu espacio de rescate y publica a tus animales a nombre de tu organización. Lo revisamos y, ya
              verificado, apareces en el directorio. Nuestro equipo elige a los Aliados KADESH entre los espacios
              verificados.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={Routes.rescueActivate}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 font-bold text-kadesh-700 shadow-[0_10px_28px_rgba(15,35,80,0.2)] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-safe:hover:-translate-y-0.5"
              >
                <HugeiconsIcon icon={Add01Icon} size={18} aria-hidden="true" />
                Activar mi espacio
              </Link>
              <Link
                href={Routes.organizations.index}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-white/40 px-6 font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Ver todos los espacios
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
