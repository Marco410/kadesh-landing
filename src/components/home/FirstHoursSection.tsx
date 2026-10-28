import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import ReportLink from 'kadesh/components/animals/ReportLink';

/** Abierta a propósito (no acordeón): es lo que busca alguien en pánico y lo que indexa Google. */
const FIRST_HOURS_STEPS = [
  {
    title: 'Búscala cerca y en silencio.',
    body: 'Recorre unas cuadras a la redonda, llámala por su nombre y revisa debajo de autos, jardines y cocheras. Los gatos casi siempre se esconden muy cerca de casa.',
  },
  {
    title: 'Repórtala en Kadesh.',
    body: 'Con la foto más reciente que tengas y el último lugar donde la viste. Así aparece en el mapa de tu zona desde hoy.',
  },
  {
    title: 'Avisa a veterinarias y refugios cercanos.',
    body: 'Es a donde llevan a un animal herido o encontrado. En Kadesh ves las de tu zona con su teléfono.',
  },
  {
    title: 'Difunde en tu colonia.',
    body: 'Comparte el enlace de su reporte en grupos de Facebook y de WhatsApp de tu zona, y pega carteles con foto y teléfono en esquinas, tiendas y veterinarias.',
  },
  {
    title: 'Revisa los reportes de «Encontrados».',
    body: 'Alguien pudo haberla visto y reportado. Vuelve a revisar cada día.',
  },
] as const;

export default function FirstHoursSection() {
  return (
    <section
      id="primeras-24-horas"
      aria-labelledby="primeras-24-horas-heading"
      className="w-full scroll-mt-20 bg-[#f7f8fa] py-24 dark:bg-night-raised"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2
          id="primeras-24-horas-heading"
          className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl"
        >
          ¿Se acaba de perder? Haz esto en las primeras 24 horas
        </h2>
        <p className="mb-12 text-lg leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0] sm:text-xl">
          Las primeras horas son las más importantes: casi siempre sigue cerca.
          No esperes a «ver si regresa».
        </p>

        <ol className="space-y-8">
          {FIRST_HOURS_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-5">
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-kadesh text-base font-black text-white"
                aria-hidden
              >
                {index + 1}
              </span>
              <div>
                <h3 className="mb-1.5 text-xl font-bold text-[#121212] dark:text-white">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div
          role="note"
          className="mt-12 flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-5 text-amber-900 dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-200"
        >
          <HugeiconsIcon icon={Alert02Icon} size={22} className="mt-0.5 flex-shrink-0" aria-hidden />
          <p className="leading-relaxed">
            <strong className="font-bold">Aviso de seguridad:</strong> si alguien
            te pide dinero por devolverla, pídele primero una foto actual o una
            videollamada con tu mascota. Nunca deposites por adelantado.
          </p>
        </div>

        <div className="mt-10 text-center sm:text-left">
          <ReportLink
            href={`${Routes.animals.new}?status=lost`}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-red-600 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:w-auto"
          >
            Reportar mi mascota ahora
          </ReportLink>
        </div>
      </div>
    </section>
  );
}
