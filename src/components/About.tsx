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
            <Text style={{ color: '#f7945e', fontWeight: 700, fontSize: rem(18), letterSpacing: 1, textTransform: 'uppercase' }}>
              Bienestar animal real, comunidad real
            </Text>
            <Title order={2} style={{ fontSize: rem(40), fontWeight: 800, color: '#171717', lineHeight: 1.1 }}>
              KADESH conecta vidas y multiplica oportunidades para animales y humanos
            </Title>
            <Text style={{ fontSize: rem(20), color: '#3B2C23', maxWidth: 600 }}>
              Somos la plataforma digital que une adoptantes, rescatistas, veterinarias y tiendas para transformar el bienestar animal en México. Más que una app: somos un movimiento, una comunidad y un puente para quienes quieren ayudar y quienes lo necesitan.
            </Text>
           
            <Text style={{ fontSize: rem(18), color: '#f7945e', maxWidth: 600, fontWeight: 700 }}>
              Únete, apoya, comparte. Porque cada vida importa.
            </Text>
          </Stack>
        </Paper>
      </Container>
    </motion.div>
  );
} 