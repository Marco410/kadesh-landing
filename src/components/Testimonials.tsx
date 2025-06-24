"use client";

import { Container, Paper, Stack, Text, Title, rem } from '@mantine/core';
import { motion } from 'framer-motion';

export default function Testimonials() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <Container size="md" py={rem(64)}>
        <Stack gap={rem(32)} align="center">
          <Title order={2} style={{ fontSize: rem(36), fontWeight: 700, color: '#171717' }}>
            Testimonios
          </Title>
          <Text style={{ fontSize: rem(18), color: '#3B2C23', maxWidth: 600, textAlign: 'center' }}>
            Pronto compartiremos historias de rescate y transformación. ¡Tú puedes ser parte de la próxima historia!
          </Text>
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px #f7945e22" }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            style={{ borderRadius: rem(24) }}
          >
            <Paper shadow="md" p={rem(32)} radius="xl" style={{ background: '#FFF4EC', maxWidth: 420, border: 'none', position: 'relative' }}>
              {/* Círculo de acento */}
              <div style={{
                position: 'absolute',
                left: rem(-24),
                top: rem(-24),
                width: rem(48),
                height: rem(48),
                background: '#f7945e',
                borderRadius: '50%',
                opacity: 0.13,
                zIndex: 1,
              }} />
              <Text style={{ color: '#f7945e', fontSize: rem(18), textAlign: 'center', position: 'relative', zIndex: 2 }}>
                “KADESH es un puente de esperanza para quienes no tienen voz.”
              </Text>
            </Paper>
          </motion.div>
        </Stack>
      </Container>
    </motion.div>
  );
} 