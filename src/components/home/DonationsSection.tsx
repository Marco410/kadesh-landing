import Link from 'next/link';
import { Routes } from 'kadesh/core/routes';
import DonateTrigger from 'kadesh/components/donations/DonateTrigger';
import { DONATION_CTA_LABEL, isWallReady, patitasLabel } from 'kadesh/components/donations/constants';
import type { DonationsBoard } from 'kadesh/components/donations/types';
import DonationIcon from 'kadesh/components/shared/icons/DonationIcon';

/**
 * Home `#donaciones`. The button opens «Dame una patita»; below, the latest three messages of the
 * wall (from the server, `fetchDonationsHome`), only when there are any.
 */
export default function DonationsSection({ wall, summary }: Partial<Pick<DonationsBoard, 'wall' | 'summary'>> = {}) {
  // Messages only once the wall is up (`WALL_MIN_MESSAGES`): two lonely messages read as «nobody donates».
  const latest = isWallReady(summary) ? (wall?.items ?? []).filter((entry) => entry.message).slice(0, 3) : [];
  const supporters = summary?.supporters ?? 0;

  return (
    <section
      id="donaciones"
      className="w-full scroll-mt-20 bg-kadesh py-24 dark:bg-kadesh-800"
    >
      <div className="mx-auto max-w-3xl px-4 text-center text-white sm:px-6 lg:px-8">
        <h2 className="mb-6 text-4xl font-black tracking-[-0.03em] sm:text-5xl">
          Kadesh Pet es gratis para quien busca. Mantenerlo no lo es.
        </h2>

        <p className="mb-10 text-lg leading-relaxed text-white sm:text-xl">
          Tu donación paga servidores, mapas, difusión y casos urgentes. Es
          opcional y nunca bloquea el uso de la plataforma. Publicamos a qué se
          destina cada peso.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <DonateTrigger
            source="home"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-kadesh shadow-[0_10px_28px_rgba(15,35,80,0.2)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5"
          >
            <DonationIcon size={22} />
            {DONATION_CTA_LABEL}
          </DonateTrigger>
          <Link
            href={Routes.donations}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-white/40 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-white/10"
          >
            Ver a qué se destina
          </Link>
        </div>

        {latest.length > 0 ? (
          <div className="mt-12 text-left">
            <ul className="grid gap-3 sm:grid-cols-3">
              {latest.map((entry) => (
                <li key={entry.id} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <DonationIcon size={14} />
                    {entry.displayName} · {patitasLabel(entry.unitCount)}
                  </p>
                  <p className="mt-2 line-clamp-4 break-words text-sm leading-relaxed text-white/90">{entry.message}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-center text-sm text-white/90">
              {supporters > 1 ? `${supporters} personas ya dieron una patita. ` : ''}
              <Link href={Routes.donationsWall} className="font-semibold underline underline-offset-4 hover:decoration-2">
                Ver el muro de patitas
              </Link>
            </p>
          </div>
        ) : null}

        <p className="mx-auto mt-10 max-w-xl border-t border-white/20 pt-8 text-base leading-relaxed text-white">
          <strong className="font-bold">Si hoy no puedes donar:</strong> comparte
          un reporte de tu zona. A veces un mensaje es lo que trae a una mascota
          de vuelta.{' '}
          <Link
            href={Routes.navigation.lostAnimals}
            className="font-semibold underline underline-offset-4 hover:decoration-2"
          >
            Ver reportes cerca de mí
          </Link>
        </p>
      </div>
    </section>
  );
}
