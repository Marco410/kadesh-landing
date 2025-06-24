"use client";
import { Button, Container, Group, Stack, Text, Title, rem } from '@mantine/core';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

const NAV_LINKS = [
  { label: 'Inicio', href: '#' },
  { label: '¿Qué es?', href: '#about' },
  { label: 'Cómo funciona', href: '#how' },
  { label: 'Tienda', href: '#shop' },
  { label: 'Testimonios', href: '#testimonials' },
  { label: 'Donar', href: '#donar' },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com', icon: '📸' },
  { label: 'Twitter', href: 'https://twitter.com', icon: '🐦' },
  { label: 'Facebook', href: 'https://facebook.com', icon: '📘' },
];

// SVGs de los tres trazos de la K
function KStrokeVertical({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="32" height="220" viewBox="0 0 32 220" fill="none" style={style}>
      <rect x="12" y="0" width="8" height="220" rx="4" fill="#fff" fillOpacity="0.13" />
    </svg>
  );
}
function KStrokeUp({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="180" height="32" viewBox="0 0 180 32" fill="none" style={style}>
      <rect x="0" y="12" width="180" height="8" rx="4" transform="rotate(-40 0 12)" fill="#fff" fillOpacity="0.13" />
    </svg>
  );
}
function KStrokeDown({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="180" height="32" viewBox="0 0 180 32" fill="none" style={style}>
      <rect x="0" y="12" width="180" height="8" rx="4" transform="rotate(40 0 12)" fill="#fff" fillOpacity="0.13" />
    </svg>
  );
}

export default function Hero() {
  // Parallax para los trazos
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yStroke1 = useSpring(useTransform(scrollY, [0, 400], [0, 30]), { stiffness: 60, damping: 20 });
  const yStroke2 = useSpring(useTransform(scrollY, [0, 400], [0, -20]), { stiffness: 60, damping: 20 });
  const yStroke3 = useSpring(useTransform(scrollY, [0, 400], [0, 18]), { stiffness: 60, damping: 20 });

  return (
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
      {/* Navbar superior con logo real */}
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
        <Image src="/logo-kadesh.png" alt="KADESH logo" width={48} height={48} style={{ borderRadius: 12, background: 'transparent' }} />
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
      {/* Trazos de la K flotantes y animados */}
      <motion.div
        style={{ position: 'absolute', left: rem(60), top: rem(120), zIndex: 1, y: yStroke1 }}
        animate={{ scale: [1, 1.08, 1], y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <KStrokeVertical style={{ width: rem(32), height: rem(220) }} />
      </motion.div>
      <motion.div
        style={{ position: 'absolute', right: rem(80), top: rem(80), zIndex: 1, y: yStroke2 }}
        animate={{ scale: [1, 1.06, 1], y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <KStrokeUp style={{ width: rem(180), height: rem(32) }} />
      </motion.div>
      <motion.div
        style={{ position: 'absolute', left: rem(120), bottom: rem(40), zIndex: 1, y: yStroke3 }}
        animate={{ scale: [1, 1.04, 1], y: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <KStrokeDown style={{ width: rem(180), height: rem(32) }} />
      </motion.div>
      <Container size="lg" style={{ zIndex: 2 }}>
        <Group justify="space-between" align="center" wrap="nowrap">
          {/* Columna izquierda: texto y botones */}
          <Stack align="flex-start" gap={rem(32)} style={{ maxWidth: 520 }}>
            <Title order={1} style={{ fontSize: rem(64), fontWeight: 900, lineHeight: 1.1, color: '#fff', letterSpacing: -2 }}>
              Conectando vidas, rescatando almas<br />
            </Title>
            <Text style={{ fontSize: rem(22), color: '#fff', maxWidth: 480, lineHeight: 1.3, opacity: 0.92 }}>
              KADESH es el santuario digital que une tecnología, espiritualidad y comunidad para proteger y dar hogar a los animales.
            </Text>
            <Group gap={rem(20)}>
              <motion.a
                href="#"
                whileHover={{ scale: 1.08, boxShadow: "0 4px 24px #fff5" }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                style={{ display: 'inline-block' }}
              >
                <Image src="/appstore-badge.svg" alt="App Store" width={160} height={48} />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.08, boxShadow: "0 4px 24px #fff5" }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                style={{ display: 'inline-block' }}
              >
                <Image src="/googleplay-badge.svg" alt="Google Play" width={160} height={48} />
              </motion.a>
            </Group>
          </Stack>
          {/* Columna derecha: mockups de celulares */}
          <div style={{ position: 'relative', width: rem(420), height: rem(480), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Mockup 1 */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              style={{ position: 'absolute', left: rem(60), top: rem(60), zIndex: 2 }}
              whileHover={{ scale: 1.04, rotate: -2 }}
            >
              <Image
                src="/window.svg"
                alt="App KADESH 1"
                width={180}
                height={340}
                style={{ borderRadius: rem(32), boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
                priority
              />
            </motion.div>
            {/* Mockup 2 */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              style={{ position: 'absolute', left: rem(160), top: rem(0), zIndex: 3 }}
              whileHover={{ scale: 1.04, rotate: 2 }}
            >
              <Image
                src="/window.svg"
                alt="App KADESH 2"
                width={180}
                height={340}
                style={{ borderRadius: rem(32), boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
                priority
              />
            </motion.div>
          </div>
        </Group>
      </Container>
      {/* Redes sociales abajo */}
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
  );
} 