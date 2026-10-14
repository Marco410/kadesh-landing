import Link from 'next/link';
import { Routes } from 'kadesh/core/routes';
import { STRIPE_DONATE_URL } from 'kadesh/components/donations/constants';

export default function DonationsSection() {
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
          <Link
            href={STRIPE_DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-bold text-kadesh shadow-[0_10px_28px_rgba(15,35,80,0.2)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5"
          >
            Apoyar el proyecto
          </Link>
          <Link
            href={Routes.donations}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-white/40 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-white/10"
          >
            Ver a qué se destina
          </Link>
        </div>

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
