import Link from 'next/link';
import { Footer, Navigation } from 'kadesh/components/layout';
import { Routes } from 'kadesh/core/routes';
import {
  DONATION_DESTINATIONS,
  DONATIONS_FAQS,
  DONATIONS_LEAD,
  DONATIONS_UPDATED_LABEL,
  STRIPE_DONATE_URL,
} from './constants';

const CTA_PRIMARY =
  'inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-bold text-kadesh shadow-[0_10px_28px_rgba(15,35,80,0.2)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 lg:w-auto';

const CTA_SECONDARY =
  'inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-white/40 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-white/10 lg:w-auto';

const CTA_ON_LIGHT =
  'inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-kadesh px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-kadesh-600 lg:w-auto';

const CTA_OUTLINE_LIGHT =
  'inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-kadesh px-8 py-4 text-lg font-bold text-kadesh transition-colors hover:bg-kadesh/5 lg:w-auto';

export default function DonationsPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] dark:bg-night">
      <Navigation />

      <header className="w-full bg-kadesh py-16 text-white dark:bg-kadesh-800 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-black tracking-[-0.03em] sm:text-5xl">
            ¿A qué se destina tu donación?
          </h1>
          <p
            id="destino-respuesta"
            className="mb-8 max-w-[65ch] text-lg leading-relaxed text-white/90 sm:text-xl"
          >
            {DONATIONS_LEAD}
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap">
            <Link
              href={STRIPE_DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={CTA_PRIMARY}
            >
              Apoyar el proyecto
            </Link>
            <a href="#desglose" className={CTA_SECONDARY}>
              Ver el desglose
            </a>
          </div>
        </div>
      </header>

      <section
        id="desglose"
        aria-labelledby="desglose-heading"
        className="w-full bg-white py-16 dark:bg-night sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2
            id="desglose-heading"
            className="mb-4 text-3xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-4xl"
          >
            Desglose simple de a qué se destina
          </h2>
          <p className="mb-12 max-w-[65ch] text-base leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0] sm:text-lg">
            Cada aportación entra a KADESH y se usa en estos cuatro destinos.
            No publicamos porcentajes ni pesos inventados: esto es a qué va el
            dinero, no un estado financiero.
          </p>

          <div className="space-y-10">
            {DONATION_DESTINATIONS.map((item) => (
              <article key={item.title}>
                <h3 className="mb-2 text-2xl font-bold tracking-[-0.02em] text-[#121212] dark:text-white">
                  {item.title}
                </h3>
                <p className="max-w-[65ch] text-base leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0] sm:text-lg">
                  {item.body}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-12 max-w-[65ch] text-sm leading-relaxed text-[#5a5a5a] dark:text-[#9aa3b2]">
            {DONATIONS_UPDATED_LABEL} Cuando cerremos un periodo con números
            verificables, los publicaremos aquí. Hasta entonces, no hay cifras
            en esta página a propósito.
          </p>
        </div>
      </section>

      <section
        id="patrocinios"
        aria-labelledby="patrocinios-heading"
        className="w-full bg-[#f7f8fa] py-16 dark:bg-night-raised sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2
            id="patrocinios-heading"
            className="mb-4 text-3xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-4xl"
          >
            ¿Cómo apoyo sin donar dinero?
          </h2>
          <p className="mb-12 max-w-[65ch] text-base leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0] sm:text-lg">
            Buscamos patrocinios en especie con marcas y tiendas de mascotas,
            además del respaldo de quienes ya acompañan como fundadores.
            Alimento, consulta, espacio o difusión también sostienen el
            proyecto.
          </p>

          <div className="flex flex-col gap-10 lg:gap-12">
            <article>
              <h3 className="mb-2 text-2xl font-bold tracking-[-0.02em] text-[#121212] dark:text-white">
                Marcas y tiendas de mascotas
              </h3>
              <p className="mb-6 max-w-[65ch] text-base leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0] sm:text-lg">
                Si tienes una marca, una tienda o un consultorio, puedes aportar
                producto, servicio o visibilidad: alimento, consultas, espacio
                en anaquel o difusión a tu comunidad. Lo vemos caso por caso,
                con claridad de qué se da y a cambio de qué mención, si la hay.
              </p>
              <Link href={Routes.contact} className={CTA_ON_LIGHT}>
                Proponer un patrocinio
              </Link>
            </article>

            <article>
              <h3 className="mb-2 text-2xl font-bold tracking-[-0.02em] text-[#121212] dark:text-white">
                Fundadores
              </h3>
              <p className="mb-6 max-w-[65ch] text-base leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0] sm:text-lg">
                Quienes quieren acompañar el crecimiento de KADESH a largo
                plazo pueden sumarse como fundadores: tiempo, recurso o
                respaldo al proyecto. No es un plan de venta ni un listado de
                beneficios; es un compromiso con que la plataforma siga
                operando.
              </p>
              <Link href={Routes.contact} className={CTA_OUTLINE_LIGHT}>
                Escribir para ser fundador
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="donaciones-faq-heading"
        className="w-full bg-white py-16 dark:bg-night sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2
            id="donaciones-faq-heading"
            className="mb-12 text-3xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-4xl"
          >
            Preguntas sobre donaciones
          </h2>
          <div className="space-y-12">
            {DONATIONS_FAQS.map((item) => (
              <article key={item.question}>
                <h3 className="mb-3 text-2xl font-bold tracking-[-0.02em] text-[#121212] dark:text-white">
                  {item.question}
                </h3>
                <p className="max-w-[65ch] text-base leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0] sm:text-lg">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-kadesh py-16 text-white dark:bg-kadesh-800 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
            Si puedes, apoya el proyecto
          </h2>
          <p className="mx-auto mb-8 max-w-[65ch] text-base leading-relaxed text-white/90 sm:text-lg">
            Cada aportación paga operación, difusión y, cuando hace falta,
            un caso urgente. Gracias por leer a qué se destina antes de donar.
          </p>
          <Link
            href={STRIPE_DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${CTA_PRIMARY} lg:inline-flex`}
          >
            Apoyar el proyecto
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
