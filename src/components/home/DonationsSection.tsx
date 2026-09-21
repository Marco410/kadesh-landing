import Link from 'next/link';
import { Routes } from 'kadesh/core/routes';
import { DONATIONS_LEAD, STRIPE_DONATE_URL } from 'kadesh/components/donations/constants';

export default function DonationsSection() {
  return (
    <section
      id="donaciones"
      className="w-full bg-kadesh py-24 dark:bg-kadesh-800"
    >
      <div className="mx-auto max-w-3xl px-4 text-center text-white sm:px-6 lg:px-8">
        <h2 className="mb-6 text-4xl font-black tracking-[-0.03em] sm:text-5xl">
          ¿Cómo apoyo a KADESH con una donación?
        </h2>

        <p className="mb-4 text-lg leading-relaxed text-white/90 sm:text-xl">
          {DONATIONS_LEAD}
        </p>

        <p className="mb-10 text-base text-white/80">
          El recuento completo está en la página de donaciones. También
          puedes apoyar en especie si tienes una marca o una tienda.
        </p>

        <div className="flex flex-col justify-center gap-4 lg:flex-row">
          <Link
            href={STRIPE_DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-bold text-kadesh shadow-[0_10px_28px_rgba(15,35,80,0.2)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5"
          >
            Apoyar el proyecto
          </Link>
          <Link
            href={Routes.donations}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-white/40 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-white/10"
          >
            Ver a qué se destina
          </Link>
        </div>
      </div>
    </section>
  );
}
