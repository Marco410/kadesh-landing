'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP } from 'kadesh/components/home/gsap-register';

/**
 * Entrada del muro de aliados en la portada: los logos aparecen desde el centro, escalonados, al
 * llegar a la sección. Con «reducir movimiento» no se anima nada (el muro ya viene pintado).
 */
export default function AlliesWallReveal({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-ally-avatar]', {
          autoAlpha: 0,
          scale: 0.6,
          duration: 0.5,
          // GSAP no lee `cubic-bezier()` (HOME_EASE) sin CustomEase: `expo.out` es la misma curva.
          ease: 'expo.out',
          stagger: { amount: 0.6, from: 'center' },
          clearProps: 'opacity,visibility,transform',
          scrollTrigger: { trigger: rootRef.current, start: 'top 85%', once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return <div ref={rootRef}>{children}</div>;
}
