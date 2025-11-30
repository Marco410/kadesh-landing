"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DonationsSection() {
  return (
    <section id="donaciones" className="w-full py-20 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-[#1a1a1a] dark:to-[#121212]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-white"
        >
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Donaciones y comunidad
          </h2>
          
          <p className="text-xl sm:text-2xl text-white/90 mb-4 max-w-3xl mx-auto leading-relaxed">
            Cada contribución nos acerca más a nuestro objetivo: crear un santuario digital donde cada perro tenga una oportunidad y cada rescatista tenga el apoyo que necesita.
          </p>
          
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Tu apoyo hace posible que KADESH siga creciendo y ayudando a más animales cada día.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="https://donate.stripe.com/6oU7sL6467dtdrY9FZgUM00"
                target="_blank"
                className="inline-block px-8 py-4 bg-white text-orange-500 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-orange-50"
              >
                Apoyar el proyecto
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/fundadores"
                className="inline-block px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                Convertirme en fundador
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

