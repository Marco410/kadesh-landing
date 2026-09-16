"use client";

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
  return (
    <div role="group" aria-label={label} className="mt-4 flex flex-wrap gap-1.5">
      {options.map((km) => {
        const selected = value === km;
        return (
          <button
            key={km}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(km)}
            className={`inline-flex min-h-11 cursor-pointer items-center rounded-full px-3.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
              selected
                ? "bg-kadesh text-white"
                : "bg-[#f3f5f8] text-[#3a3a3a] hover:bg-kadesh-50 dark:bg-night dark:text-[#d0d0d0] dark:hover:bg-kadesh/20"
            }`}
          >
            {km} km
          </button>
        );
      })}
    </div>
  );
}
