"use client";

import { Button, Card, Container, Group, Stack, Text, Title, rem } from '@mantine/core';
import { motion } from 'framer-motion';

const products = [
  { name: 'Alimento Premium', desc: 'Nutrición de calidad para perros y gatos.' },
  { name: 'Camas y accesorios', desc: 'Comodidad y bienestar para tu mascota.' },
  { name: 'Juguetes y enriquecimiento', desc: 'Diversión y estimulación para animales felices.' },
];

export default function Shop() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <Container size="lg" py={rem(64)}>
        <Stack gap={rem(40)} align="center">
          <Title order={2} style={{ fontSize: rem(36), fontWeight: 700, color: '#171717' }}>
            Tienda en línea
          </Title>
          <Text style={{ fontSize: rem(18), color: '#3B2C23', maxWidth: 600, textAlign: 'center' }}>
            Encuentra productos esenciales para el bienestar de tus mascotas. Cada compra apoya nuestra misión.
          </Text>
          <Group justify="center" gap={rem(32)}>
            {products.map((p, i) => (
              <motion.div
                key={p.name}
                whileHover={{ scale: 1.04, boxShadow: "0 8px 32px #f7945e22" }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                style={{ borderRadius: rem(24) }}
              >
                <Card shadow="md" p={rem(32)} radius="xl" style={{ background: i === 1 ? '#FFF4EC' : '#fff', minWidth: 240, maxWidth: 260, border: 'none', position: 'relative' }}>
                  {/* Círculo de acento */}
                  <div style={{
                    position: 'absolute',
                    right: rem(-24),
                    top: rem(-24),
                    width: rem(48),
                    height: rem(48),
                    background: '#f7945e',
                    borderRadius: '50%',
                    opacity: 0.13,
                    zIndex: 1,
                  }} />
                  <Title order={4} style={{ color: '#f7945e', fontSize: rem(18), marginBottom: rem(8), position: 'relative', zIndex: 2 }}>{p.name}</Title>
                  <Text style={{ color: '#3B2C23', marginBottom: rem(16), position: 'relative', zIndex: 2 }}>{p.desc}</Text>
                  <Button color="#f7945e" variant="light" fullWidth radius="xl" disabled style={{ fontWeight: 700, fontSize: rem(16), position: 'relative', zIndex: 2 }}>
                    Próximamente
                  </Button>
                </Card>
              </motion.div>
            ))}
          </Group>
        </Stack>
      </Container>
    </motion.div>
  );
} 