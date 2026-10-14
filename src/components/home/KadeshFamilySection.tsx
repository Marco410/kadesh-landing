import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

/** Otros productos de la familia Kadesh (Pet es este sitio, así que no se lista). */
const KADESH_FAMILY = [
  {
    name: "Kadesh Business",
    description:
      "Leads B2B de Google Maps e INEGI con teléfono y dirección, y un CRM para darles seguimiento.",
    href: "https://kadesh.com.mx/",
  },
  {
    name: "Kadesh FOOD",
    description: "Software para restaurantes: POS, cocina, inventario y menú QR.",
    href: "https://food.kadesh.com.mx/",
  },
] as const;

function withUtm(href: string) {
  const url = new URL(href);
  url.searchParams.set("utm_source", "kadesh_pet");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "familia_kadesh");
  return url.toString();
}

export default function KadeshFamilySection() {
  return (
    <section
      id="familia-kadesh"
      aria-labelledby="familia-kadesh-heading"
      className="w-full bg-white py-24 dark:bg-night"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-kadesh">
            Familia Kadesh
          </p>
          <h2
            id="familia-kadesh-heading"
            className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl"
          >
            Más productos de la familia Kadesh
          </h2>
          <p className="text-lg text-[#5a5a5a] dark:text-[#b0b0b0]">
            KADESH Pet, Kadesh Business y Kadesh FOOD los hace el mismo equipo.
            Si tienes un negocio o un restaurante, también podemos ayudarte.
          </p>
        </div>

        <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {KADESH_FAMILY.map((product) => (
            <li key={product.name} className="h-full">
              <a
                href={withUtm(product.href)}
                target="_blank"
                rel="noopener"
                aria-label={`Visitar ${product.name}`}
                className="group flex h-full flex-col items-center rounded-2xl border border-[#ececec] bg-[#f7f8fa] p-6 text-center transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-kadesh/40 hover:shadow-[0_16px_40px_rgba(15,35,80,0.08)] dark:border-white/10 dark:bg-night-raised sm:p-8"
              >
                <span className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-kadesh">
                  Familia Kadesh
                </span>
                <span className="mb-5 flex h-24 items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt=""
                    width={48}
                    height={48}
                    aria-hidden
                    className="h-12 w-12 object-contain brightness-0 dark:invert"
                  />
                  <span className="text-xl font-bold tracking-tight text-[#121212] dark:text-white">
                    {product.name}
                  </span>
                </span>
                <span className="text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
                  {product.description}
                </span>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-kadesh">
                  Conocer más
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={16}
                    strokeWidth={2}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
