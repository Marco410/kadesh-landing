"use client";

import { motion } from "framer-motion";
import { useUiMotion } from "kadesh/components/shared/motion";

interface OpenNowChipProps {
  pressed: boolean;
  onToggle: () => void;
  count?: number;
  verifiedPressed?: boolean;
  onToggleVerified?: () => void;
  verifiedCount?: number;
}

export default function OpenNowChip({
  pressed,
  onToggle,
  count,
  verifiedPressed = false,
  onToggleVerified,
  verifiedCount,
}: OpenNowChipProps) {
  const motionPrefs = useUiMotion();

  return (
    <div role="group" aria-label="Filtros" className="mt-2.5 flex flex-wrap gap-1.5">
      <motion.button
        type="button"
        aria-pressed={pressed}
        onClick={onToggle}
        whileTap={motionPrefs.tap}
        className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
          pressed
            ? "bg-green-600 text-white"
            : "bg-[#f3f5f8] text-[#3a3a3a] hover:bg-kadesh-50 dark:bg-night dark:text-[#d0d0d0] dark:hover:bg-kadesh/20"
        }`}
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            pressed ? "bg-white" : "bg-green-600"
          }`}
          aria-hidden
        />
        Abiertas ahora
        {count != null && (
          <span
            className={`tabular-nums ${
              pressed ? "text-white/80" : "text-[#5a5a5a] dark:text-[#b0b0b0]"
            }`}
          >
            {count}
          </span>
        )}
      </motion.button>
      {onToggleVerified && (
        <motion.button
          type="button"
          aria-pressed={verifiedPressed}
          onClick={onToggleVerified}
          whileTap={motionPrefs.tap}
          className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
            verifiedPressed
              ? "bg-kadesh text-white"
              : "bg-[#f3f5f8] text-[#3a3a3a] hover:bg-kadesh-50 dark:bg-night dark:text-[#d0d0d0] dark:hover:bg-kadesh/20"
          }`}
        >
          Verificadas
          {verifiedCount != null && (
            <span
              className={`tabular-nums ${
                verifiedPressed ? "text-white/80" : "text-[#5a5a5a] dark:text-[#b0b0b0]"
              }`}
            >
              {verifiedCount}
            </span>
          )}
        </motion.button>
      )}
    </div>
  );
}
