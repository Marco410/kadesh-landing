import Link from 'next/link';
import { SHOW_FOUNDER_OFFER } from 'kadesh/components/advertise';
import { Routes } from 'kadesh/core/routes';

/** Resumen para negocios; el detalle (planes, política, FAQ) vive en /anunciate. */
export default function BusinessStrip() {
  return (
    <section aria-labelledby="negocios-heading" className="w-full bg-white py-16 dark:bg-night">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-3xl border border-[#ececec] bg-[#f7f8fa] px-6 py-10 text-center dark:border-white/10 dark:bg-night-raised sm:px-10 md:flex-row md:justify-between md:text-left">
        <div className="max-w-2xl">
          <h2
            id="negocios-heading"
            className="mb-2 text-2xl font-black tracking-[-0.02em] text-[#121212] dark:text-white sm:text-3xl"
          >
            ¿Tienes una veterinaria o un negocio para mascotas?
          </h2>
          <p className="leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
            Aparece junto a las mascotas de tu colonia y ayuda a que la
            plataforma siga siendo gratis. Desde $99 al mes
            {SHOW_FOUNDER_OFFER ? '; los primeros 5 negocios aparecen gratis.' : '.'}
          </p>
        </div>
        <Link
          href={Routes.advertise}
          className="inline-flex min-h-12 flex-shrink-0 items-center justify-center rounded-xl bg-kadesh px-6 font-bold text-white transition-colors hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
        >
          Ver cómo anunciarme
        </Link>
      </div>
    </section>
  );
}
