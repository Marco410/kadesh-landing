"use client";

import Link from 'next/link';

const FOOTER_LINKS = {
  recursos: [
    { label: "Blog", href: "/blog" },
    { label: "Noticias", href: "/noticias" },
    { label: "Historias", href: "/historias" },
  ],
  servicios: [
    { label: "Donaciones", href: "/donaciones" },
    { label: "Registro de veterinarias", href: "/veterinarias/registro" },
    { label: "Directorio", href: "/veterinarias" },
  ],
  legal: [
    { label: "Términos y condiciones", href: "/terminos" },
    { label: "Privacidad", href: "/privacidad" },
    { label: "Contacto", href: "/contacto" },
  ],
};

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 dark:bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-black text-white mb-4">KADESH</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Santuario digital para el bienestar animal. Tecnología, compasión y comunidad.
            </p>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="text-white font-bold mb-4">Recursos</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.recursos.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="text-white font-bold mb-4">Servicios</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.servicios.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
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
            <p className="text-gray-500 text-sm text-center md:text-right">
              Hecho con ❤️ para el bienestar animal
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

