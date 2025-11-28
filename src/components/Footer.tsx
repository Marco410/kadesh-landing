"use client";

import { motion } from 'framer-motion';
import { SOCIAL_LINKS } from 'kadesh/constants/const';
import Image from 'next/image';

export default function Footer() {
  return (
    <div className="bg-white border-t border-green-50 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            {SOCIAL_LINKS.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[32px] text-orange-500 opacity-90 no-underline flex items-center hover:opacity-100 transition-opacity"
              >
                <Image src={s.icon} alt={s.label} width={32} height={32} className="block" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <a 
              href="https://wa.me/524439382330?text=Me%20podr%C3%ADa%20dar%20m%C3%A1s%20informaci%C3%B3n.%20Saludos!" 
              target='_blank' 
              className="text-orange-500 text-base hover:text-orange-600 transition-colors"
            >
              Contacto
            </a>
            <a 
              href="/terminos" 
              className="text-orange-500 text-base hover:text-orange-600 transition-colors"
            >
              Términos y Condiciones
            </a>
          </div>
          <div className="text-center">
            <p className="text-brown-700 text-sm">
              © {new Date().getFullYear()} KADESH. Hecho con ❤️ para los animales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
