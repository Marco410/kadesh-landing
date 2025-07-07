"use client";

import { Button, Group, rem, Burger, Drawer, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Inicio', href: '#' },
  { label: '¿Qué es?', href: '#about' },
  { label: 'Cómo funciona', href: '#how' },
  { label: 'Tienda', href: '#shop' },
  { label: 'Testimonios', href: '#testimonials' },
  { label: 'Donar', href: '#donar' },
];

export default function Navigation() {
  const [opened, setOpened] = useState(false);

  return (
    <>
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
        flexWrap: 'wrap',
      }}>
        <Image 
          src="/logo.png" 
          alt="KADESH logo" 
          width={48} 
          height={48} 
          style={{ 
            borderRadius: 12, 
            background: 'transparent',
            width: 'clamp(32px, 8vw, 48px)',
            height: 'clamp(32px, 8vw, 48px)',
          }} 
        />
        
        {/* Desktop Navigation */}
        <Group gap={rem(32)} visibleFrom="sm">
          {NAV_LINKS.map(link => (
            <motion.a
              key={link.label}
              href={link.href}
              style={{ 
                color: '#fff', 
                fontWeight: 600, 
                fontSize: rem(16), 
                textDecoration: 'none', 
                opacity: 0.92, 
                transition: 'opacity 0.2s' 
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '1')}
              onMouseOut={e => (e.currentTarget.style.opacity = '0.92')}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              {link.label}
            </motion.a>
          ))}
        </Group>

        {/* Desktop Button */}
        <Button 
          size="md" 
          color="#fff" 
          style={{ 
            color: '#f7945e', 
            fontWeight: 700, 
            fontSize: rem(16), 
            background: '#fff', 
            borderRadius: rem(24), 
            padding: `0 ${rem(28)}` 
          }}
          visibleFrom="sm"
        >
          Ingresar
        </Button>

        {/* Mobile Burger Menu */}
        <Burger
          opened={opened}
          onClick={() => setOpened(!opened)}
          color="#fff"
          size="md"
          hiddenFrom="sm"
        />
      </nav>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        size="100%"
        padding="md"
        title="KADESH"
        hiddenFrom="sm"
        zIndex={1000}
        styles={{
          header: {
            background: '#f7945e',
            color: '#fff',
            borderBottom: 'none',
          },
          body: {
            background: '#f7945e',
            padding: rem(32),
          },
        }}
      >
        <Stack gap={rem(32)} mt={rem(48)}>
          {NAV_LINKS.map((link, index) => (
            <motion.a
              key={link.label}
              href={link.href}
              onClick={() => setOpened(false)}
              style={{ 
                color: '#fff', 
                fontWeight: 600, 
                fontSize: rem(20), 
                textDecoration: 'none', 
                opacity: 0.92,
                padding: rem(16),
                borderRadius: rem(12),
                background: 'rgba(255,255,255,0.1)',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '1')}
              onMouseOut={e => (e.currentTarget.style.opacity = '0.92')}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02, 
                background: 'rgba(255,255,255,0.15)' 
              }}
            >
              {link.label}
            </motion.a>
          ))}
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: NAV_LINKS.length * 0.1 }}
            style={{ marginTop: rem(32) }}
          >
            <Button 
              size="lg" 
              fullWidth
              style={{ 
                color: '#f7945e', 
                fontWeight: 700, 
                fontSize: rem(18), 
                background: '#fff', 
                borderRadius: rem(24), 
                padding: `${rem(16)} ${rem(32)}`,
                height: rem(56),
              }}
            >
              Ingresar
            </Button>
          </motion.div>
        </Stack>
      </Drawer>
    </>
  );
} 