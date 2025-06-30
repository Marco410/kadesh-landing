"use client";
import { Button, Container, Group, Stack, Text, Title, rem, Modal } from '@mantine/core';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useState } from 'react';

const NAV_LINKS = [
  { label: 'Inicio', href: '#' },
  { label: '¿Qué es?', href: '#about' },
  { label: 'Cómo funciona', href: '#how' },
  { label: 'Tienda', href: '#shop' },
  { label: 'Testimonios', href: '#testimonials' },
  { label: 'Donar', href: '#donar' },
];

const SOCIAL_LINKS = [
  //{ label: 'Instagram', href: 'https://instagram.com', icon: '📸' },
  //{ label: 'Twitter', href: 'https://twitter.com', icon: '🐦' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61576878181992', icon: '📘' },
];

export default function Hero() {
  const [modalOpened, setModalOpened] = useState(false);
  
  // Parallax para los trazos
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalOpened(true);
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
        }}
      >
        <nav style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          padding: `${rem(24)} ${rem(40)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}>
          <Image src="/logo.png" alt="KADESH logo" width={48} height={48} style={{ borderRadius: 12, background: 'transparent' }} />
          <Group gap={rem(32)}>
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                style={{ color: '#fff', fontWeight: 600, fontSize: rem(16), textDecoration: 'none', opacity: 0.92, transition: 'opacity 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.opacity = '1')}
                onMouseOut={e => (e.currentTarget.style.opacity = '0.92')}
              >
                {link.label}
              </a>
            ))}
          </Group>
          <Button size="md" color="#fff" style={{ color: '#f7945e', fontWeight: 700, fontSize: rem(16), background: '#fff', borderRadius: rem(24), padding: `0 ${rem(28)}` }}>
            Ingresar
          </Button>
        </nav>

        <Container size="lg" style={{ zIndex: 2 }}>
          <Group justify="space-between" align="center" wrap="nowrap">
            <Stack align="flex-start" gap={rem(32)} style={{ maxWidth: 520 }}>
              <Title order={1} style={{ fontSize: rem(58), fontWeight: 900, lineHeight: 1.1, color: '#fff', letterSpacing: -2 }}>
                Conectando vidas, rescatando almas<br />
              </Title>
              <Text style={{ fontSize: rem(20), color: '#fff', maxWidth: 480, lineHeight: 1.3, opacity: 0.92 }}>
                Estoy construyendo KADESH; la plataforma para conectar adoptantes, rescatistas, veterinarias y tiendas para el bienestar animal real.
              </Text>
              <Group gap={rem(20)}>
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
            </Stack>
            <div style={{ position: 'relative', width: rem(520), height: rem(580), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ 
                  opacity: 1, 
                  y: [0, -15, 0],
                  rotate: [-2, 2, -2]
                }}
                transition={{ 
                  opacity: { duration: 1, delay: 0.3, ease: "easeOut" },
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ position: 'absolute', left: rem(40), top: rem(80), zIndex: 2 }}
                whileHover={{ scale: 1.04, rotate: -2 }}
              >
                <Image
                  src="/images/ss/map.png"
                  alt="KADESH App - Pantalla de inicio"
                  width={210}
                  height={420}
                  style={{ borderRadius: rem(32), boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}
                  priority
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ 
                  opacity: 1, 
                  y: [0, 12, 0],
                  rotate: [2, -1, 2]
                }}
                transition={{ 
                  opacity: { duration: 1, delay: 0.5, ease: "easeOut" },
                  y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 9, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ position: 'absolute', left: rem(180), top: rem(20), zIndex: 3 }}
                whileHover={{ scale: 1.04, rotate: 2 }}
              >
                <Image
                  src="/images/ss/splash.png"
                  alt="KADESH App - Mapa de rescates"
                  width={210}
                  height={420}
                  style={{ borderRadius: rem(32), boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}
                  priority
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ 
                  opacity: 1, 
                  y: [0, -8, 0],
                  rotate: [1, -2, 1]
                }}
                transition={{ 
                  opacity: { duration: 1, delay: 0.7, ease: "easeOut" },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ position: 'absolute', left: rem(320), top: rem(60), zIndex: 1 }}
                whileHover={{ scale: 1.04, rotate: 1 }}
              >
                <Image
                  src="/images/ss/husky.png"
                  alt="KADESH App - Perfil de mascota"
                  width={210}
                  height={420}
                  style={{ borderRadius: rem(32), boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}
                  priority
                />
              </motion.div>
            </div>
          </Group>
        </Container>
        
        {/* Partes del logo flotantes dentro del Hero */}
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0,
          width: '100%', 
          height: '100%', 
          overflow: 'hidden',
          zIndex: 1
        }}>
          {/* Parte 1 del logo */}
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

          {/* Parte 2 del logo */}
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

          {/* Parte 3 del logo */}
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
          position: 'absolute',
          left: 0,
          bottom: rem(24),
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: rem(32),
          zIndex: 10,
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
              <span aria-label={s.label}>{s.icon}</span>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Modal de "Próximamente" */}
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
    </>
  );
} 