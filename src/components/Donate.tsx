"use client";

import { Button, Container, Stack, Text, Title, rem, Paper } from '@mantine/core';
import { motion } from 'framer-motion';

export default function Donate() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <Container size="md" py={rem(64)} id="donar">
        <Paper shadow="md" radius="xl" p={rem(40)} style={{ background: '#FFF4EC', border: 'none', position: 'relative', overflow: 'visible' }}>
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
            <Title order={2} style={{ fontSize: rem(32), fontWeight: 700, color: '#171717' }}>
              Donaciones
            </Title>
            <Text style={{ fontSize: rem(18), color: '#3B2C23', maxWidth: 600 }}>
              Tu aporte ayuda a rescatar, alimentar y dar hogar a más animales. ¡Gracias por ser parte de KADESH!
            </Text>
            <motion.div whileHover={{ scale: 1.08, boxShadow: "0 4px 24px #f7945e33" }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
            <Button size="lg" color="#f7945e" radius="xl" style={{ fontWeight: 700, fontSize: rem(18), padding: '0 2rem', background: '#f7945e' }} component="a" href="#unete">
            Donar con Stripe (próximamente)
            </Button>
            </motion.div>
          </Stack>
        </Paper>
      </Container>
    </motion.div>
  );
} 