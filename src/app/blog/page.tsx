"use client";

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Footer, Navigation } from 'kadesh/components/layout';
import { BlogSection, CategorySection } from 'kadesh/components/blog';
import { useSearchParams } from 'next/navigation';
import { Routes } from 'kadesh/core/routes';

function BlogFilters() {
  const searchParams = useSearchParams();
  const categoryUrl = searchParams.get('category');
  
  return (
    categoryUrl && (
      <Link
        href={Routes.blog.index}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 dark:hover:bg-orange-600 transition-colors"
        aria-label="Limpiar filtros de categoría"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>Limpiar filtros</span>
      </Link>
    )
  );
}

export default function BlogPage() {
  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog KADESH',
    description: 'Blog sobre bienestar animal, adopción, rescate, cuidado de mascotas y veterinarias en México',
    url: 'https://www.kadesh.com.mx/blog',
    publisher: {
      '@type': 'Organization',
      name: 'KADESH',
      url: 'https://www.kadesh.com.mx',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.kadesh.com.mx/logo.png',
      },
    },
    about: {
      '@type': 'Thing',
      name: 'Bienestar animal',
    },
    inLanguage: 'es-MX',
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
        <Navigation />

        <header className="relative text-white py-30 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/sections/blog.jpg"
              alt="Blog KADESH - Historias y consejos sobre bienestar animal"
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


        {/* Filters Section */}
        <nav 
          aria-label="Filtros del blog"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-[#e0e0e0] dark:border-[#3a3a3a]"
        >
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <Suspense fallback={null}>
                <BlogFilters />
              </Suspense>
              {/* <button 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5f5f5] dark:bg-[#1e1e1e] text-[#212121] dark:text-[#ffffff] font-medium hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a] transition-colors"
                aria-label="Filtrar por categorías"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Otras categorías</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button> */}
              {/* <button 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5f5f5] dark:bg-[#1e1e1e] text-[#212121] dark:text-[#ffffff] font-medium hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a] transition-colors"
                aria-label="Filtrar por tags"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>Otros tags</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button> */}
            </div>
           {/*  <button 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5f5f5] dark:bg-[#1e1e1e] text-[#212121] dark:text-[#ffffff] font-medium hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a] transition-colors"
              aria-label="Ordenar artículos por fecha"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span>Más recientes primero</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button> */}
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <BlogSection />
        </main>

        {/* Sección de Categorías */}
        <CategorySection />

        {/* Newsletter Section */}
        <section 
          aria-labelledby="newsletter-heading"
          className="bg-[#f5f5f5] dark:bg-[#1e1e1e] py-16 px-4 sm:px-6 lg:px-8 mt-16"
        >
          <div className="max-w-2xl mx-auto text-center">
            <motion.h2
              id="newsletter-heading"
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
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Correo electrónico para suscripción
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-4 py-3 rounded-lg bg-[#ffffff] dark:bg-[#121212] border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="Correo electrónico para suscripción al blog"
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 dark:hover:bg-orange-600 transition-colors"
                aria-label="Suscribirse al blog de KADESH"
              >
                Suscribirse
              </button>
            </motion.form>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

