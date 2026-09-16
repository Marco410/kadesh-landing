"use client";

interface OpenNowChipProps {
  pressed: boolean;
  onToggle: () => void;
  count?: number;
}

export default function OpenNowChip({
  pressed,
  onToggle,
  count,
}: OpenNowChipProps) {
  return (
    <div role="group" aria-label="Horario" className="mt-2.5 flex flex-wrap gap-1.5">
      <button
        type="button"
        aria-pressed={pressed}
        onClick={onToggle}
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
      </button>
    </div>
  );
}
