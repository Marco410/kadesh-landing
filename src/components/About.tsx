"use client";

import { Container, Stack, Title, Text, rem, Paper } from '@mantine/core';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <Container size="md" py={rem(64)}>
        <Paper shadow="md" radius="xl" p={rem(40)} style={{ background: '#fff', border: 'none', position: 'relative', overflow: 'visible' }}>
          {/* Círculo de acento */}
          <div style={{
            position: 'absolute',
            right: rem(-48),
            top: rem(-48),
            width: rem(120),
            height: rem(120),
            background: '#f7945e',
            borderRadius: '50%',
            opacity: 0.18,
            zIndex: 1,
          }} />
          <Stack gap={rem(24)} align="flex-start" style={{ position: 'relative', zIndex: 2 }}>
            <Title order={2} style={{ fontSize: rem(40), fontWeight: 700, color: '#171717' }}>
              ¿Qué es KADESH?
            </Title>
            <Text style={{ fontSize: rem(20), color: '#3B2C23', maxWidth: 600 }}>
              KADESH es un santuario digital que une tecnología, espiritualidad y comunidad para proteger y dar hogar a los animales. Nuestra misión es conectar corazones y voluntades para crear un mundo más compasivo, donde cada ser tenga un lugar seguro y digno.
            </Text>
            <Text style={{ fontSize: rem(18), color: '#f7945e', maxWidth: 600 }}>
              Creemos en el poder de la conexión espiritual y emocional para transformar vidas, tanto humanas como animales.
            </Text>
          </Stack>
        </Paper>
      </Container>
    </motion.div>
  );
} 