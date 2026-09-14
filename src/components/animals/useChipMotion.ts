'use client';

import { useRef } from 'react';
import { gsap, useGSAP, HOME_EASE } from 'kadesh/components/home/gsap-register';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Tap feedback — contextSafe so the tween is in the GSAP React context. */
export function useChipPulse<T extends HTMLElement = HTMLButtonElement>() {
  const ref = useRef<T>(null);
  const { contextSafe } = useGSAP(() => {}, { scope: ref });

  const pulse = contextSafe(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    gsap.fromTo(
      el,
      { scale: 0.9 },
      { scale: 1, duration: 0.28, ease: HOME_EASE, overwrite: 'auto' }
    );
  });

  return { ref, pulse };
}

/** Staggered Más / Menos using a timeline (enter decelerates, exit accelerates). */
export function useRevealChips(expanded: boolean) {
  const scope = useRef<HTMLDivElement>(null);
  const isFirstPass = useRef(true);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const chips = gsap.utils.toArray<HTMLElement>('[data-more-chip]', root);
      if (!chips.length) return;

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(chips, {
          autoAlpha: expanded ? 1 : 0,
          display: expanded ? 'inline-flex' : 'none',
          scale: 1,
          y: 0,
        });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (isFirstPass.current) {
          gsap.set(chips, {
            autoAlpha: expanded ? 1 : 0,
            display: expanded ? 'inline-flex' : 'none',
            scale: 1,
            y: 0,
          });
          isFirstPass.current = false;
          return;
        }

        const tl = gsap.timeline({
          defaults: { ease: HOME_EASE },
          overwrite: true,
        });

        if (expanded) {
          tl.set(chips, { display: 'inline-flex' }).fromTo(
            chips,
            { autoAlpha: 0, scale: 0.86, y: 8 },
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              duration: 0.32,
              stagger: 0.05,
            }
          );
        } else {
          tl.to(chips, {
            autoAlpha: 0,
            scale: 0.88,
            y: 6,
            duration: 0.18,
            stagger: 0.03,
            ease: 'power2.in',
          }).set(chips, { display: 'none' });
        }
      });

      return () => mm.revert();
    },
    { dependencies: [expanded], scope }
  );

  return scope;
}
