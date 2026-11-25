import Link from "next/link";
import { Suspense } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CreditCardIcon,
  FirstAidKitIcon,
  Megaphone01Icon,
  Message01Icon,
  ServerStack01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Footer, Navigation } from "kadesh/components/layout";
import DonationIcon from "kadesh/components/shared/icons/DonationIcon";
import { Routes } from "kadesh/core/routes";
import {
  DONATION_CTA_LABEL,
  DONATION_DESTINATIONS,
  DONATION_UNIT_PRESETS,
  PODIUM_MIN_NAMED,
  formatDonationAmount,
  namedDonors,
  patitasLabel,
} from "../constants";
import DonateTrigger from "../DonateTrigger";
import DonationReturnNotice from "../DonationReturnNotice";
import type { DonationsBoard } from "../types";
import DonationWall from "./DonationWall";
import DonorTop from "./DonorTop";

/** Same order as `DONATION_DESTINATIONS`. */
const DESTINATION_ICONS = [
  UserGroupIcon,
  ServerStack01Icon,
  Megaphone01Icon,
  FirstAidKitIcon,
];

const STEPS = [
  {
    icon: null,
    title: "Elige tus patitas",
    body: `Cada patita es de ${formatDonationAmount(1)}. Da 1, 3, 5 o las que quieras.`,
  },
  {
    icon: Message01Icon,
    title: "Déjanos un mensaje",
    body: "Opcional. Sale aquí con tu nombre e inicial o como «Alguien anónimo»; o elige no aparecer.",
  },
  {
    icon: CreditCardIcon,
    title: "Paga sin salir de la página",
    body: "Con tarjeta, en un formulario seguro. Te llega el recibo a tu correo.",
  },
] as const;

const WALL_FAQS = [
  {
    question: "¿Se publica cuánto doné?",
    answer:
      "No. El muro y el top cuentan patitas, nunca pesos, y nunca muestran tu correo ni tu apellido completo.",
  },
  {
    question: "¿Puedo donar sin que salga mi nombre?",
    answer:
      "Sí. Elige «Anónimo» y sales como «Alguien anónimo», con tu mensaje. Tus patitas no se juntan con las de otras personas anónimas.",
  },
  {
    question: "¿Puedo donar sin aparecer en el muro?",
    answer:
      "Sí. En el formulario elige «No aparecer»: tu donación no sale en el muro ni en el top, pero sí cuenta en el total, y tu mensaje solo lo lee el equipo.",
  },
  {
    question: "¿Donar me da algo dentro de Kadesh Pet?",
    answer:
      "No. Es una ayuda opcional y no desbloquea nada: reportar, buscar y usar el directorio siguen siendo gratis para todos.",
  },
  {
    question: "¿Cuándo aparece mi patita?",
    answer:
      "En cuanto se confirma el pago entra al muro. La página se actualiza cada 10 minutos.",
  },
  {
    question: "¿Puedo donar más de una vez?",
    answer:
      "Claro. Cada donación sale en el muro y en el top se suman tus patitas del mes y de siempre.",
  },
] as const;

const SECTION_TITLE =
  "text-3xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-4xl";
const SECTION_LEAD =
  "mt-3 max-w-[60ch] text-base leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0] sm:text-lg";
