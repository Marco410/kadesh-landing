"use client";

import { useEffect, useRef } from "react";
import { Button, Container, Stack, Text, Title, rem, Paper } from '@mantine/core';
import { motion } from 'framer-motion';

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': any;
    }
  }
}

export default function Donate() {
  const stripeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.querySelector("#stripe-buy-button-script")) {
      const script = document.createElement("script");
      script.id = "stripe-buy-button-script";
      script.src = "https://js.stripe.com/v3/buy-button.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const interval = setInterval(() => {
      // @ts-ignore
      if (window.StripeBuyButton) {
        if (stripeRef.current && !stripeRef.current.querySelector("stripe-buy-button")) {
          const stripeButton = document.createElement("stripe-buy-button");
          stripeButton.setAttribute("buy-button-id", "buy_btn_1RfavTGPbYpK0LVQr1zcHyqI");
          stripeButton.setAttribute("publishable-key", STRIPE_PUBLISHABLE_KEY!);
          stripeRef.current.appendChild(stripeButton);
        }
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

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
            <motion.div
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              ref={stripeRef}
            />
          </Stack>
        </Paper>
      </Container>
    </motion.div>
  );
} 