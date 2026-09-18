export const INPUT_CLASS =
  "w-full min-h-11 rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2]";

export const COMPACT_SELECT_CLASS =
  "min-h-11 min-w-0 flex-1 rounded-lg border border-[#d8dee8] bg-white px-2 text-sm text-[#121212] focus:outline-none focus:ring-2 focus:ring-kadesh disabled:opacity-50 dark:border-white/18 dark:bg-night dark:text-[#eef1f6]";

export const LABEL_CLASS =
  "mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]";

export const SECTION_TITLE_CLASS =
  "text-sm font-bold text-[#121212] dark:text-[#eef1f6]";

export const CHIP_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh";

export function chipTone(selected: boolean): string {
  return selected
    ? "border-kadesh bg-kadesh text-white"
    : "border-[#d8dee8] bg-transparent text-[#3a3a3a] hover:border-kadesh/50 hover:bg-kadesh-50 dark:border-white/18 dark:text-[#e8edf4] dark:hover:bg-kadesh/15";
}