const CTA_ON_BLUE =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-lg font-bold text-kadesh shadow-[0_10px_28px_rgba(15,35,80,0.2)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5";

/**
 * `/donaciones/muro`: the «Dame una patita» wall. Podium and top of donors, the messages, what the
 * patitas pay for, how it works and FAQs. Everything comes from one server request
 * (`fetchDonationsBoard`, 10 min); only «Ver más» asks the browser for more messages.
 */
export default function DonationsWallPage({
  board,
}: {
  board: DonationsBoard;
}) {
  const { supporters, units } = board.summary;
  const showStats = supporters > 0 && units > 0;
  const showTop = namedDonors(board.rankingAllTime) >= PODIUM_MIN_NAMED;

  return (
    <main className="min-h-screen bg-[#f7f8fa] dark:bg-night">
      <Navigation />
      <Suspense fallback={null}>
        <DonationReturnNotice />
      </Suspense>

      {/* Hero */}
      <header className="relative w-full overflow-hidden bg-gradient-to-br from-kadesh to-kadesh-700 pb-20 pt-28 text-white dark:from-kadesh-800 dark:to-[#0b1f4d] sm:pb-24 sm:pt-32">
        {/* Scattered paws, decorative only */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 text-white/[0.07]"
        >
          <DonationIcon
            size={140}
            className="absolute -left-6 top-24 -rotate-12"
          />
          <DonationIcon
            size={90}
            className="absolute right-[12%] top-16 rotate-12"
          />
          <DonationIcon
            size={180}
            className="absolute -bottom-10 right-[-2rem] rotate-[20deg]"
          />
          <DonationIcon
            size={70}
            className="absolute bottom-10 left-[30%] -rotate-6"
          />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <DonationIcon size={36} />
          </span>
          <h1 className="text-4xl font-black tracking-[-0.03em] sm:text-6xl">
            Muro de patitas
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">
            Cada patita es una donación de {formatDonationAmount(1)} para que
            Kadesh Pet siga gratis para quien busca a su mascota. Aquí están
            quienes nos la dieron, con sus mensajes.
          </p>

          {showStats ? (
            <dl className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/20">
                <dt className="text-sm text-white/80">
                  {supporters === 1 ? "Persona" : "Personas"}
                </dt>
                <dd className="text-3xl font-black tabular-nums">
                  {supporters}
                </dd>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/20">
                <dt className="text-sm text-white/80">Patitas</dt>
                <dd className="text-3xl font-black tabular-nums">{units}</dd>
              </div>
            </dl>
          ) : null}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <DonateTrigger
              source="donations_page"
              sourceRef="wall"
              className={CTA_ON_BLUE}
            >
              <DonationIcon size={22} />
              {DONATION_CTA_LABEL}
            </DonateTrigger>
            <a
              href="#en-que-se-usan"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-white/40 px-7 py-3 text-lg font-bold text-white transition-colors hover:bg-white/10"
            >
              ¿En qué se usan?
            </a>
          </div>
        </div>
      </header>

      {/* Top of donors: pulled up over the hero. Hidden until a few donors gave with a name. */}
      {showTop ? (
        <section
          id="donantes"
          aria-labelledby="donantes-heading"
          className="relative -mt-10 scroll-mt-24 px-4 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-4xl">
            <h2 id="donantes-heading" className="sr-only">
              Quienes nos dieron una patita
            </h2>
            <DonorTop
              month={board.rankingMonth}
              allTime={board.rankingAllTime}
            />
            <p className="mt-3 text-center text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
              Quienes nos dieron una patita, por número de patitas. Sin montos
              en pesos.
            </p>
          </div>
        </section>
      ) : null}

      {/* Messages */}
      <section
        id="mensajes"
        aria-labelledby="mensajes-heading"
        className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="mensajes-heading" className={SECTION_TITLE}>
                Mensajes
              </h2>
              <p className={SECTION_LEAD}>
                Lo que nos dejaron quienes dieron una patita, del más reciente
                al más antiguo.
              </p>
            </div>
            <DonateTrigger
              source="donations_page"
              sourceRef="wall"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-kadesh px-5 font-semibold text-white hover:bg-kadesh-600"
            >
              <DonationIcon size={18} />
              Dejar mi mensaje
            </DonateTrigger>
          </div>
          <DonationWall initial={board.wall} />
        </div>
      </section>

      {/* What the patitas pay for */}
      <section
        id="en-que-se-usan"
        aria-labelledby="en-que-se-usan-heading"
        className="w-full scroll-mt-24 bg-white px-4 py-16 dark:bg-night-raised sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <h2 id="en-que-se-usan-heading" className={SECTION_TITLE}>
            ¿En qué se usan las patitas?
          </h2>
          <p className={SECTION_LEAD}>
            Todo lo que se dona entra a Kadesh Pet como proyecto y va a estos
            cuatro destinos. No publicamos porcentajes ni cifras inventadas:
            cuando cerremos un periodo con números verificables, los pondremos
            en{" "}
            <Link
              href={Routes.donations}
              className="font-semibold text-kadesh underline-offset-4 hover:underline dark:text-[#8fb2ff]"
            >
              Donaciones y transparencia
            </Link>
            .
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {DONATION_DESTINATIONS.map((item, index) => (
              <li
                key={item.title}
                className="rounded-3xl border border-[#ececec] bg-[#f7f8fa] p-6 dark:border-white/10 dark:bg-night"
              >
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-kadesh/10 text-kadesh dark:bg-kadesh/20 dark:text-[#8fb2ff]">
                  <HugeiconsIcon
                    icon={DESTINATION_ICONS[index] ?? ServerStack01Icon}
                    size={24}
                    strokeWidth={1.8}
                  />
                </span>
                <h3 className="text-xl font-bold tracking-[-0.02em] text-[#121212] dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section
        aria-labelledby="como-funciona-heading"
        className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <h2 id="como-funciona-heading" className={SECTION_TITLE}>
            Cómo dar una patita
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((stepItem, index) => (
              <li
                key={stepItem.title}
                className="relative rounded-3xl border border-[#ececec] bg-white p-6 dark:border-white/10 dark:bg-night-raised"
              >
                <span
                  className="absolute right-5 top-5 text-4xl font-black text-kadesh/10 dark:text-white/10"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-kadesh text-white">
                  {/* `null` = our own paw (Hugeicons has none). */}
                  {stepItem.icon ? (
                    <HugeiconsIcon
                      icon={stepItem.icon}
                      size={24}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <DonationIcon size={24} />
                  )}
                </span>
                <h3 className="text-lg font-bold text-[#121212] dark:text-white">
                  {stepItem.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
                  {stepItem.body}
                </p>
              </li>
            ))}
          </ol>
          <ul
            className="mt-6 flex flex-wrap gap-2"
            aria-label="Montos sugeridos"
          >
            {DONATION_UNIT_PRESETS.map((preset) => (
              <li
                key={preset}
                className="rounded-full bg-kadesh/10 px-4 py-2 text-sm font-semibold text-kadesh dark:bg-kadesh/20 dark:text-[#8fb2ff]"
              >
                {patitasLabel(preset)} = {formatDonationAmount(preset)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section
        aria-labelledby="muro-faq-heading"
        className="w-full bg-white px-4 py-16 dark:bg-night-raised sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-3xl">
          <h2 id="muro-faq-heading" className={SECTION_TITLE}>
            Preguntas frecuentes
          </h2>
          <div className="mt-8 divide-y divide-[#ececec] rounded-3xl border border-[#ececec] dark:divide-white/10 dark:border-white/10">
            {WALL_FAQS.map((item) => (
              <details key={item.question} className="group px-5 py-4 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-[#121212] dark:text-white [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f1f3f7] text-lg text-kadesh transition-transform group-open:rotate-45 dark:bg-night"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-base leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            ¿Otra duda o quieres apoyar en especie?{" "}
            <Link
              href={Routes.contact}
              className="font-semibold text-kadesh underline-offset-4 hover:underline dark:text-[#8fb2ff]"
            >
              Escríbenos
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Closing call */}
      <section className="w-full bg-gradient-to-br from-kadesh to-kadesh-700 px-4 py-16 text-center text-white dark:from-kadesh-800 dark:to-[#0b1f4d] sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">
            Tu patita también cuenta
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/90">
            Con {formatDonationAmount(1)} nos ayudas a que un reporte llegue a
            más gente y a que Kadesh Pet siga gratis.
          </p>
          <div className="mt-8 flex justify-center">
            <DonateTrigger
              source="donations_page"
              sourceRef="wall"
              className={CTA_ON_BLUE}
            >
              <DonationIcon size={22} />
              {DONATION_CTA_LABEL}
            </DonateTrigger>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
