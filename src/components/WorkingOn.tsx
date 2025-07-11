"use client";

import { Button, Card, Container, Group, Stack, Text, Title, rem, Paper, SimpleGrid, Badge } from '@mantine/core';
import { motion } from 'framer-motion';

const products = [
  {
    name: 'Rescate de perros',
    desc: 'Visualiza en el mapa la última ubicación reportada de animales en situación de calle o extraviados. Cualquier usuario puede añadir un caso y la comunidad podrá colaborar en tiempo real.'
  },
  {
    name: 'Directorio',
    desc: 'Encuentra fácilmente veterinarias, refugios, hospitales y animales cercanos a tu ubicación. Así, cualquier rescate o ayuda será más rápido y efectivo.'
  },
  {
    name: 'Estatus de rescates',
    desc: 'Sigue el avance de cada rescate en tiempo real: actualizaciones, comentarios, fotos y logros para que todos puedan apoyar y celebrar juntos.'
  },
  {
    name: 'Anuncios',
    desc: 'Encuentra fácilmente veterinarias, refugios, hospitales y otros servicios cercanos que pueden ayudarte a ti y a tu mascota.'
  },
  {
    name: 'Recompensas',
    desc: 'Participa en nuestro programa de recompensas: ayuda en rescates y recibe reconocimientos y beneficios exclusivos por tu labor solidaria.'
  },
  {
    name: 'Tienda en línea',
    desc: 'Adquiere medicamentos, alimento y accesorios para animales en situación vulnerable. Todo lo recaudado apoya directamente a los casos más urgentes.'
  },
  {
    name: 'Calendario',
    desc: 'Consulta eventos importantes de la comunidad: campañas de vacunación, esterilización, adopciones y actividades solidarias.'
  },
  {
    name: 'Perfil de mascota',
    desc: 'Crea un perfil personalizado para cada una de tus mascotas y lleva un control de su salud, vacunas y actividades.'
  },
  {
    name: 'Historias',
    desc: 'Descubre y comparte historias inspiradoras de animales rescatados. Motívate y motiva a otros a seguir ayudando.'
  },
];

export default function WorkingOn() {
  return (
    <Container size="lg" py={rem(64)} id='progreso'>
      <Stack gap={rem(40)} align="center">
        <Title order={2} style={{ fontSize: rem(36), fontWeight: 700, color: '#171717' }}>
          ¡Nuevas funciones en camino!
        </Title>
        <Text style={{ fontSize: rem(18), color: '#3B2C23', maxWidth: 600, textAlign: 'center' }}>
          Estamos desarrollando nuevas herramientas y mejoras para que tu experiencia con KADESH sea cada vez más completa. ¡Muy pronto podrás disfrutar de más formas de ayudar, conectar y transformar vidas!
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={20}>
          {products.map((product, idx) => (
            <Paper
              key={product.name}
              shadow="xs"
              radius="lg"
              p={rem(28)}
              style={{
                background: idx % 2 === 0 ? '#fff' : '#FFF4EC',
                minWidth: 220,
                maxWidth: 340,
                border: 'none',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <Title order={4} style={{ color: '#f7945e', fontSize: rem(20), marginBottom: rem(8), textAlign: 'left' }}>{product.name}</Title>
              <Text style={{ color: '#3B2C23', fontSize: rem(16), textAlign: 'left', marginBottom:10 }}>{product.desc}</Text>
              <Badge
                color="blue"
                variant="light"
                style={{
                  bottom: 16,
                  right: 16,
                  zIndex: 2,
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: 0.5,
                }}
              >
                En desarrollo
              </Badge>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
} 