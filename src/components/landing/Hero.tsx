"use client";
import Image from 'next/image';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { SOCIAL_LINKS } from 'kadesh/constants/const';
import Navigation from './Navigation';

const MOCKUP_IMAGES = [
  { src: '/images/ss/splash.png', alt: 'KADESH App - Mapa de rescates' },
  { src: '/images/ss/map.png', alt: 'KADESH App - Pantalla de inicio' },
  { src: '/images/ss/husky.png', alt: 'KADESH App - Perfil de mascota' },
  { src: '/images/ss/bunny.png', alt: 'KADESH App - Perfil de refugio' },
  { src: '/images/ss/cat.png', alt: 'KADESH App - Perfil de veterinaria' },
  { src: '/images/ss/parrot.png', alt: 'KADESH App - Perfil de rescate' },
];

export default function Hero() {
  const [modalOpened, setModalOpened] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalOpened(true);
  };

  const handleSlideChange = (newSlide: number) => {
    if (newSlide >= 0 && newSlide < MOCKUP_IMAGES.length) {
      setCurrentSlide(newSlide);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    let moved = false;
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      moved = true;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!moved) return;
      
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const diff = startX - endX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentSlide < MOCKUP_IMAGES.length - 1) {
          handleSlideChange(currentSlide + 1);
        } else if (diff < 0 && currentSlide > 0) {
          handleSlideChange(currentSlide - 1);
        }
      }
      
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <>
      <div
        ref={ref}
        className="w-full min-h-[90vh] h-auto bg-orange-500 dark:bg-[#121212] flex items-center justify-center mb-16 flex-col relative overflow-hidden"
      >
        <Navigation />

        <div className="z-[2] w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-24 sm:mt-0">
          <div className="flex flex-row flex-wrap gap-8 w-full items-center justify-center">
            <div className="flex-1 min-w-0 max-w-[520px] w-full px-4 flex flex-col items-start order-1">
              <h1
                className="text-[clamp(2.2rem,6vw,58px)] font-black leading-[1.1] text-white tracking-[-2px] mb-2 break-words"
              >
                Conectando vidas, rescatando almas<br />
              </h1>
              <p
                className="text-[clamp(1.1rem,3vw,20px)] text-white max-w-[480px] leading-[1.3] opacity-92 mb-4"
              >
                Estoy construyendo KADESH; la plataforma para conectar adoptantes, rescatistas, veterinarias y tiendas para el bienestar animal real.
              </p>
              <div className="flex flex-wrap gap-5 mb-4">
                <motion.a
                  href="#"
                  onClick={handleDownloadClick}
                  whileHover={{ scale: 1.08}}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="inline-block"
                >
                  <Image src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" width={115} height={48} />
                </motion.a>
                <motion.a
                  href="#"
                  onClick={handleDownloadClick}
                  whileHover={{ scale: 1.08}}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="inline-block"
                >
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" width={120} height={48} />
                </motion.a>
              </div>
            </div>
            <div className="flex-1 min-w-0 max-w-[520px] w-full h-[min(90vw,520px)] min-h-[280px] flex items-center justify-center mx-auto order-2 relative pb-4">
              <div className="hidden sm:flex w-full min-h-[420px] justify-center items-end gap-4 relative">
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{
                    opacity: 1,
                    y: [0, -15, 0],
                    rotate: [-2, 2, -2],
                  }}
                  transition={{
                    opacity: { duration: 1, delay: 0.3, ease: 'easeOut' },
                    y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="z-[2] w-[35vw] max-w-[180px] min-w-[100px]"
                  whileHover={{ scale: 1.04, rotate: -2 }}
                >
                  <Image
                    src="/images/ss/map.png"
                    alt="KADESH App - Pantalla de inicio"
                    width={210}
                    height={420}
                    className="rounded-3xl shadow-xl"
                    priority
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{
                    opacity: 1,
                    y: [0, 12, 0],
                    rotate: [2, -1, 2],
                  }}
                  transition={{
                    opacity: { duration: 1, delay: 0.5, ease: 'easeOut' },
                    y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="z-[3] w-[35vw] max-w-[200px] min-w-[100px]"
                  whileHover={{ scale: 1.04, rotate: 2 }}
                >
                  <Image
                    src="/images/ss/splash.png"
                    alt="KADESH App - Mapa de rescates"
                    width={210}
                    height={420}
                    className="rounded-3xl shadow-xl"
                    priority
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{
                    opacity: 1,
                    y: [0, -8, 0],
                    rotate: [1, -2, 1],
                  }}
                  transition={{
                    opacity: { duration: 1, delay: 0.7, ease: 'easeOut' },
                    y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="z-[1] w-[35vw] max-w-[180px] min-w-[100px]"
                  whileHover={{ scale: 1.04, rotate: 1 }}
                >
                  <Image
                    src="/images/ss/husky.png"
                    alt="KADESH App - Perfil de mascota"
                    width={210}
                    height={420}
                    className="rounded-3xl shadow-xl"
                    priority
                  />
                </motion.div>
              </div>

              <div className="block sm:hidden w-full h-[60vh] min-h-[400px] max-h-[600px] relative overflow-hidden">
                <div 
                  className="carousel-container flex w-full h-full transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  onTouchStart={handleTouchStart}
                >
                  {MOCKUP_IMAGES.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: currentSlide === index ? 1 : 0.7,
                        scale: currentSlide === index ? 1 : 0.95
                      }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="w-full h-full flex-shrink-0 flex justify-center items-center px-2 box-border"
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={280}
                        height={560}
                        className="rounded-3xl shadow-2xl w-auto h-full max-w-[85%] object-contain"
                        priority={index === 0}
                      />
                    </motion.div>
                  ))}
                </div>
                
                {/* carrusel dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {MOCKUP_IMAGES.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlideChange(index)}
                      aria-label={`Ir a slide ${index + 1}`}
                      className={`w-2.5 h-2.5 rounded-full border-none cursor-pointer transition-all duration-300 ${
                        currentSlide === index 
                          ? 'bg-[#f7945e] w-6' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden z-[1]">
          <motion.div
            className="absolute left-[3%] top-[120px] z-[1] opacity-70"
            animate={{ 
              y: [0, -30, 0],
              rotate: [0, 5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Image
              src="/images/logo/part_1.png"
              alt="Logo KADESH parte 1"
              width={200}
              height={200}
              className="brightness-0 invert opacity-25"
            />
          </motion.div>

          <motion.div
            className="absolute right-[5%] top-[50px] z-[2] opacity-70"
            animate={{ 
              y: [0, 25, 0],
              rotate: [0, -3, 0],
              scale: [1, 1.08, 1]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Image
              src="/images/logo/part_2.png"
              alt="Logo KADESH parte 2"
              width={250}
              height={250}
              className="brightness-0 invert opacity-25"
            />
          </motion.div>

          <motion.div
            className="absolute left-[45%] bottom-5 z-[1] opacity-70"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 8, 0],
              scale: [1, 1.03, 1]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Image
              src="/images/logo/part_3.png"
              alt="Logo KADESH parte 3"
              width={180}
              height={180}
              className="brightness-0 invert opacity-25"
            />
          </motion.div>
        </div>

        <div className="w-full flex items-center justify-center gap-8 z-10 mt-12 mb-8">
          {SOCIAL_LINKS.map(s => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[32px] text-white opacity-90 no-underline flex items-center hover:opacity-100 transition-opacity"
            >
              <Image src={s.icon} alt={s.label} width={32} height={32} className="block" />
            </a>
          ))}
        </div>
      </div>

      {/* Modal "incomming" */}
      <AnimatePresence>
        {modalOpened && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setModalOpened(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
            >
              <div 
                className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-md w-full p-8 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
                  <h2 className="text-2xl font-bold text-[#f7945e] dark:text-[#f7945e]">
                    🚀 Próximamente
                  </h2>
                  <button
                    onClick={() => setModalOpened(false)}
                    className="text-2xl font-bold text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="flex flex-col gap-6 items-center text-center">
                  <div className="text-6xl mb-4">
                    🐾
                  </div>
                  <h3 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff]">
                    ¡La app KADESH está en desarrollo!
                  </h3>
                  <p className="text-lg text-[#616161] dark:text-[#b0b0b0] leading-relaxed">
                    Estamos trabajando arduamente para crear la mejor experiencia digital para conectar vidas y rescatar almas. 
                    La aplicación estará disponible muy pronto en App Store y Google Play.
                  </p>
                  <p className="text-base text-[#616161] dark:text-[#b0b0b0] font-medium">
                    ¿Quieres ser de los primeros en saber cuando esté lista?
                  </p>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <button 
                      onClick={() => setModalOpened(false)}
                      className="px-8 py-3 bg-[#f7945e] text-white font-semibold text-lg rounded-xl hover:bg-[#e3824f] transition-colors"
                    >
                      Entendido
                    </button>
                    <a
                      href='https://wa.link/jr33zy'
                      className="px-8 py-3 border-2 border-[#f7945e] text-[#f7945e] font-semibold text-lg rounded-xl hover:bg-[#f5f5f5] dark:hover:bg-[#1e1e1e] transition-colors"
                    >
                      Notificarme
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
