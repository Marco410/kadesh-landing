import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Tick02Icon, WhatsappIcon } from "@hugeicons/core-free-icons";
import Logo from "kadesh/components/shared/Logo";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import {
  ACCEPTED,
  ADVERTISE_FAQS,
  ADVERTISE_GENERAL_MESSAGE,
  BENEFITS,
  FOUNDER_SPOTS_LEFT,
  PLANS,
  REJECTED,
  SHOW_FOUNDER_OFFER,
  STEPS,
  advertiseWhatsAppUrl,
} from "kadesh/components/advertise/constants";

const card =
  "rounded-2xl border border-[#ececec] bg-white dark:border-white/10 dark:bg-night";
const muted = "text-[#5a5a5a] dark:text-[#9aa3b2]";
const heading = "text-[#121212] dark:text-white";
const sectionTitle = `mb-3 text-center text-3xl font-black tracking-[-0.02em] sm:text-4xl ${heading}`;
const btnBase =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-base font-bold transition-colors sm:w-auto";
const btnPrimary = `${btnBase} bg-kadesh text-white hover:bg-kadesh-600`;
const btnGhost = `${btnBase} border-2 border-kadesh text-kadesh hover:bg-kadesh-50 dark:text-kadesh-300 dark:hover:bg-kadesh/15`;

const LEGAL_LINKS = [
  { label: "Términos", href: Routes.terms },
  { label: "Privacidad", href: Routes.privacy },
  { label: "Contacto", href: Routes.contact },
] as const;

