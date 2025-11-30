"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

const MOCK_DOGS = [
  {
    id: 1,
    name: "Max",
    location: "Ciudad de México",
    date: "Hace 2 días",
    image: "/images/ss/husky.png",
    status: "perdido"
  },
  {
    id: 2,
    name: "Luna",
    location: "Guadalajara",
    date: "Hace 5 días",
    image: "/images/ss/cat.png",
    status: "en adopción"
  },
  {
    id: 3,
    name: "Rocky",
    location: "Monterrey",
    date: "Hace 1 semana",
    image: "/images/ss/bunny.png",
    status: "perdido"
  },
];

export default function LostDogsSection() {
  return (
    <section id="perros-perdidos" className="w-full py-20 bg-gray-50 dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Perros perdidos y en adopción
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Ayudemos a encontrarles un hogar
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {MOCK_DOGS.map((dog, index) => (
            <motion.div
              key={dog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-64 w-full bg-gray-200 dark:bg-gray-800">
                <Image
                  src={dog.image}
                  alt={dog.name}
                  fill
                  className="object-cover"
                />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${
                  dog.status === 'perdido' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {dog.status === 'perdido' ? 'Perdido' : 'En adopción'}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {dog.name}
                </h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <p className="flex items-center gap-2">
                    <span>📍</span>
                    {dog.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <span>🕐</span>
                    {dog.date}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/perros-perdidos"
            className="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Ver todos →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

