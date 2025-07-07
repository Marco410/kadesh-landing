"use client";
import { Button, Container, Group, Stack, Text, Title, rem, Modal, Box } from '@mantine/core';
import Image from 'next/image';
import { motion, useScroll } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Navigation from './Navigation';
import { SOCIAL_LINKS } from 'kadesh/constants/const';



const MOCKUP_IMAGES = [
  { src: '/images/ss/splash.png', alt: 'KADESH App - Mapa de rescates' },
  { src: '/images/ss/map.png', alt: 'KADESH App - Pantalla de inicio' },
  { src: '/images/ss/husky.png', alt: 'KADESH App - Perfil de mascota' },
  { src: '/images/ss/bunny.png', alt: 'KADESH App - Perfil de refugio' },
  { src: '/images/ss/cat.png', alt: 'KADESH App - Perfil de veterinaria' },
  { src: '/images/ss/parrot.png', alt: 'KADESH App - Perfil de rescate' },
];

function useResponsiveMargin() {
  const [margin, setMargin] = useState(100);
  useEffect(() => {
    const updateMargin = () => setMargin(window.innerWidth <= 700 ? 10 : 100);
    updateMargin();
    window.addEventListener('resize', updateMargin);
    return () => window.removeEventListener('resize', updateMargin);
  }, []);
  return margin;
}

