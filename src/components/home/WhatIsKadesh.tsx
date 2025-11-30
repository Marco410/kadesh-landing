"use client";

import { motion } from 'framer-motion';

export default function WhatIsKadesh() {
  return (
    <section id="que-es-kadesh" className="w-full py-20 bg-white dark:bg-[#121212]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6">
            ¿Qué es KADESH?
          </h2>
          
          <div className="space-y-6 text-lg sm:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              KADESH es más que una plataforma tecnológica. Es un <strong className="text-orange-500 dark:text-orange-400">santuario digital</strong> donde la tecnología se encuentra con la compasión, donde cada conexión tiene un propósito espiritual y cada acción busca el bienestar real de nuestros compañeros animales.
            </p>
            
            <p>
              Nuestra misión trasciende lo funcional: creamos un espacio donde <strong className="text-orange-500 dark:text-orange-400">rescatistas, adoptantes, veterinarias y refugios</strong> se unen en una red de esperanza, donde cada perro perdido tiene una oportunidad y cada historia de rescate inspira a la comunidad.
            </p>
            
            <p className="text-orange-600 dark:text-orange-400 font-semibold">
              Tecnología moderna. Corazón compasivo. Misión espiritual.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

