import Link from 'next/link';
import { Routes } from 'kadesh/core/routes';

export default function ClosingSection() {
  return (
    <section className="kadesh-hero w-full py-24">
      <div className="mx-auto max-w-3xl px-4 text-center text-white sm:px-6 lg:px-8">
        <h2 className="mb-5 text-4xl font-black tracking-[-0.03em] sm:text-5xl">
          Mientras más pronto lo reportes, más cerca está de volver
        </h2>
        <p className="mb-10 text-lg leading-relaxed text-white sm:text-xl">
          Sube su foto y el último lugar donde lo viste. La comunidad de tu zona
          te ayuda a buscar.
        </p>
        <Link
          href={`${Routes.animals.new}?status=lost`}
          className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-red-600 px-8 py-4 text-lg font-bold text-white shadow-[0_10px_28px_rgba(127,29,29,0.35)] transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
        >
          Reportar mascota perdida
        </Link>
        <p className="mt-6 text-base text-white">
          <Link
            href={`${Routes.animals.new}?status=found`}
            className="font-semibold underline decoration-white/50 underline-offset-4 hover:decoration-white"
          >
            Encontré una mascota
          </Link>
          <span aria-hidden className="mx-3 text-white/60">·</span>
          <Link
            href={`${Routes.animals.index}?status=in_adoption`}
            className="font-semibold underline decoration-white/50 underline-offset-4 hover:decoration-white"
          >
            Quiero adoptar
          </Link>
        </p>
      </div>
    </section>
  );
}
