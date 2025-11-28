"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const currentTheme = resolvedTheme || theme || 'light';
      console.log('Theme state:', { theme, resolvedTheme, currentTheme });
      console.log('HTML classList before:', document.documentElement.classList.toString());
      
      // Limpiar todas las clases de tema primero (incluyendo 'light' que next-themes podría agregar)
      document.documentElement.classList.remove('dark', 'light');
      
      // Agregar solo la clase correcta
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
      // Para light mode, simplemente no agregamos la clase 'dark'
      
      console.log('HTML classList after:', document.documentElement.classList.toString());
    }
  }, [theme, resolvedTheme, mounted]);

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

  const toggleTheme = () => {
    if (!mounted) return;
    const currentTheme = resolvedTheme || theme || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    console.log('Toggling theme from', currentTheme, 'to', newTheme);
    setTheme(newTheme);
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
              className="text-white dark:text-[#ffffff] font-semibold text-base no-underline opacity-92 hover:opacity-100 transition-opacity duration-200"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              onClick={(e) => handleLinkClick(e, link.href)}
            >
              {link.label}
            </motion.a>
          ))}
          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={toggleTheme}
              type="button"
              className="text-white dark:text-[#ffffff] opacity-92 hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {(resolvedTheme || theme) === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}
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
              className="fixed top-0 right-0 h-full w-full bg-[#f7945e] z-50 sm:hidden overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-white text-2xl font-bold">KADESH</h2>
                  <div className="flex items-center gap-4">
                    {/* Theme Toggle Button Mobile */}
                    {mounted && (
                      <button
                        onClick={toggleTheme}
                        type="button"
                        className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Toggle theme"
                      >
                        {(resolvedTheme || theme) === 'dark' ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setOpened(false)}
                      className="text-white text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>
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