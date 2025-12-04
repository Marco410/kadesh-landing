"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import Logo from '../shared/Logo';
import Link from 'next/link';
import { Routes } from 'kadesh/core/routes';

const NAV_LINKS = [
  { label: 'Inicio', href: Routes.home, anchor: null },
  { label: '¿Qué es KADESH?', href: Routes.navigation.whatIsKadesh, anchor: Routes.navigation.whatIsKadesh },
  { label: 'Animales perdidos', href: Routes.navigation.lostAnimals, anchor: Routes.navigation.lostAnimals },
  { label: 'Veterinarias', href: Routes.navigation.veterinarians, anchor: Routes.navigation.veterinarians },
  { label: 'Historias', href: Routes.navigation.stories, anchor: Routes.navigation.stories },
  { label: 'Donaciones', href: Routes.navigation.donations, anchor: Routes.navigation.donations },
  { label: 'Cómo funciona', href: Routes.navigation.howItWorks, anchor: Routes.navigation.howItWorks },
  { label: 'Roadmap', href: Routes.navigation.roadmap, anchor: Routes.navigation.roadmap },
];

export default function Navigation() {
  const [opened, setOpened] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Si estamos en la página principal y hay un anchor en la URL, hacer scroll a esa sección
    if (pathname === Routes.home && window.location.hash) {
      const hash = window.location.hash;
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, anchor: string | null) => {
    // Si el link tiene un anchor y no estamos en la página principal, redirigir a home con el anchor
    if (anchor && pathname !== Routes.home) {
      e.preventDefault();
      window.location.href = `${Routes.home}${anchor}`;
      return;
    }
    
    // Si estamos en la página principal y es un anchor, hacer scroll suave
    if (anchor && pathname === Routes.home) {
      e.preventDefault();
      const el = document.querySelector(anchor);
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
    setTheme(newTheme);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 w-full px-6 sm:px-10 py-4 flex items-center justify-between z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-orange-500/80 dark:bg-[#121212]/70 backdrop-blur-md shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <Link href={Routes.home} className="flex items-center">
          <Logo size={48} />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <motion.a
              key={link.label}
              href={link.anchor ? `${Routes.home}${link.anchor}` : link.href}
              className={`font-semibold text-sm no-underline transition-colors duration-200 ${
                'text-white hover:text-orange-100'
              }`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              onClick={(e) => handleLinkClick(e, link.href, link.anchor)}
            >
              {link.label}
            </motion.a>
          ))}
          
          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={toggleTheme}
              type="button"
              className={`p-2 rounded-lg transition-colors duration-200 ${
                 'text-white hover:bg-white/10'
              }`}
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
          className={`lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 z-50 ${
            scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
          }`}
          aria-label="Toggle menu"
        >
          <motion.span
            className={`w-6 h-0.5 rounded transition-all ${
              scrolled ? 'bg-gray-700 dark:bg-gray-300' : 'bg-white'
            }`}
            animate={opened ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          />
          <motion.span
            className={`w-6 h-0.5 rounded transition-all ${
              scrolled ? 'bg-gray-700 dark:bg-gray-300' : 'bg-white'
            }`}
            animate={opened ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.span
            className={`w-6 h-0.5 rounded transition-all ${
              scrolled ? 'bg-gray-700 dark:bg-gray-300' : 'bg-white'
            }`}
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
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setOpened(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full bg-orange-500 dark:bg-[#1a1a1a] z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-white dark:text-white text-2xl font-bold">KADESH</h2>
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
                <div className="flex flex-col gap-4">
                  {NAV_LINKS.map((link, index) => (
                    <motion.a
                      key={link.label}
                      href={link.anchor ? `${Routes.home}${link.anchor}` : link.href}
                      onClick={(e) => handleLinkClick(e, link.href, link.anchor)}
                      className="text-white font-semibold text-lg no-underline opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all"
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

