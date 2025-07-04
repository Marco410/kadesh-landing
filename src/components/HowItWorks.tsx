"use client";

import { Container, Group, Paper, Stack, Text, Title, rem } from '@mantine/core';
import { motion } from 'framer-motion';

const steps = [
  {
    title: 'Conexión por geolocalización',
    desc: 'Encuentra y ayuda animales cerca de ti, conecta con refugios y aliados locales.',
  },
  {
    title: 'Anuncios de adopción',
    desc: 'Publica o explora animales en adopción y ayuda a encontrarles un hogar.',
  },
  {
    title: 'Recompensas por ayudar',
    desc: 'Recibe reconocimientos y beneficios por tu apoyo a la comunidad animalista.',
  },
];

export default function HowItWorks() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <Container size="lg" py={rem(64)}>
        <Stack gap={rem(48)}>
          <Title order={2} style={{ fontSize: rem(36), fontWeight: 700, color: '#171717', marginBottom: rem(8) }}>
            ¿Cómo funciona KADESH?
          </Title>
          <Group justify="center" gap={rem(32)}>
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                whileHover={{ scale: 1.04, boxShadow: "0 8px 32px #f7945e22" }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                style={{ borderRadius: rem(24) }}
              >
                <Paper shadow="md" p={rem(32)} radius="xl" style={{ background: i === 1 ? '#FFF4EC' : '#fff', minWidth: 260, maxWidth: 320, border: 'none', position: 'relative' }}>
                  {/* Círculo de acento */}
                  <div style={{
                    position: 'absolute',
                    left: rem(-32),
                    top: rem(-32),
                    width: rem(64),
                    height: rem(64),
                    background: '#f7945e',
                    borderRadius: '50%',
                    opacity: 0.13,
                    zIndex: 1,
                  }} />
                  <Title order={4} style={{ color: '#f7945e', fontSize: rem(20), marginBottom: rem(8), position: 'relative', zIndex: 2 }}>{s.title}</Title>
                  <Text style={{ color: '#3B2C23', position: 'relative', zIndex: 2 }}>{s.desc}</Text>
                </Paper>
              </motion.div>
            ))}
          </Group>
        </Stack>
      </Container>
    </motion.div>
  );
} 