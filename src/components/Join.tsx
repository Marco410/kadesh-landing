"use client";

import { motion } from 'framer-motion';

export default function Join() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8" id="unete">
      <div className="bg-[#ffffff] dark:bg-[#1e1e1e] shadow-md rounded-3xl p-10 border-none relative overflow-visible mx-4">
        <div className="absolute -left-12 -bottom-12 w-[120px] h-[120px] bg-[#f7945e] rounded-full opacity-[0.18] z-[1]" />
        <div className="flex flex-col gap-6 items-start relative z-[2] text-center">
          <h2 className="text-3xl font-bold text-[#212121] dark:text-[#ffffff]">
            ¿Eres refugio, tienda o veterinaria?
          </h2>
          <p className="text-lg text-[#212121] dark:text-[#b0b0b0] max-w-[600px]">
            Únete a nuestra red de aliados y multiplica tu impacto. Juntos podemos salvar más vidas y fortalecer la comunidad animalista.
          </p>
          <div className="w-full flex justify-center">
            <motion.div 
              whileHover={{ scale: 1.08, boxShadow: "0 4px 24px rgba(247, 148, 94, 0.2)" }} 
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              <a 
                href="https://wa.me/524439382330?text=Hola!%20me%20gustar%C3%ADa%20ser%20parte%20de%20Kadesh."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-[#f7945e] text-white font-bold text-lg rounded-3xl hover:bg-[#e3824f] transition-colors"
              >
                Quiero unirme
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
