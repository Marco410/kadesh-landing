"use client";

import { LayoutGroup, motion } from "framer-motion";
import { useUiMotion } from "./motion";

interface DirectoryRadiusChipsProps {
  options: readonly number[];
  value: number;
  onChange: (km: number) => void;
  label?: string;
}

export default function DirectoryRadiusChips({
  options,
  value,
  onChange,
  label = "Radio de búsqueda",
}: DirectoryRadiusChipsProps) {
  const motionPrefs = useUiMotion();

  return (
    <LayoutGroup id="directory-radius">
      <div role="group" aria-label={label} className="mt-4 flex flex-wrap gap-1.5">
        {options.map((km) => {
          const selected = value === km;
          return (
            <motion.button
              key={km}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(km)}
              whileTap={motionPrefs.tap}
              className={`relative inline-flex min-h-11 cursor-pointer items-center overflow-hidden rounded-full px-3.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
                selected
                  ? "text-white"
                  : "bg-[#f3f5f8] text-[#3a3a3a] hover:bg-kadesh-50 dark:bg-night dark:text-[#d0d0d0] dark:hover:bg-kadesh/20"
              }`}
            >
              {selected ? (
                <motion.span
                  layoutId={motionPrefs.reduce ? undefined : "directory-radius-pill"}
                  className="absolute inset-0 bg-kadesh"
                  transition={motionPrefs.transition}
                  aria-hidden
                />
              ) : null}
              <span className="relative z-[1]">{km} km</span>
            </motion.button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
