"use client";

import { Container, Group, Paper, Stack, Text, Title, rem, SimpleGrid } from '@mantine/core';
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
 
      <Container size="lg" py={rem(64)} id='solucion'>
        <Stack gap={rem(48)}>
          <Title order={2} style={{ fontSize: rem(36), fontWeight: 700, color: '#171717', marginBottom: rem(8), padding:20 }}>
            El Problema y Nuestra Solución
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={20} style={{ marginBottom: 10 }}>
            {problems.map((p) => (
              <div
                key={p.title}
                style={{ borderRadius: rem(24), height: '100%' }}
              >
                <Paper shadow="md" p={rem(32)} radius="xl" style={{ background: '#fff', minWidth: 260, maxWidth: 320, border: 'none', position: 'relative', minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
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
              </div>
            ))}
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={20}>
            {solutions.map((s) => (
              <div
                key={s.title}
                style={{ borderRadius: rem(24), height: '100%' }}
              >
                <Paper shadow="md" p={rem(32)} radius="xl" style={{ background: '#FFF4EC', minWidth: 260, maxWidth: 320, border: 'none', position: 'relative', minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
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
              </div>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
  );
} 