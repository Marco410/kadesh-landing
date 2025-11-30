"use client";

import { motion } from 'framer-motion';

const problems = [
  {
    title: 'Animales perdidos',
    desc: 'Miles de animales se pierden cada año y pocos logran volver a casa.',
  },
  {
    title: 'Refugios sin visibilidad',
    desc: 'Muchos refugios y protectoras no tienen recursos ni alcance para ayudar a más animales.',
  },
  {
    title: 'Comunidad desconectada',
    desc: 'Falta unión y canales efectivos para quienes quieren ayudar o adoptar.',
  },
];

const solutions = [
  {
    title: 'Geolocalización y conexión',
    desc: 'Conecta personas y refugios cercanos para ayudar a animales perdidos o en adopción.',
  },
  {
    title: 'Visibilidad y apoyo',
    desc: 'Damos visibilidad a refugios, tiendas y veterinarias aliadas para que reciban más ayuda.',
  },
  {
    title: 'Comunidad activa',
    desc: 'Fomentamos una red solidaria y espiritual para transformar vidas y crear impacto real.',
  },
];

export default function ProblemSolution() {
  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8" id='solucion'>
      <div className="flex flex-col gap-12">
        <h2 className="text-4xl font-bold text-[#212121] dark:text-[#ffffff] mb-2 px-5">
          El Problema y Nuestra Solución
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-2.5 px-8">
          {problems.map((p) => (
            <div
              key={p.title}
              className="rounded-3xl h-full"
            >
              <div className="bg-[#ffffff] dark:bg-[#1e1e1e] shadow-md p-8 rounded-3xl min-w-[260px] max-w-[320px] border-none relative min-h-[180px] flex flex-col justify-center h-full mx-auto">
                <div className="absolute -left-8 -top-8 w-16 h-16 bg-[#f7945e] rounded-full opacity-[0.13] z-[1]" />
                <h4 className="text-[#f7945e] text-xl mb-2 relative z-[2] font-semibold">{p.title}</h4>
                <p className="text-[#212121] dark:text-[#b0b0b0] relative z-[2]">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 px-8">
          {solutions.map((s) => (
            <div
              key={s.title}
              className="rounded-3xl h-full"
            >
              <div className="bg-[#f5f5f5] dark:bg-[#1e1e1e] shadow-md p-8 rounded-3xl min-w-[260px] max-w-[320px] border-none relative min-h-[180px] flex flex-col justify-center h-full mx-auto">
                <div className="absolute -right-8 -bottom-8 w-16 h-16 bg-[#f7945e] rounded-full opacity-[0.13] z-[1]" />
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
