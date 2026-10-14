import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  FavouriteIcon,
  Megaphone01Icon,
  Tick02Icon,
  UserGroupIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { SITE_URL } from "kadesh/core/site";
import { cn } from "kadesh/utils/cn";
import { kadeshWhatsAppUrl } from "kadesh/utils/kadeshWhatsApp";

/** Poner en false cuando ya haya 5 negocios fundadores: oculta el banner y el paquete Fundador. */
const SHOW_FOUNDER_OFFER = true;

const SOURCE = `${SITE_URL.replace(/^https?:\/\//, "")}/${Routes.navigation.advertise}`;

/** Cada botón dice qué paquete eligieron y de dónde vienen, para saberlo desde el primer mensaje. */
function whatsAppFor(message: string) {
  return kadeshWhatsAppUrl(`${message} ¿Me pueden dar información?\nLo vi en: ${SOURCE}`);
}

const BENEFITS = [
  {
    icon: UserGroupIcon,
    title: "Donde está la comunidad",
    body: "Tu negocio aparece en publicaciones que dueños de mascotas de tu ciudad leen y comparten en Facebook.",
  },
  {
    icon: Megaphone01Icon,
    title: "Un solo anuncio por página",
    body: "No compartes el espacio con nadie. Cuando apareces, eres el único negocio en esa vista.",
  },
  {
    icon: FavouriteIcon,
    title: "Publicidad con propósito",
    body: "Siempre marcada como \"Publicidad\" y separada de la información. Tu marca apoya el rescate de animales.",
  },
] as const;

const PLANS = [
  {
    name: "Fundador",
    audience: "Cupo para 5 negocios que nos apoyan desde el inicio.",
    price: "Gratis",
    priceNote: "mientras crecemos",
    features: [
      "Tu anuncio en las fichas de animales y veterinarias",
      "Botón directo a tu WhatsApp, web o llamada",
      'Apareces como "Negocio que apoya KADESH Pet"',
    ],
    message: "Hola, me interesa ser negocio Fundador en KADESH Pet.",
    cta: "Quiero ser fundador",
    featured: false,
    founder: true,
  },
  {
    name: "Comunidad",
    audience: "Para negocios que quieren que su ciudad los conozca.",
    price: "$199",
    priceNote: "MXN / mes",
    features: [
      "3 menciones al mes en nuestras publicaciones de Facebook",
      "Tu anuncio en las fichas de la web, incluido",
      "Reporte mensual de alcance y clics",
      "Te ayudamos a diseñar tu anuncio",
    ],
    message: "Hola, me interesa el paquete Comunidad para anunciar mi negocio en KADESH Pet.",
    cta: "Me interesa",
    featured: true,
    founder: false,
  },
  {
    name: "Mi ficha destacada",
    audience: "Solo para veterinarias registradas en KADESH Pet.",
    price: "$99",
    priceNote: "MXN / mes",
    features: [
      "Tu propia promoción dentro de tu ficha",
      "Sin anuncios de terceros en tu página",
      "Cambia tu promoción cada mes",
    ],
    message: "Hola, tengo una veterinaria y me interesa Mi ficha destacada en KADESH Pet.",
    cta: "Me interesa",
    featured: false,
    founder: false,
  },
] as const;

const STEPS = [
  { title: "Escríbenos", body: "Cuéntanos por WhatsApp de tu negocio, tu zona y qué quieres promover." },
  { title: "Envía tu material", body: "Tu logo o una foto, un título corto y a dónde quieres que te contacten." },
  { title: "Lo armamos y revisas", body: "Diseñamos tu anuncio con el estilo de KADESH Pet y te lo mostramos antes de publicar." },
  { title: "Publicamos y medimos", body: "Te enviamos una captura en vivo y, cada mes, tus vistas y clics." },
] as const;

const ACCEPTED = [
  "Veterinarias y clínicas",
  "Tiendas de mascotas y alimento",
  "Estéticas, pensiones y guarderías",
  "Adiestradores y paseadores",
  "Collares GPS, placas y seguros para mascotas",
  "Otros negocios locales",
] as const;

const REJECTED = [
  "Venta o cría de animales",
  "Rifas o regalos de mascotas",
  "Productos milagro o medicamentos sin receta",
  "Contenido que vaya contra el rescate y la adopción",
] as const;

const card =
  "rounded-2xl border border-[#ececec] bg-white dark:border-white/10 dark:bg-night";
const muted = "text-[#5a5a5a] dark:text-[#9aa3b2]";
const heading = "text-[#121212] dark:text-white";
const subtitle = `mb-2 text-center text-2xl font-black tracking-[-0.02em] ${heading}`;
const subnote = `mb-7 text-center text-[15px] ${muted}`;
const btnBase =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-base font-bold transition-colors sm:w-auto";
const btnPrimary = `${btnBase} bg-kadesh text-white hover:bg-kadesh-600`;
const btnGhost = `${btnBase} border-2 border-kadesh text-kadesh hover:bg-kadesh-50 dark:hover:bg-kadesh/15`;