export default function Hero() {
  const [modalOpened, setModalOpened] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const marginTop = useResponsiveMargin();
  
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalOpened(true);
  };

  const handleSlideChange = (newSlide: number) => {
    setCurrentSlide(newSlide);
    const container = document.querySelector('.carousel-container') as HTMLElement;
    if (container) {
      const slideWidth = 100 / MOCKUP_IMAGES.length;
      container.style.transform = `translateX(-${newSlide * slideWidth}%)`;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const diff = startX - currentX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentSlide < MOCKUP_IMAGES.length - 1) {
          handleSlideChange(currentSlide + 1);
        } else if (diff < 0 && currentSlide > 0) {
          handleSlideChange(currentSlide - 1);
        }
      }
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <>
      <motion.section
        ref={ref}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          width: '100%',
          minHeight: '90vh',
          background: '#f7945e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: rem(64),
          flexDirection: 'column',
        }}
      >
        <Navigation />

        <Container size="lg" style={{ zIndex: 2, width: '100%', padding: 0, marginTop }}>
          <div
            className="hero-columns"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: rem(32),
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              className="hero-text-col"
              style={{
                flex: '1 1 340px',
                minWidth: 0,
                maxWidth: 520,
                width: '100%',
                padding: `0 ${rem(16)}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                order: 1,
              }}
            >
              <Title
                order={1}
                style={{
                  fontSize: 'clamp(2.2rem, 6vw, 58px)',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color: '#fff',
                  letterSpacing: -2,
                  marginBottom: rem(8),
                  wordBreak: 'break-word',
                }}
              >
                Conectando vidas, rescatando almas<br />
              </Title>
              <Text
                style={{
                  fontSize: 'clamp(1.1rem, 3vw, 20px)',
                  color: '#fff',
                  maxWidth: 480,
                  lineHeight: 1.3,
                  opacity: 0.92,
                  marginBottom: rem(16),
                }}
              >
                Estoy construyendo KADESH; la plataforma para conectar adoptantes, rescatistas, veterinarias y tiendas para el bienestar animal real.
              </Text>
              <Group gap={rem(20)} style={{ flexWrap: 'wrap', marginBottom: rem(16) }}>
                <motion.a
                  href="#"
                  onClick={handleDownloadClick}
                  whileHover={{ scale: 1.08}}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  style={{ display: 'inline-block' }}
                >
                  <Image src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" width={115} height={48} />
                </motion.a>
                <motion.a
                  href="#"
                  onClick={handleDownloadClick}
                  whileHover={{ scale: 1.08}}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  style={{ display: 'inline-block' }}
                >
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" width={120} height={48} />
                </motion.a>
              </Group>
            </div>
            <div
              className="hero-img-col"
              style={{
                flex: '1 1 340px',
                minWidth: 0,
                maxWidth: 520,
                width: '100%',
                height: 'min(90vw, 520px)',
                minHeight: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                order: 2,
                position: 'relative',
                paddingBottom: rem(16),
              }}
            >
              <Box className="hero-mockups-wrapper"
              style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'flex-end', 
                gap: rem(16), 
                position: 'relative',
              }} visibleFrom="sm">
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
                  style={{
                    zIndex: 2,
                    width: '35vw',
                    maxWidth: 180,
                    minWidth: 100,
                  }}
                  whileHover={{ scale: 1.04, rotate: -2 }}
                >
                  <Image
                    src="/images/ss/map.png"
                    alt="KADESH App - Pantalla de inicio"
                    width={210}
                    height={420}
                    style={{ borderRadius: rem(24), boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
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
                  style={{
                    zIndex: 3,
                    width: '35vw',
                    maxWidth: 200,
                    minWidth: 100,
                  }}
                  whileHover={{ scale: 1.04, rotate: 2 }}
                >
                  <Image
                    src="/images/ss/splash.png"
                    alt="KADESH App - Mapa de rescates"
                    width={210}
                    height={420}
                    style={{ borderRadius: rem(24), boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
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
                  style={{
                    zIndex: 1,
                    width: '35vw',
                    maxWidth: 180,
                    minWidth: 100,
                  }}
                  whileHover={{ scale: 1.04, rotate: 1 }}
                >
                  <Image
                    src="/images/ss/husky.png"
                    alt="KADESH App - Perfil de mascota"
                    width={210}
                    height={420}
                    style={{ borderRadius: rem(24), boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                    priority
                  />
                </motion.div>
              </Box>

              <Box className="hero-mobile-carousel" style={{ 
                width: '100%', 
                height: '50vh',
                display: 'block',
                position: 'relative',
                overflow: 'hidden',
              }} hiddenFrom="sm">
                <div className="carousel-container" style={{
                  display: 'flex',
                  width: `${MOCKUP_IMAGES.length * 100}%`,
                  height: '100%',
                  transition: 'transform 0.5s ease-in-out',
                  transform: `translateX(-${currentSlide * (100 / MOCKUP_IMAGES.length)}%)`,
                }} onTouchStart={handleTouchStart}>
                  {MOCKUP_IMAGES.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: index * 0.2, ease: 'easeOut' }}
                      style={{
                        width: `${100 / MOCKUP_IMAGES.length}%`,
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: rem(16),
                      }}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={280}
                        height={800}
                        style={{ 
                          borderRadius: rem(24), 
                          boxShadow: '0 12px 32px rgba(0,0,0,0.15)', 
                          width: 'auto',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                        priority
                      />
                    </motion.div>
                  ))}
                </div>
                
                {/* carrusel dots */}
                <div style={{
                  position: 'absolute',
                  bottom: rem(16),
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: rem(8),
                  zIndex: 10,
                }}>
                  {MOCKUP_IMAGES.map((_, index) => (
                    <button
                      key={index}
                      className="carousel-indicator"
                      onClick={() => handleSlideChange(index)}
                      style={{
                        width: rem(8),
                        height: rem(8),
                        borderRadius: '50%',
                        background: currentSlide === index ? '#f7945e' : 'rgba(255,255,255,0.5)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.3s',
                      }}
                    />
                  ))}
                </div>
              </Box>
            </div>
          </div>
        </Container>
        
        <div className="hero-logo-bg" style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0,
          width: '100%', 
          height: '100%', 
          overflow: 'hidden',
          zIndex: 1
        }}>
          {/* Part 1 logo */}
          <motion.div
            style={{ 
              position: 'absolute', 
              left: '3%', 
              top: rem(120), 
              zIndex: 1,
              opacity: 0.7
            }}
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
              style={{ 
                filter: 'brightness(0) invert(1)',
                opacity: 0.25
              }}
            />
          </motion.div>

          {/* Part 2 logo */}
          <motion.div
            style={{ 
              position: 'absolute', 
              right: '5%', 
              top: rem(50), 
              zIndex: 2,
              opacity: 0.7
            }}
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
              style={{ 
                filter: 'brightness(0) invert(1)',
                opacity: 0.25
              }}
            />
          </motion.div>

          {/* Part 3 logo */}
          <motion.div
            style={{ 
              position: 'absolute', 
              left: '45%', 
              bottom: rem(20), 
              zIndex: 1,
              opacity: 0.7
            }}
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
              style={{ 
                filter: 'brightness(0) invert(1)',
                opacity: 0.25
              }}
            />
          </motion.div>
        </div>

        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: rem(32),
          zIndex: 10,
          marginTop:50,
          marginBottom:30
        }}>
          {SOCIAL_LINKS.map(s => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              style={{ fontSize: rem(32), color: '#fff', opacity: 0.9, textDecoration: 'none', display: 'flex', alignItems: 'center' }}
            >
              <Image src={s.icon} alt={s.label} width={32} height={32} style={{ display: 'block' }} />
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Modal  "incomming" */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        centered
        size="md"
        title={
          <Text size="xl" fw={700} c="#f7945e">
            🚀 Próximamente
          </Text>
        }
        styles={{
          title: {
            fontSize: rem(24),
            fontWeight: 700,
            color: '#f7945e',
          },
          header: {
            borderBottom: '1px solid #e9ecef',
            paddingBottom: rem(16),
          },
          body: {
            padding: rem(32),
          },
        }}
      >
        <Stack gap={rem(24)} align="center" ta="center">
          <div style={{ fontSize: rem(64), marginBottom: rem(16) }}>
            🐾
          </div>
          <Title order={2} c="#2c3e50" size={rem(28)}>
            ¡La app KADESH está en desarrollo!
          </Title>
          <Text size="lg" c="#6c757d" lh={1.6}>
            Estamos trabajando arduamente para crear la mejor experiencia digital para conectar vidas y rescatar almas. 
            La aplicación estará disponible muy pronto en App Store y Google Play.
          </Text>
          <Text size="md" c="#6c757d" fw={500}>
            ¿Quieres ser de los primeros en saber cuando esté lista?
          </Text>
          <Group gap={rem(16)} mt={rem(16)}>
            <Button 
              size="lg" 
              color="#f7945e" 
              onClick={() => setModalOpened(false)}
              style={{ 
                background: '#f7945e', 
                color: '#fff',
                fontWeight: 600,
                borderRadius: rem(12),
                padding: `0 ${rem(32)}`
              }}
            >
              Entendido
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              color="#f7945e"
              style={{ 
                borderColor: '#f7945e',
                color: '#f7945e',
                fontWeight: 600,
                borderRadius: rem(12),
                padding: `0 ${rem(32)}`
              }}
            >
              Notificarme
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Media query to mobile */}
      <style jsx global>{`
      @media (max-width: 900px) {
        .mantine-Container-root {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
      }
      @media (max-width: 700px) {
        .hero-columns {
          flex-direction: column !important;
          gap: 0 !important;
        }
        .hero-text-col {
          order: 1 !important;
          max-width: 100% !important;
          width: 100% !important;
          align-items: center !important;
          text-align: center !important;
          margin-bottom: 24px;
          padding: 0 12px !important;
          padding-top: 90px !important;
        }
        .hero-text-col h1,
        .hero-text-col h2,
        .hero-text-col p,
        .hero-text-col .mantine-Group-root {
          text-align: center !important;
          justify-content: center !important;
          width: 100%;
        }
        .hero-img-col {
          order: 2 !important;
          max-width: 100% !important;
          width: 100% !important;
          min-height: 180px !important;
          height: auto !important;
          margin-bottom: 0;
          padding-bottom: 0 !important;
          justify-content: center !important;
        }
        .hero-mockups-wrapper {
          flex-direction: column !important;
          gap: 24px !important;
          width: 100% !important;
          justify-content: center !important;
          align-items: center !important;
        }
        .hero-mockups-wrapper > div {
          min-width: 120px !important;
          max-width: 90vw !important;
          width: 90vw !important;
        }
        .hero-logo-bg {
          display: none !important;
        }
        .hero-ingresar-btn-mobile {
          display: none !important;
        }
      }
      `}</style>
    </>
  );
} 