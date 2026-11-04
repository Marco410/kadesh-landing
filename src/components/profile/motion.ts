"use client";

import { useReducedMotion, type Transition, type Variants } from "framer-motion";
import { DASH_EASE, staggerDelay } from "kadesh/components/app-shell/motion";

/*
 * Movimiento de las vistas del panel con sesión (perfil, mascotas, clínicas). Misma API que
 * `useUiMotion` del sitio (`kadesh/components/shared/motion`), pero con el lenguaje del panel:
 * una sola curva (`DASH_EASE`), entradas fade-up de 0.55 s y escalón de 50 ms con tope de 8.
 * El sitio público sigue con su propia curva; no cambiar `shared/motion` para esto.
 */

const enter: Transition = { duration: 0.55, ease: DASH_EASE };
const leave: Transition = { duration: 0.18, ease: DASH_EASE };

export const PROFILE_EASE = DASH_EASE;
export const profileTransition: Transition = { duration: 0.28, ease: DASH_EASE };

export const panelVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: enter },
  exit: { opacity: 0, y: -6, transition: leave },
};

/** El escalón de cada hijo: 50 ms, tope de 8 (una lista larga no tarda en aparecer). */
export const listVariants: Variants = {
  hidden: {},
  show: { transition: { delayChildren: (index: number) => staggerDelay(index) } },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: enter },
  exit: { opacity: 0, y: -6, transition: { duration: 0.16, ease: DASH_EASE } },
};

export const expandVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  show: { opacity: 1, height: "auto", transition: { duration: 0.35, ease: DASH_EASE } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.22, ease: DASH_EASE } },
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.16 } },
};

export const sheetVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: DASH_EASE } },
  exit: { opacity: 0, y: 24, scale: 0.98, transition: leave },
};

export const tapPress = { scale: 0.97 };
export const tapCompact = { scale: 0.92 };

/** Con "reducir movimiento" no hay variantes: todo aparece ya en su lugar. */
export function useProfileMotion() {
  const reduce = useReducedMotion();
  return {
    reduce: Boolean(reduce),
    panel: reduce ? undefined : panelVariants,
    list: reduce ? undefined : listVariants,
    item: reduce ? undefined : itemVariants,
    expand: reduce ? undefined : expandVariants,
    overlay: reduce ? undefined : overlayVariants,
    sheet: reduce ? undefined : sheetVariants,
    tap: reduce ? undefined : tapPress,
    tapDay: reduce ? undefined : tapCompact,
    transition: reduce ? { duration: 0 } : profileTransition,
  };
}
