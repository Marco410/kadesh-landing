"use client";

import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="bg-gray-50 w-full p-5">
      <div className="max-w-4xl mx-auto px-2 sm:px-0 py-6 sm:py-16">
        <div className="bg-white shadow-md rounded-3xl p-5 sm:p-10 relative overflow-visible min-h-0 mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="hidden sm:block absolute right-0 top-0 w-[100px] h-[100px] bg-orange-500 rounded-full opacity-[0.16] blur-xl z-[1] -translate-y-12 translate-x-12"
          />
          <div className="flex flex-col gap-5 items-start relative z-[2]">
            <p className="text-orange-500 font-bold text-base tracking-wider uppercase">
              Bienestar animal real, comunidad real
            </p>
            <h2
              className="text-[clamp(1.3rem,6vw,2.2rem)] font-extrabold leading-[1.1] mb-2 text-left bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent"
            >
              KADESH conecta vidas y multiplica oportunidades para animales y humanos
            </h2>
            <p className="text-lg text-brown-700 max-w-full">
              Somos la plataforma digital que une adoptantes, rescatistas, veterinarias y tiendas para transformar el bienestar animal en México. Más que una app: somos un movimiento, una comunidad y un puente para quienes quieren ayudar y quienes lo necesitan.
            </p>
            <p className="text-[17px] text-orange-500 font-bold w-full text-center mt-2.5 break-words leading-[1.3]">
              Únete, apoya, comparte. Porque cada vida importa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
