"use client";

import { Container, SimpleGrid, Paper, Group, Text, rem } from '@mantine/core';

const keyPoints = [
  {
    icon: '🐶',
    title: '¿Perdiste a tu mascota?',
  },
  {
    icon: '🐕‍🦺',
    title: '¿Quieres adoptar o ayudar?',
  },
  {
    icon: '🏥',
    title: '¿Tienes una veterinaria o refugio?',
  },
];

export default function KeyPoints() {
  return (
    <div style={{  width: '100%', padding: `${rem(48)} 0 ${rem(100)} 0` }}>
      <Container size="lg">
        <SimpleGrid
          cols={{ base: 1, sm: 3 }}
          spacing={{ base: 24, sm: 32, md: 48 }}
          p={30}
        >
          {keyPoints.map((point, idx) => (
            <Paper
              key={idx}
              shadow="md"
              radius="lg"
              p="xl"
              style={{
                textAlign: 'center',
                transition: 'transform 0.18s',
                background: '#fff',
                cursor: 'default',
              }}
              onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'none')}
            >
              <Group justify="center" mb={rem(12)}>
                <div
                  style={{
                    fontSize: rem(48),
                    background: '#f7e5d7',
                    borderRadius: '50%',
                    width: rem(72),
                    height: rem(72),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                  }}
                >
                  {point.icon}
                </div>
              </Group>
              <Text fw={700} fz={20} c="#f7945e" mb={4}>
                {point.title}
              </Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>
    </div>
  );
} 