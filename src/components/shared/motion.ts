"use client";

import { useReducedMotion, type Transition, type Variants } from "framer-motion";

/** Misma curva que perfil: entrada suave, sin rebote. */
export const UI_EASE = [0.22, 1, 0.36, 1] as const;

export const uiTransition: Transition = {
  duration: 0.28,
  ease: UI_EASE,
};

export const panelVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: uiTransition },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
};

export const listVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: uiTransition },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  },
};

export const expandVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.32, ease: UI_EASE },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.16 } },
};

export const sheetVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: uiTransition },
  exit: {
    opacity: 0,
    y: 16,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
};

export const tapPress = { scale: 0.97 };
export const tapCompact = { scale: 0.92 };

export function useUiMotion() {
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
    transition: reduce ? { duration: 0 } : uiTransition,
  };
}
