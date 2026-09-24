"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";

interface VeterinarySearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function VeterinarySearchInput({
  value,
  onChange,
}: VeterinarySearchInputProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (draft === value) return;
    const handle = window.setTimeout(() => onChange(draft), 250);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <div className="relative mt-3">
      <HugeiconsIcon
        icon={Search01Icon}
        size={18}
        strokeWidth={1.5}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a5a] dark:text-[#9aa3b2]"
      />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        aria-label="Buscar veterinaria por nombre"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Buscar por nombre"
        className="min-h-11 w-full rounded-xl border border-[#d8dee8] bg-white pl-10 pr-11 text-base text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh sm:text-sm dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2] [&::-webkit-search-cancel-button]:appearance-none"
      />
      {draft && (
        <button
          type="button"
          aria-label="Borrar búsqueda"
          onClick={() => {
            setDraft("");
            onChange("");
          }}
          className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[#5a5a5a] hover:bg-kadesh-50 dark:text-[#9aa3b2] dark:hover:bg-kadesh/15"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