export default function AdvertiseSection() {
  return (
    <section
      id="anunciate"
      aria-labelledby="anunciate-heading"
      className="w-full scroll-mt-20 bg-[#f7f8fa] py-24 dark:bg-night-raised"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-12 max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-kadesh-50 px-3 py-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-kadesh dark:bg-kadesh/15 dark:text-kadesh-300">
            Para negocios
          </span>
          <h2
            id="anunciate-heading"
            className={`mb-4 text-4xl font-black tracking-[-0.03em] sm:text-5xl ${heading}`}
          >
            Tu negocio, junto a las mascotas de tu colonia
          </h2>
          <p className={`text-lg leading-relaxed ${muted}`}>
            Aparece en las publicaciones de mascotas perdidas y reencuentros que la
            comunidad comparte en Facebook, y en las fichas de KADESH Pet. Y de paso,
            ayudas a que la plataforma siga siendo gratis para todos.
          </p>
        </header>

        {/* Por qué hay anuncios */}
        <div className="mx-auto mb-14 max-w-3xl rounded-2xl border border-kadesh/20 bg-kadesh-50/60 p-5 text-sm leading-relaxed dark:bg-kadesh/10 sm:p-6">
          <p className={`mb-1.5 font-bold ${heading}`}>
            ¿Por qué hay anuncios en KADESH Pet?
          </p>
          <p className="text-[#3a3a3a] dark:text-[#c5ccd8]">
            Reportar un animal, buscar veterinarias y ayudar a que una mascota
            regrese a casa es gratis. Mantener la plataforma sí cuesta: servidores,
            base de datos, mapas, fotos y avisos. Los anuncios ayudan a cubrir una
            parte de ese mantenimiento y de la infraestructura. Son pocos, siempre
            marcados como &quot;Publicidad&quot; y separados de la información del
            animal o la veterinaria.
          </p>
        </div>

        <ul className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className={`${card} p-6`}>
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-kadesh-50 text-kadesh dark:bg-kadesh/15 dark:text-kadesh-300">
                <HugeiconsIcon icon={benefit.icon} size={22} strokeWidth={1.75} />
              </span>
              <h3 className={`mb-1.5 text-[17px] font-bold ${heading}`}>{benefit.title}</h3>
              <p className={`text-[15px] leading-relaxed ${muted}`}>{benefit.body}</p>
            </li>
          ))}
        </ul>

        {/* Planes */}
        <h3 className={subtitle}>Elige cómo aparecer</h3>
        <p className={subnote}>Pago mensual, sin contratos largos. Cancela cuando quieras.</p>

        {SHOW_FOUNDER_OFFER && (
          <p className="mx-auto mb-8 max-w-3xl rounded-xl border border-green-600/30 bg-green-50 px-4 py-3 text-center text-[15px] text-green-800 dark:bg-green-500/10 dark:text-green-200">
            <strong className="font-semibold">Negocios fundadores:</strong> los primeros
            5 negocios aparecen gratis en la web mientras la plataforma crece.
          </p>
        )}

        <div
          className={cn(
            "mb-4 grid grid-cols-1 gap-4 pt-3",
            SHOW_FOUNDER_OFFER ? "md:grid-cols-3" : "mx-auto max-w-3xl md:grid-cols-2",
          )}
        >
          {PLANS.filter((plan) => SHOW_FOUNDER_OFFER || !plan.founder).map((plan) => (
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
              <h4 className={`mb-1 text-xl font-black ${heading}`}>{plan.name}</h4>
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
                href={whatsAppFor(plan.message)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(plan.featured ? btnPrimary : btnGhost, "sm:w-full")}
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
        <p className={`mb-16 text-center text-sm ${muted}`}>
          Paga 3 meses y el tercero es gratis. Precios en pesos mexicanos.
        </p>

        {/* Pasos */}
        <h3 className={subtitle}>Así de fácil</h3>
        <p className={subnote}>Tu anuncio puede estar en línea en menos de 48 horas.</p>
        <ol className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className={`${card} p-5`}>
              <span className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-kadesh text-[15px] font-black text-white">
                {index + 1}
              </span>
              <h4 className={`mb-1.5 font-bold ${heading}`}>{step.title}</h4>
              <p className={`text-sm leading-relaxed ${muted}`}>{step.body}</p>
            </li>
          ))}
        </ol>

        {/* Política */}
        <h3 className={subtitle}>Qué anuncios aceptamos</h3>
        <p className={subnote}>Cuidamos que cada anuncio vaya con el propósito de la plataforma.</p>
        <div className="mb-14 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className={`${card} p-6`}>
            <h4 className={`mb-3.5 flex items-center gap-2.5 text-[17px] font-bold ${heading}`}>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.5} />
              </span>
              Sí aceptamos
            </h4>
            <ul className="list-disc space-y-1.5 pl-5 text-[15px] text-[#3a3a3a] dark:text-[#c5ccd8]">
              {ACCEPTED.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className={`${card} p-6`}>
            <h4 className={`mb-3.5 flex items-center gap-2.5 text-[17px] font-bold ${heading}`}>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300">
                <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2.5} />
              </span>
              No aceptamos
            </h4>
            <ul className="list-disc space-y-1.5 pl-5 text-[15px] text-[#3a3a3a] dark:text-[#c5ccd8]">
              {REJECTED.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={`mt-3.5 text-sm leading-relaxed ${muted}`}>
              En la ficha de una veterinaria nunca mostramos anuncios de otra
              veterinaria.
            </p>
          </div>
        </div>

        {/* CTA final */}
        <div className="rounded-3xl bg-kadesh px-6 py-11 text-center text-white dark:bg-kadesh-800">
          <h3 className="mb-2.5 text-2xl font-black tracking-[-0.02em] sm:text-3xl">
            ¿Listo para aparecer en KADESH Pet?
          </h3>
          <p className="mx-auto mb-6 max-w-xl text-base leading-relaxed text-white/85">
            Escríbenos y te decimos qué paquete le conviene a tu negocio. Sin
            compromiso.
          </p>
          <a
            href={whatsAppFor("Hola, me gustaría anunciar mi negocio en KADESH Pet.")}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnBase} bg-white text-kadesh hover:bg-kadesh-50`}
          >
            <HugeiconsIcon icon={WhatsappIcon} size={20} strokeWidth={1.75} />
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
