"use client";

import { Container, Stack, Title, Text, rem, Paper } from '@mantine/core';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div style={{ background: '#f8f9fa', width: '100%', padding:20 }}>
     
        <Container size="md" px={{ base: 8, sm: 0 }} py={{ base: rem(24), sm: rem(64) }} id='acerca-de'>
          <Paper
            shadow="md"
            radius="lg"
            p={{ base: rem(20), sm: rem(40) }}
            style={{
              background: '#fff',
              border: 'none',
              position: 'relative',
              overflow: 'visible',
              minHeight: 0,
              margin: '0 auto',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '100px',
                height: '100px',
                background: '#f7945e',
                borderRadius: '50%',
                opacity: 0.16,
                filter: 'blur(12px)',
                zIndex: 1,
                display: 'none',
              }}
              className="about-accent-circle"
            />
            <Stack gap={rem(20)} align="flex-start" style={{ position: 'relative', zIndex: 2 }}>
              <Text style={{ color: '#f7945e', fontWeight: 700, fontSize: rem(16), letterSpacing: 1, textTransform: 'uppercase' }}>
                Bienestar animal real, comunidad real
              </Text>
              <Title
                order={2}
                style={{
                  fontSize: 'clamp(1.3rem, 6vw, 2.2rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  background: 'linear-gradient(90deg, #f7945e 0%, #ffb47e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                  marginBottom: rem(8),
                  textAlign: 'left',
                }}
              >
                KADESH conecta vidas y multiplica oportunidades para animales y humanos
              </Title>
              <Text style={{ fontSize: rem(18), color: '#3B2C23', maxWidth: '100%' }}>
                Somos la plataforma digital que une adoptantes, rescatistas, veterinarias y tiendas para transformar el bienestar animal en México. Más que una app: somos un movimiento, una comunidad y un puente para quienes quieren ayudar y quienes lo necesitan.
              </Text>
              <Text
                style={{
                  fontSize: rem(17),
                  color: '#f7945e',
                  fontWeight: 700,
                  width: '100%',
                  textAlign: 'center',
                  marginTop: rem(10),
                  wordBreak: 'break-word',
                  lineHeight: 1.3,
                }}
              >
                Únete, apoya, comparte. Porque cada vida importa.
              </Text>
            </Stack>
          </Paper>
        </Container>
        <style jsx global>{`
          @media (min-width: 600px) {
            .about-accent-circle {
              display: block !important;
              right: -50px !important;
              top: -50px !important;
            }
            .mantine-Paper-root {
              border-radius: 32px !important;
            }
          }
        `}</style>
    </div>
  );
} 