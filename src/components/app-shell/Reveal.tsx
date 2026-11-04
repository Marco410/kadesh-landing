"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { revealVariants } from "./motion";

/**
 * Entrada fade-up al montar. `index` escalona (50 ms cada uno, tope 8). Solo anima al montar:
 * un refetch no la repite; cambiar de sección sí, porque la vista se vuelve a montar.
 *
 * Con "reducir movimiento" aparece ya en su lugar: `MotionConfig reducedMotion="user"` solo apaga
 * las transformaciones y dejaría el fundido de opacidad.
 */
export default function Reveal({
  index = 0,
  className,
  children,
  as = "div",
}: {
  index?: number;
  className?: string;
  children: ReactNode;
  as?: "div" | "section" | "li" | "header";
}) {
  const Component = motion[as];
  const reduce = useReducedMotion();
  return (
    <Component
      initial={reduce ? false : "hidden"}
      animate="show"
      custom={index}
      variants={revealVariants}
      className={className}
    >
      {children}
    </Component>
  );
}
