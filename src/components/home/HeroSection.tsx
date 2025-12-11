"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '../shared/Logo';
import { HugeiconsIcon } from '@hugeicons/react';
import { HospitalLocationIcon, GlobalSearchIcon } from '@hugeicons/core-free-icons'


export default function HeroSection() {
  return (
    <section id="inicio" className="relative w-full min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212] overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
              Conectando vidas.
              <br />
              <span className="text-orange-100">Rescatando almas.</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              KADESH es el santuario digital para encontrar animales perdidos, apoyar rescatistas y conectar con veterinarias y refugios.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              {/* Veterinarias */}
              <motion.div
                whileHover={{ y: -4, scale: 1.06, boxShadow: "0 8px 32px 0 rgba(255,140,0,0.13)" }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 min-w-[220px]"
              >
                <Link
                  href="/veterinarias"
                  className="group flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-white via-orange-50 to-white text-orange-500 font-extrabold text-base sm:text-lg rounded-2xl shadow-xl border border-orange-200/60 hover:bg-orange-100/90 hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 transition-all duration-300"
                >
                  <HugeiconsIcon className="w-7 h-7 transition-colors duration-200 flex-shrink-0" icon={HospitalLocationIcon} />
                  <span>Ver veterinarias cercanas</span>
                </Link>
              </motion.div>
              
              {/* Animales perdidos */}
              <motion.div
                whileHover={{ y: -4, scale: 1.06, boxShadow: "0 8px 32px 0 rgba(255,255,255,0.13)" }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 min-w-[220px]"
              >
                <Link
                  href="#animales"
                  className="group flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-orange-100/20 via-white/10 to-orange-50/10 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-lg border border-white/30 hover:bg-orange-400/20 hover:text-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-200 transition-all duration-300 backdrop-blur-sm"
                >
                  <HugeiconsIcon 
                    icon={GlobalSearchIcon} 
                    className="w-7 h-7 text-orange-100 group-hover:text-orange-200 transition-colors duration-200 flex-shrink-0"
                  />
                  <span>Animales perdidos cerca de ti</span>
                </Link>
              </motion.div>
            </div>

            {/* Secondary CTA */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex justify-center lg:justify-start"
            >
              <Link
                href="/comunidad"
                className="text-white/80 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors"
              >
                Únete a la comunidad KADESH →
              </Link>
            </motion.div>
          </motion.div>

          {/* Right - Logo illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotate: 0,
            }}
            transition={{ 
              duration: 0.8, 
              delay: 0.2,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            className="flex-1 flex justify-center lg:justify-end"
          >
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              {/* Animated glow effect */}
              <motion.div 
                className="absolute inset-0 bg-white/20 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Secondary glow layer */}
              <motion.div 
                className="absolute inset-0 bg-orange-400/30 rounded-full blur-2xl"
                animate={{
                  scale: [1.1, 0.9, 1.1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
              
              {/* Logo container with floating animation */}
              <motion.div 
                className="relative w-full h-full flex items-center justify-center z-10"
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Logo with scale animation */}
                <motion.div
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{
                    scale: { duration: 0.3 },
                    rotate: { duration: 0.5 }
                  }}
                  className="relative z-20"
                >
                  <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl"></div>
                  <div className="relative">
                    <Logo size={150} />
                  </div>
                </motion.div>
              </motion.div>
              
              {/* Decorative particles */}
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full blur-sm"></div>
              <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-orange-300/40 rounded-full blur-sm"></div>
              <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-white/30 rounded-full blur-sm"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

