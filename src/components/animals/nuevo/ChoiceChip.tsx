'use client';

import { useChipPulse } from 'kadesh/components/animals/useChipMotion';
import { useInDash } from 'kadesh/components/app-shell/DashPortalContext';

export default function ChoiceChip({
  label,
  selected,
  onSelect,
  dotColor,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  /** Punto de color antes del texto (p. ej. el color de un estado). Blanco cuando está elegido. */
  dotColor?: string;
}) {
  const { ref, pulse } = useChipPulse();
  // En el panel con sesión (cartilla) la opción elegida va en tinta; en el sitio, en azul de marca.
  const inDash = useInDash();

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      onClick={() => {
        pulse();
        onSelect();
      }}
      className={`inline-flex min-h-10 origin-center items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-[background-color,border-color,color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
        inDash
          ? selected
            ? 'border-dash-ink bg-dash-ink text-dash-on-ink'
            : 'border-dash-line bg-dash-surface text-dash-soft hover:border-dash-line-strong hover:text-dash-ink'
          : selected
            ? 'border-kadesh bg-kadesh text-white'
            : 'border-[#d8dee8] bg-transparent text-[#3a3a3a] hover:border-kadesh/50 hover:bg-kadesh-50 dark:border-white/18 dark:text-[#e8edf4] dark:hover:bg-kadesh/15'
      }`}
    >
      {dotColor ? (
        <span
          aria-hidden
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: selected ? '#ffffff' : dotColor }}
        />
      ) : null}
      {label}
    </button>
  );
}
