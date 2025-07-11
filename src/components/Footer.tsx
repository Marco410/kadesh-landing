"use client";

import { Anchor, Center, Container, Group, Stack, Text, rem } from '@mantine/core';
import { motion } from 'framer-motion';
import { SOCIAL_LINKS } from 'kadesh/constants/const';
import Image from 'next/image';

export default function Footer() {
  return (
    <div
      style={{ background: '#fff', borderTop: '1px solid #E6F4EA', marginTop: rem(64), padding: `${rem(32)} 0` }}
    >
      <Container size="lg">
        <Stack align="center" gap={rem(16)}>
          <Group gap={rem(24)}>
          {SOCIAL_LINKS.map(s => (
            <Anchor
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: rem(32), color: '#fff', opacity: 0.9, textDecoration: 'none', display: 'flex', alignItems: 'center' }}
            >
              <Image src={s.icon} alt={s.label} width={32} height={32} style={{ display: 'block' }} />
            </Anchor>
          ))}
          </Group>
          <Group gap={rem(24)}>
            <Anchor href="https://wa.me/524439382330?text=Me%20podr%C3%ADa%20dar%20m%C3%A1s%20informaci%C3%B3n.%20Saludos!" target='_blank' style={{ color: '#f7945e', fontSize: rem(16) }}>Contacto</Anchor>
            <Anchor href="/terminos" style={{ color: '#f7945e', fontSize: rem(16) }}>Términos y Condiciones</Anchor>
          </Group>
          <Center>
            <Text style={{ color: '#3B2C23', fontSize: rem(14) }}>
              © {new Date().getFullYear()} KADESH. Hecho con ❤️ para los animales.
            </Text>
          </Center>

        </Stack>
      </Container>
    </div>
  );
} 