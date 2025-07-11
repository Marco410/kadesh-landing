"use client";

import { Button, Container, Stack, Text, Title, rem, Paper } from '@mantine/core';
import { motion } from 'framer-motion';

export default function Join() {
  return (
    <Container size="md" py={rem(64)} id="unete">
      <Paper shadow="md" radius="xl" p={rem(40)} style={{ background: '#fff', border: 'none', position: 'relative', overflow: 'visible', marginRight:15, marginLeft:15 }}>
        <div style={{
          position: 'absolute',
          left: rem(-48),
          bottom: rem(-48),
          width: rem(120),
          height: rem(120),
          background: '#f7945e',
          borderRadius: '50%',
          opacity: 0.18,
          zIndex: 1,
        }} />
        <Stack gap={rem(24)} align="flex-start" style={{ position: 'relative', zIndex: 2, textAlign:'center' }}>
          <Title order={2} style={{ fontSize: rem(32), fontWeight: 700, color: '#171717' }}>
            ¿Eres refugio, tienda o veterinaria?
          </Title>
          <Text style={{ fontSize: rem(18), color: '#3B2C23', maxWidth: 600 }}>
            Únete a nuestra red de aliados y multiplica tu impacto. Juntos podemos salvar más vidas y fortalecer la comunidad animalista.
          </Text>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <motion.div whileHover={{ scale: 1.08, boxShadow: "0 4px 24px #f7945e33" }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
              <Button size="lg" target='_blank' color="#f7945e" radius="xl" style={{ fontWeight: 700, fontSize: rem(18), padding: '0 2rem', background: '#f7945e' }} component="a" href="https://wa.me/524439382330?text=Hola!%20me%20gustar%C3%ADa%20ser%20parte%20de%20Kadesh.">
                Quiero unirme
              </Button>
            </motion.div>
          </div>
        </Stack>
      </Paper>
    </Container>
  );
} 