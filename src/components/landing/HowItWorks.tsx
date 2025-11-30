"use client";

import { motion } from 'framer-motion';

const steps = [
  {
    title: 'Conexión por geolocalización',
    desc: 'Encuentra y ayuda animales cerca de ti, conecta con refugios y aliados locales.',
  },
  {
    title: 'Anuncios de adopción',
    desc: 'Publica o explora animales en adopción y ayuda a encontrarles un hogar.',
  },
  {
    title: 'Recompensas por ayudar',
    desc: 'Recibe reconocimientos y beneficios por tu apoyo a la comunidad animalista.',
  },
];

export default function HowItWorks() {
  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8" id="como-funciona">
      <div className="flex flex-col gap-12">
        <h2 className="text-4xl font-bold text-[#212121] dark:text-[#ffffff] mb-2 pl-8">
          ¿Cómo funciona KADESH?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pl-8">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="rounded-3xl h-full"
            >
              <div className={`shadow-md p-8 rounded-3xl min-w-[260px] max-w-[320px] border-none relative flex flex-col h-full mx-auto ${i === 1 ? 'bg-[#f5f5f5] dark:bg-[#1e1e1e]' : 'bg-[#ffffff] dark:bg-[#1e1e1e]'}`}>
                {/* Círculo de acento */}
                <div className="absolute -left-8 -top-8 w-16 h-16 bg-[#f7945e] rounded-full opacity-[0.13] z-[1]" />
                <h4 className="text-[#f7945e] text-xl mb-2 relative z-[2] font-semibold">{s.title}</h4>
                <p className="text-[#212121] dark:text-[#b0b0b0] relative z-[2]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
