'use client';

import { useChipPulse } from 'kadesh/components/animals/useChipMotion';

export default function ChoiceChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const { ref, pulse } = useChipPulse();

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      onClick={() => {
        pulse();
        onSelect();
      }}
      className={`inline-flex min-h-10 origin-center items-center rounded-full border px-4 text-sm font-semibold transition-[background-color,border-color,color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
        selected
          ? 'border-kadesh bg-kadesh text-white'
          : 'border-[#d8dee8] bg-transparent text-[#3a3a3a] hover:border-kadesh/50 hover:bg-kadesh-50 dark:border-white/18 dark:text-[#e8edf4] dark:hover:bg-kadesh/15'
      }`}
    >
      {label}
    </button>
  );
}
