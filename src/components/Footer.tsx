"use client";

import { Anchor, Center, Container, Group, Stack, Text, rem } from '@mantine/core';
import { motion } from 'framer-motion';

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com', icon: '📸' },
  { label: 'Facebook', href: 'https://facebook.com', icon: '📘' },
  { label: 'X', href: 'https://x.com', icon: '🐦' },
];

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      style={{ background: '#fff', borderTop: '1px solid #E6F4EA', marginTop: rem(64), padding: `${rem(32)} 0` }}
    >
      <Container size="lg">
        <Stack align="center" gap={rem(16)}>
          <Group gap={rem(24)}>
            {socialLinks.map((s) => (
              <Anchor key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: rem(28), color: '#f7945e' }}>
                <span aria-label={s.label}>{s.icon}</span>
              </Anchor>
            ))}
          </Group>
          <Group gap={rem(24)}>
            <Anchor href="#contacto" style={{ color: '#f7945e', fontSize: rem(16) }}>Contacto</Anchor>
            <Anchor href="#" style={{ color: '#f7945e', fontSize: rem(16) }}>Términos</Anchor>
          </Group>
          <Center>
            <Text style={{ color: '#3B2C23', fontSize: rem(14) }}>
              © {new Date().getFullYear()} KADESH. Hecho con ❤️ para los animales.
            </Text>
          </Center>
        </Stack>
      </Container>
    </motion.footer>
  );
} 