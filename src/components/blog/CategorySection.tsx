"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';

interface CategorySectionProps {
  categories: string[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  const categoryImage: Record<string, string> = {
    'Rescate': '/images/ss/husky.png',
    'Salud': '/images/ss/cat.png',
    'Historias': '/images/ss/bunny.png',
    'Adopción': '/images/ss/parrot.png',
    'Comunidad': '/images/ss/map.png',
  };

  return (
    <section className="bg-[#ffffff] dark:bg-[#121212] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl font-bold text-[#212121] dark:text-[#ffffff]"
          >
            Explora por categoría
          </motion.h2>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categories.filter(cat => cat !== 'Todos').map((category, index) => {
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col items-center gap-4 min-w-[140px] cursor-pointer group"
              >
                <div className="w-30 h-30 rounded-full bg-[#f5f5f5] dark:bg-[#1e1e1e] flex items-center justify-center overflow-hidden border-2 border-[#e0e0e0] dark:border-[#3a3a3a] group-hover:border-orange-500 dark:group-hover:border-orange-500 transition-colors">
                  <div className="relative w-30 h-30 rounded-full overflow-hidden">
                    <Image
                      src={categoryImage[category] || '/images/ss/husky.png'}
                      alt={category}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                <span className="text-base font-semibold text-[#212121] dark:text-[#ffffff] text-center group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                  {category}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

