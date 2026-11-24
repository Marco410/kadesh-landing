"use client";

import { KADESH_SOCIAL_LINKS } from 'kadesh/core/social';
import { HugeiconsIcon } from '@hugeicons/react';

export default function Footer() {
  return (
    <div className="bg-[#ffffff] dark:bg-[#121212] border-t border-[#e0e0e0] dark:border-[#3a3a3a] mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            {KADESH_SOCIAL_LINKS.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.label} de Kadesh Pet`}
                className="text-[#f7945e] opacity-90 no-underline flex items-center hover:opacity-100 transition-opacity"
              >
                <HugeiconsIcon icon={s.icon} size={32} aria-hidden="true" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <a 
              href="https://wa.me/524439382330?text=Me%20podr%C3%ADa%20dar%20m%C3%A1s%20informaci%C3%B3n.%20Saludos!" 
              target='_blank' 
              className="text-[#f7945e] text-base hover:text-[#e3824f] transition-colors"
            >
              Contacto
            </a>
            <a 
              href="/terminos" 
              className="text-[#f7945e] text-base hover:text-[#e3824f] transition-colors"
            >
              Términos y Condiciones
            </a>
          </div>
          <div className="text-center">
            <p className="text-[#212121] dark:text-[#b0b0b0] text-sm">
              © {new Date().getFullYear()} KADESH. Hecho con ❤️ para los animales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