function WhatsAppButton({ className }: { className: string }) {
  return (
    <a
      href={advertiseWhatsAppUrl(ADVERTISE_GENERAL_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <HugeiconsIcon icon={WhatsappIcon} size={20} strokeWidth={1.75} />
      Escríbenos por WhatsApp
    </a>
  );
}

/** Página para dueños de negocio: una sola acción (WhatsApp), sin menú completo. */
export default function AdvertisePage() {
  const plans = PLANS.filter((plan) => SHOW_FOUNDER_OFFER || !plan.founder);

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-night-raised">
      <header className="w-full border-b border-[#ececec] bg-white dark:border-white/10 dark:bg-night">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <Link href={Routes.home} aria-label="Ir a la portada de KADESH" className="flex items-center gap-2">
            <Logo size={36} className="brightness-0 dark:invert" />
            <span className={`text-lg font-black tracking-tight ${heading}`}>KADESH Pet</span>
          </Link>
        </div>
      </header>

      <main>
        {/* 1. Hero */}
        <section className="w-full bg-white py-20 dark:bg-night sm:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <span className="mb-5 inline-block rounded-full bg-kadesh-50 px-3 py-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-kadesh-700 dark:bg-kadesh/15 dark:text-kadesh-300">
              Para veterinarias y negocios de mascotas
            </span>
            <h1 className={`mb-5 text-4xl font-black leading-[1.05] tracking-[-0.03em] sm:text-5xl ${heading}`}>
              Que los dueños de mascotas de tu colonia te conozcan, y de paso
              ayudas a que más animales vuelvan a casa
            </h1>
            <p className={`mx-auto mb-8 max-w-2xl text-lg leading-relaxed ${muted}`}>
              Aparece en las fichas de mascotas y veterinarias de Kadesh Pet y en
              nuestras publicaciones de Facebook. Un solo anuncio por vista,
              siempre marcado como «Publicidad».
            </p>
            <WhatsAppButton className={cn(btnPrimary, "min-h-14 px-8 text-lg")} />
            <p className={`mt-4 text-sm ${muted}`}>
              Desde $99 al mes · Sin contratos · En línea en menos de 48 horas
            </p>

            {SHOW_FOUNDER_OFFER && (
              <p className="mx-auto mt-10 max-w-2xl rounded-xl border border-green-600/30 bg-green-50 px-4 py-3 text-[15px] text-green-800 dark:bg-green-500/10 dark:text-green-200">
                <strong className="font-semibold">Negocios fundadores:</strong> los
                primeros 5 aparecen gratis mientras la plataforma crece.
                {FOUNDER_SPOTS_LEFT != null &&
                  ` Quedan ${FOUNDER_SPOTS_LEFT} ${FOUNDER_SPOTS_LEFT === 1 ? "lugar" : "lugares"}.`}
              </p>
            )}
          </div>
        </section>

        {/* 2. Por qué anunciarte aquí */}
        <section className="w-full py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className={`${sectionTitle} mb-10`}>
              Tu negocio, justo donde los dueños de mascotas ponen atención
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {BENEFITS.map((benefit) => (
                <li key={benefit.title} className={`${card} p-6`}>
                  <h3 className={`mb-1.5 text-[17px] font-bold ${heading}`}>{benefit.title}</h3>
                  <p className={`text-[15px] leading-relaxed ${muted}`}>{benefit.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. Planes */}
        <section className="w-full bg-white py-20 dark:bg-night">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className={sectionTitle}>Elige cómo aparecer</h2>
            <p className={`mb-10 text-center text-[15px] ${muted}`}>
              Pago mensual, sin contratos. Paga 3 meses y el tercero es gratis.
            </p>

            <div
              className={cn(
                "grid grid-cols-1 gap-4 pt-3",
                plans.length === 3 ? "md:grid-cols-3" : "mx-auto max-w-3xl md:grid-cols-2",
              )}
            >
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={cn(
                    card,
                    "relative flex flex-col p-6 sm:p-7",
                    plan.featured && "border-2 border-kadesh dark:border-kadesh",
                  )}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-6 rounded-full bg-kadesh px-2.5 py-1 text-xs font-bold text-white">
                      Mayor alcance
                    </span>
                  )}
                  <h3 className={`mb-1 text-xl font-black ${heading}`}>{plan.name}</h3>
                  <p className={`mb-5 text-sm md:min-h-10 ${muted}`}>{plan.audience}</p>
                  <p className={`text-4xl font-black tracking-[-0.02em] ${heading}`}>
                    {plan.price}{" "}
                    <span className={`text-[15px] font-medium tracking-normal ${muted}`}>
                      {plan.priceNote}
                    </span>
                  </p>
                  <ul className="my-6 flex flex-1 flex-col gap-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex gap-2.5 text-[15px] leading-snug text-[#3a3a3a] dark:text-[#c5ccd8]"
                      >
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          size={18}
                          strokeWidth={2.5}
                          className="mt-0.5 shrink-0 text-kadesh"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={advertiseWhatsAppUrl(plan.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(plan.featured ? btnPrimary : btnGhost, "sm:w-full")}
                  >
                    {plan.cta}
                  </a>
                </article>
              ))}
            </div>
            <p className={`mt-4 text-center text-sm ${muted}`}>Precios en pesos mexicanos.</p>
          </div>
        </section>

        {/* 4. Cómo funciona */}
        <section className="w-full py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className={`${sectionTitle} mb-10`}>Tu anuncio en línea en menos de 48 horas</h2>
            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className={`${card} p-5`}>
                  <span className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-kadesh text-[15px] font-black text-white">
                    {index + 1}
                  </span>
                  <h3 className={`mb-1.5 font-bold ${heading}`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${muted}`}>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 5. Qué anuncios aceptamos */}
        <section className="w-full bg-white py-20 dark:bg-night">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className={`${sectionTitle} mb-10`}>Solo anuncios que van con el rescate animal</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className={`${card} bg-[#f7f8fa] p-6 dark:bg-night-raised`}>
                <h3 className={`mb-3.5 flex items-center gap-2.5 text-[17px] font-bold ${heading}`}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                    <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.5} />
                  </span>
                  Sí
                </h3>
                <ul className="list-disc space-y-1.5 pl-5 text-[15px] text-[#3a3a3a] dark:text-[#c5ccd8]">
                  {ACCEPTED.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={`${card} bg-[#f7f8fa] p-6 dark:bg-night-raised`}>
                <h3 className={`mb-3.5 flex items-center gap-2.5 text-[17px] font-bold ${heading}`}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300">
                    <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2.5} />
                  </span>
                  No
                </h3>
                <ul className="list-disc space-y-1.5 pl-5 text-[15px] text-[#3a3a3a] dark:text-[#c5ccd8]">
                  {REJECTED.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Preguntas frecuentes */}
        <section className="w-full py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className={`${sectionTitle} mb-10`}>Preguntas frecuentes</h2>
            <div className="space-y-8">
              {ADVERTISE_FAQS.map((item) => (
                <article key={item.question}>
                  <h3 className={`mb-2 text-xl font-bold ${heading}`}>{item.question}</h3>
                  <p className="leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Cierre */}
        <section className="w-full px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-3xl bg-kadesh px-6 py-12 text-center text-white dark:bg-kadesh-800">
            <h2 className="mb-3 text-3xl font-black tracking-[-0.02em] sm:text-4xl">
              ¿Listo para que tu colonia te conozca?
            </h2>
            <p className="mx-auto mb-7 max-w-xl text-lg leading-relaxed text-white">
              Escríbenos y te decimos qué paquete le conviene a tu negocio. Sin
              compromiso.
            </p>
            <WhatsAppButton className={`${btnBase} bg-white text-kadesh hover:bg-kadesh-50`} />
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-white/10 bg-night-raised text-gray-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} KADESH</p>
          <ul className="flex gap-6">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}
