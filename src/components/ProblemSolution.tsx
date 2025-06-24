"use client";

import { Container, Group, Paper, Stack, Text, Title, rem } from '@mantine/core';
import { motion } from 'framer-motion';

const problems = [
  {
    title: 'Animales perdidos',
    desc: 'Miles de animales se pierden cada año y pocos logran volver a casa.',
  },
  {
    title: 'Refugios sin visibilidad',
    desc: 'Muchos refugios y protectoras no tienen recursos ni alcance para ayudar a más animales.',
  },
  {
    title: 'Comunidad desconectada',
    desc: 'Falta unión y canales efectivos para quienes quieren ayudar o adoptar.',
  },
];

const solutions = [
  {
    title: 'Geolocalización y conexión',
    desc: 'Conecta personas y refugios cercanos para ayudar a animales perdidos o en adopción.',
  },
  {
    title: 'Visibilidad y apoyo',
    desc: 'Damos visibilidad a refugios, tiendas y veterinarias aliadas para que reciban más ayuda.',
  },
  {
    title: 'Comunidad activa',
    desc: 'Fomentamos una red solidaria y espiritual para transformar vidas y crear impacto real.',
  },
];

export default function ProblemSolution() {
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
            El Problema y Nuestra Solución
          </Title>
          <Group justify="center" gap={rem(32)}>
            {problems.map((p) => (
              <motion.div
                key={p.title}
                whileHover={{ scale: 1.04, boxShadow: "0 8px 32px #f7945e22" }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                style={{ borderRadius: rem(24) }}
              >
                <Paper shadow="md" p={rem(32)} radius="xl" style={{ background: '#fff', minWidth: 260, maxWidth: 320, border: 'none', position: 'relative' }}>
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
                  <Title order={4} style={{ color: '#f7945e', fontSize: rem(20), marginBottom: rem(8), position: 'relative', zIndex: 2 }}>{p.title}</Title>
                  <Text style={{ color: '#3B2C23', position: 'relative', zIndex: 2 }}>{p.desc}</Text>
                </Paper>
              </motion.div>
            ))}
          </Group>
          <Group justify="center" gap={rem(32)}>
            {solutions.map((s) => (
              <motion.div
                key={s.title}
                whileHover={{ scale: 1.04, boxShadow: "0 8px 32px #f7945e22" }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                style={{ borderRadius: rem(24) }}
              >
                <Paper shadow="md" p={rem(32)} radius="xl" style={{ background: '#FFF4EC', minWidth: 260, maxWidth: 320, border: 'none', position: 'relative' }}>
                  {/* Círculo de acento */}
                  <div style={{
                    position: 'absolute',
                    right: rem(-32),
                    bottom: rem(-32),
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