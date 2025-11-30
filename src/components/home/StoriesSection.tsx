"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

const MOCK_STORIES = [
  {
    id: 1,
    title: "Max encontró su hogar después de 3 meses",
    excerpt: "La historia de cómo una familia adoptó a Max y le dio una segunda oportunidad llena de amor y esperanza.",
    image: "/images/ss/husky.png",
    date: "15 de Enero, 2024",
    category: "Adopción"
  },
  {
    id: 2,
    title: "Red de rescatistas salva 50 perros en una semana",
    excerpt: "Gracias a la coordinación a través de KADESH, un grupo de rescatistas logró encontrar hogares para 50 perros en situación vulnerable.",
    image: "/images/ss/parrot.png",
    date: "8 de Enero, 2024",
    category: "Rescate"
  },
  {
    id: 3,
    title: "Veterinaria aliada ofrece atención gratuita",
    excerpt: "Una de nuestras veterinarias aliadas donó más de 100 consultas gratuitas para perros en situación de calle durante las fiestas.",
    image: "/images/ss/cat.png",
    date: "2 de Enero, 2024",
    category: "Comunidad"
  },
];

export default function StoriesSection() {
  return (
    <section id="historias" className="w-full py-20 bg-gray-50 dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Historias que inspiran
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Cada rescate, cada adopción, cada conexión cuenta una historia
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {MOCK_STORIES.map((story, index) => (
            <motion.article
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
            >
              <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full">
                  {story.category}
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {story.date}
                </p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                  {story.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {story.excerpt}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/blog"
            className="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Leer más historias →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

