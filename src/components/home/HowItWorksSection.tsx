"use client";

import { motion } from 'framer-motion';

const STEPS = [
  {
    number: "1",
    title: "Reporta",
    description: "Reporta un perro perdido o en situación vulnerable. Tu información puede salvar una vida.",
    icon: "📢"
  },
  {
    number: "2",
    title: "Conecta",
    description: "Conecta con rescatistas, veterinarias y refugios en tu área. La red se fortalece con cada conexión.",
    icon: "🔗"
  },
  {
    number: "3",
    title: "Ayuda",
    description: "Apoya con donaciones, voluntariado o compartiendo información. Cada acción cuenta.",
    icon: "🤝"
  },
  {
    number: "4",
    title: "Adopta",
    description: "Encuentra el compañero perfecto o ayuda a encontrar un hogar. Cada adopción es una historia de esperanza.",
    icon: "❤️"
  },
];

export default function HowItWorksSection() {
  return (
    <section id="como-funciona" className="w-full py-20 bg-white dark:bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Cómo funciona KADESH
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Cuatro pasos simples para hacer la diferencia
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line (hidden on mobile, visible on desktop) */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-orange-500 to-transparent -z-10" 
                     style={{ width: 'calc(100% - 4rem)', left: 'calc(100% - 2rem)' }}></div>
              )}
              
              <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl p-8 text-center h-full border border-gray-200 dark:border-gray-800 hover:border-orange-500 dark:hover:border-orange-500 transition-colors duration-300">
                <div className="text-6xl mb-4">{step.icon}</div>
                <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

