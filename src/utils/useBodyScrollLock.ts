"use client";

import { useEffect } from 'react';

/** Modales abiertos que piden el bloqueo. Con dos abiertos, el scroll vuelve solo al cerrar el último. */
let locks = 0;
let previousOverflow = '';
let previousPaddingRight = '';

/**
 * Mientras `active`, la página de atrás no hace scroll: solo el contenido del modal. Compensa el
 * ancho de la barra de scroll para que la página no brinque al ocultarla.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return;
    const { body, documentElement } = document;
    if (locks === 0) {
      previousOverflow = body.style.overflow;
      previousPaddingRight = body.style.paddingRight;
      const scrollbar = window.innerWidth - documentElement.clientWidth;
      body.style.overflow = 'hidden';
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    }
    locks += 1;
    return () => {
      locks -= 1;
      if (locks === 0) {
        body.style.overflow = previousOverflow;
        body.style.paddingRight = previousPaddingRight;
      }
    };
  }, [active]);
}
