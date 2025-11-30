"use client";

import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="bg-[#f5f5f5] dark:bg-[#121212] w-full p-5">
      <div className="max-w-4xl mx-auto px-2 sm:px-0 py-6 sm:py-16">
        <div className="bg-[#ffffff] dark:bg-[#1e1e1e] shadow-md rounded-3xl p-5 sm:p-10 relative overflow-visible min-h-0 mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="hidden sm:block absolute right-0 top-0 w-[100px] h-[100px] bg-[#f7945e] rounded-full opacity-[0.16] blur-xl z-[1] -translate-y-12 translate-x-12"
          />
          <div className="flex flex-col gap-5 items-start relative z-[2]">
            <p className="text-[#f7945e] font-bold text-base tracking-wider uppercase">
              Bienestar animal real, comunidad real
            </p>
            <h2
              className="text-[clamp(1.3rem,6vw,2.2rem)] font-extrabold leading-[1.1] mb-2 text-left bg-gradient-to-r from-[#f7945e] to-[#f8a274] bg-clip-text text-transparent"
            >
              KADESH conecta vidas y multiplica oportunidades para animales y humanos
            </h2>
            <p className="text-lg text-[#212121] dark:text-[#b0b0b0] max-w-full">
              Somos la plataforma digital que une adoptantes, rescatistas, veterinarias y tiendas para transformar el bienestar animal en México. Más que una app: somos un movimiento, una comunidad y un puente para quienes quieren ayudar y quienes lo necesitan.
            </p>
            <p className="text-[17px] text-[#f7945e] font-bold w-full text-center mt-2.5 break-words leading-[1.3]">
              Únete, apoya, comparte. Porque cada vida importa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
