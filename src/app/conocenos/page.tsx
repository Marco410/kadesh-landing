"use client";

import { motion } from 'framer-motion';
import { Navigation, Footer } from 'kadesh/components/layout';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FavouriteIcon,
  UserGroupIcon,
  ShieldIcon,
  GlobalSearchIcon,
  CheckmarkCircle02Icon,
  HospitalLocationIcon,
} from '@hugeicons/core-free-icons';
import { WhatIsKadesh } from 'kadesh/components/home';
import { ContactForm } from 'kadesh/components/contact';

export default function ConocenosPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const values = [
    {
      icon: FavouriteIcon,
      title: 'Compasión',
      description: 'Cada acción que realizamos está guiada por el amor y respeto hacia los animales y sus familias.',
    },
    {
      icon: UserGroupIcon,
      title: 'Comunidad',
      description: 'Creemos en el poder de la unión. Juntos podemos lograr más que individualmente.',
    },
    {
      icon: ShieldIcon,
      title: 'Transparencia',
      description: 'Operamos con honestidad y claridad en cada proceso, desde donaciones hasta adopciones.',
    },
    {
      icon: GlobalSearchIcon,
      title: 'Innovación',
      description: 'Utilizamos tecnología moderna para crear soluciones reales que transformen el bienestar animal.',
    },
    {
      icon: CheckmarkCircle02Icon,
      title: 'Integridad',
      description: 'Mantenemos los más altos estándares éticos en todas nuestras acciones y decisiones.',
    },
    {
      icon: HospitalLocationIcon,
      title: 'Honestidad',
      description: 'Actuamos con sinceridad y veracidad en cada interacción y comunicación con nuestra comunidad.',
    },
  ];

  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Conócenos - KADESH',
    description: 'Conoce KADESH, la plataforma digital que conecta adoptantes, rescatistas, veterinarias y tiendas para transformar el bienestar animal en México',
    url: 'https://www.kadesh.com.mx/conocenos',
    mainEntity: {
      '@type': 'Organization',
      name: 'KADESH',
      url: 'https://www.kadesh.com.mx',
      description: 'Plataforma digital para conectar adoptantes, rescatistas, veterinarias y tiendas para el bienestar animal en México',
      founder: {
        '@type': 'Person',
        name: 'Marco Castañeda',
        jobTitle: 'Ingeniero',
      },
      areaServed: {
        '@type': 'Country',
        name: 'México',
      },
      knowsAbout: [
        'Bienestar animal',
        'Adopción de mascotas',
        'Rescate de animales',
        'Veterinarias',
        'Donaciones para animales',
      ],
    },
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <Navigation />
        
        {/* Hero Section */}
        <header className="w-full py-16 sm:py-24 bg-gradient-to-br from-orange-500 to-orange-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6">
                Conoce KADESH
              </h1>
              <p className="text-xl sm:text-2xl text-orange-50 leading-relaxed">
                Más que una plataforma. Un movimiento que conecta vidas y rescatando almas.
              </p>
            </motion.div>
          </div>
        </header>

      <WhatIsKadesh />

        {/* Mission & Vision */}
        <section 
          aria-labelledby="mission-vision-heading"
          className="py-16 sm:py-24 bg-[#f5f5f5] dark:bg-[#0a0a0a]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="mission-vision-heading" className="sr-only">
              Misión y Visión de KADESH
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article
                className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-8 shadow-lg border border-[#e0e0e0] dark:border-[#3a3a3a]"
              >
                <motion.div
                  {...fadeInUp}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-bold text-orange-500 dark:text-orange-400 mb-4">
                    Nuestra Misión
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Conectar adoptantes, rescatistas, veterinarias y tiendas para transformar el bienestar animal en México. Facilitamos procesos de adopción, rescate y donación, creando una red de apoyo donde cada vida importa.
                  </p>
                </motion.div>
              </article>

              <article
                className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-8 shadow-lg border border-[#e0e0e0] dark:border-[#3a3a3a]"
              >
                <motion.div
                  {...fadeInUp}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-bold text-orange-500 dark:text-orange-400 mb-4">
                    Nuestra Visión
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Ser la plataforma líder en México que transforme la forma en que cuidamos y protegemos a los animales. Queremos crear un ecosistema donde cada animal tenga acceso a cuidado, amor y un hogar seguro.
                  </p>
                </motion.div>
              </article>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section 
          aria-labelledby="values-heading"
          className="py-16 sm:py-24 bg-white dark:bg-[#121212]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 
                id="values-heading"
                className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4"
              >
                Nuestros Valores
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Los principios que guían cada decisión y acción en KADESH
              </p>
            </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-xl p-6 border border-[#e0e0e0] dark:border-[#3a3a3a] text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-orange-500/10 dark:bg-orange-500/20 rounded-full flex items-center justify-center">
                    <HugeiconsIcon
                      icon={value.icon}
                      size={32}
                      className="text-orange-500 dark:text-orange-400"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* What We Do Section */}
        <section 
          aria-labelledby="what-we-do-heading"
          className="py-16 sm:py-24 bg-[#f5f5f5] dark:bg-[#0a0a0a]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 
                id="what-we-do-heading"
                className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4"
              >
                ¿Qué Hacemos?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                KADESH ofrece múltiples servicios para conectar y apoyar a la comunidad animal en México
              </p>
            </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Animales Perdidos',
                description: 'Ayudamos a encontrar y reunir mascotas perdidas con sus familias mediante nuestra red de comunidad.',
              },
              {
                title: 'Adopciones',
                description: 'Facilitamos el proceso de adopción conectando adoptantes responsables con animales que buscan un hogar.',
              },
              {
                title: 'Donaciones',
                description: 'Permitimos que la comunidad apoye casos de emergencia y necesidades de animales a través de donaciones seguras.',
              },
              {
                title: 'Directorio de Veterinarias',
                description: 'Mantenemos un directorio completo de veterinarias y tiendas especializadas en bienestar animal.',
              },
              {
                title: 'Historias de Rescate',
                description: 'Compartimos historias inspiradoras que motivan a la comunidad y celebran los éxitos de rescate.',
              },
              {
                title: 'Blog Educativo',
                description: 'Proporcionamos contenido educativo sobre cuidado animal, salud y bienestar para toda la comunidad.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-[#e0e0e0] dark:border-[#3a3a3a]"
              >
                <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* Founder Section */}
        <section 
          aria-labelledby="founder-heading"
          className="py-16 sm:py-24 bg-white dark:bg-[#121212]"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.article
              {...fadeInUp}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20 rounded-2xl p-8 sm:p-12 border border-orange-500/20 dark:border-orange-500/30"
            >
              <div className="text-center">
                <h2 
                  id="founder-heading"
                  className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6"
                >
                  Fundador
                </h2>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-orange-500 dark:text-orange-400">
                    Ing. Marco Castañeda
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
                    KADESH fue creado con la visión de utilizar la tecnología para hacer una diferencia real en el bienestar animal. Operamos desde México con el compromiso de conectar vidas y rescatando almas.
                  </p>
                </div>
              </div>
            </motion.article>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          aria-labelledby="cta-heading"
          className="py-16 sm:py-24 bg-gradient-to-br from-orange-500 to-orange-600"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              {...fadeInUp}
              viewport={{ once: true }}
            >
              <h2 
                id="cta-heading"
                className="text-3xl sm:text-4xl font-black text-white mb-6"
              >
                Únete a Nuestra Comunidad
              </h2>
              <p className="text-xl text-orange-50 mb-8 leading-relaxed">
                Sé parte del cambio. Juntos podemos transformar el bienestar animal en México.
              </p>
              <nav aria-label="Acciones para unirse a la comunidad">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/auth/login"
                    className="px-8 py-4 bg-white text-orange-500 font-bold rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
                    aria-label="Crear cuenta en KADESH"
                  >
                    Crear Cuenta
                  </a>
                  <a
                    href="/blog"
                    className="px-8 py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors border-2 border-white/30"
                    aria-label="Ver blog de KADESH"
                  >
                    Ver Blog
                  </a>
                </div>
              </nav>
            </motion.div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section 
          aria-labelledby="contact-form-heading"
          className="py-16 sm:py-24 bg-white dark:bg-[#121212]"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="contact-form-heading" className="sr-only">
              Formulario de contacto
            </h2>
            <ContactForm showTitle={true} />
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
