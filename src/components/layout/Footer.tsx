"use client";

import Link from 'next/link';
import Logo from '../shared/Logo';
import { Routes } from 'kadesh/core/routes';

/** Otros productos de la familia Kadesh (Pet es este sitio, así que no se lista). */
const KADESH_FAMILY = [
  { label: "Kadesh Business", href: "https://kadesh.com.mx/" },
  { label: "Kadesh FOOD", href: "https://food.kadesh.com.mx/" },
] as const;

function withUtm(href: string) {
  const url = new URL(href);
  url.searchParams.set("utm_source", "kadesh_pet");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "familia_kadesh");
  return url.toString();
}

const FOOTER_COLUMNS = [
  {
    title: "Recursos",
    links: [
      { label: "Blog", href: Routes.blog.index },
      { label: "Novedades y roadmap", href: Routes.novedades },
      { label: "Conócenos", href: Routes.conocenos },
    ],
  },
  {
    title: "Servicios",
    links: [
      { label: "Animales", href: Routes.animals.index },
      { label: "Directorio de veterinarias", href: Routes.veterinaries.index },
      { label: "Donaciones", href: Routes.donations },
    ],
  },
  {
    title: "Para negocios",
    links: [
      { label: "Anúnciate", href: Routes.advertise },
      { label: "Registra tu veterinaria", href: Routes.veterinaries.register },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos y condiciones", href: Routes.terms },
      { label: "Privacidad", href: Routes.privacy },
      { label: "Contacto", href: Routes.contact },
    ],
  },
] as const;

const linkClass =
  "text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-sm";

export default function Footer() {
  return (
    <footer className="w-full bg-night-raised text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Logo className="mb-4" />
            <p className="text-gray-400 text-sm leading-relaxed">
              Santuario digital para el bienestar animal. Tecnología, compasión y comunidad.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-white font-bold mb-4">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-white font-bold mb-4">Familia Kadesh</p>
            <ul className="space-y-2">
              {KADESH_FAMILY.map((product) => (
                <li key={product.href}>
                  <a href={withUtm(product.href)} target="_blank" rel="noopener" className={linkClass}>
                    {product.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} KADESH. Todos los derechos reservados.
            </p>
            <p className="text-gray-400 text-sm text-center md:text-right">
              Hecho con ❤️ para el bienestar animal
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

