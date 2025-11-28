"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Inicio', href: '#' },
  { label: 'Acerca de', href: '#acerca-de' },
  { label: 'Nuestra solucion', href: '#solucion' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Progreso', href: '#progreso' },
  { label: 'Testimonios', href: '#testimonios' },
  { label: 'Donar', href: '#donar' },
];

export default function Navigation() {
  const [opened, setOpened] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setOpened(false);
  };

  return (
    <>
      <nav className="w-full px-6 sm:px-10 py-6 flex items-center justify-between z-10 flex-wrap">
        <Image 
          src="/logo.png" 
          alt="KADESH logo" 
          width={48} 
          height={48} 
          className="rounded-xl bg-transparent w-[clamp(32px,8vw,48px)] h-[clamp(32px,8vw,48px)]"
        />
        
        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <motion.a
              key={link.label}
              href={link.href}
              className="text-white font-semibold text-base no-underline opacity-92 hover:opacity-100 transition-opacity duration-200"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              onClick={(e) => handleLinkClick(e, link.href)}
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        {/* Mobile Burger Menu */}
        <button
          onClick={() => setOpened(!opened)}
          className="sm:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 z-50"
          aria-label="Toggle menu"
        >
          <motion.span
            className="w-6 h-0.5 bg-white rounded transition-all"
            animate={opened ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          />
          <motion.span
            className="w-6 h-0.5 bg-white rounded transition-all"
            animate={opened ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.span
            className="w-6 h-0.5 bg-white rounded transition-all"
            animate={opened ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {opened && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 sm:hidden"
              onClick={() => setOpened(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full bg-orange-500 z-50 sm:hidden overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-white text-2xl font-bold">KADESH</h2>
                  <button
                    onClick={() => setOpened(false)}
                    className="text-white text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <div className="flex flex-col gap-8">
                  {NAV_LINKS.map((link, index) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="text-white font-semibold text-xl no-underline opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 