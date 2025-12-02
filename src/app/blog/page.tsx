"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Footer, Navigation } from 'kadesh/components/layout';
import { BlogSection, CategorySection } from 'kadesh/components/blog';
import { useSearchParams } from 'next/navigation';
import { Routes } from 'kadesh/core/routes';


export default function BlogPage() {
  const searchParams = useSearchParams();
  const categoryUrl = searchParams.get('category');
  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
      <Navigation />

      <header className="relative text-white py-30 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/sections/blog.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60 dark:bg-black/70"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
          >
            Blog KADESH
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl max-w-2xl mx-auto opacity-95"
          >
            Historias, consejos y recursos para el bienestar animal
          </motion.p>
        </div>
      </header>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {categoryUrl && (
              <Link
                href={Routes.blog.index}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 dark:hover:bg-orange-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Limpiar filtros</span>
              </Link>
            )}
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5f5f5] dark:bg-[#1e1e1e] text-[#212121] dark:text-[#ffffff] font-medium hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Otras categorías</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5f5f5] dark:bg-[#1e1e1e] text-[#212121] dark:text-[#ffffff] font-medium hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Otros tags</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5f5f5] dark:bg-[#1e1e1e] text-[#212121] dark:text-[#ffffff] font-medium hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>Más recientes primero</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <BlogSection />
      </main>

      {/* Sección de Categorías */}
      <CategorySection />

      {/* Newsletter Section */}
      <section className="bg-[#f5f5f5] dark:bg-[#1e1e1e] py-16 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-[#212121] dark:text-[#ffffff] mb-4"
          >
            Suscríbete a nuestro blog
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#616161] dark:text-[#b0b0b0] mb-6"
          >
            Recibe las últimas historias, consejos y noticias sobre bienestar animal directamente en tu correo.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 px-4 py-3 rounded-lg bg-[#ffffff] dark:bg-[#121212] border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 dark:hover:bg-orange-600 transition-colors">
              Suscribirse
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

