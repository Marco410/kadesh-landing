"use client";

import type { MouseEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { useUiMotion } from "kadesh/components/shared/motion";
import { CLAIM_SECTION_ID } from "./constants";

/**
 * Chip de la ficha cuando la clínica no está verificada. Lleva a la sección
 * "¿Es tu clínica?" (o al estado de su reclamo) al final de la ficha.
 */
export default function UnverifiedChip() {
  const { reduce } = useUiMotion();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(CLAIM_SECTION_ID);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    target.focus({ preventScroll: true });
  };

  return (
    <a
      href={`#${CLAIM_SECTION_ID}`}
      onClick={handleClick}
      title="¿Es tu clínica? Reclámala"
      className="relative inline-flex items-center gap-1 rounded-full border border-amber-500/50 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 transition-colors before:absolute before:-inset-x-1 before:-inset-y-3 before:content-[''] hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/20"
    >
      <HugeiconsIcon icon={AlertCircleIcon} size={12} strokeWidth={2} aria-hidden />
      No verificada
    </a>
  );
}
