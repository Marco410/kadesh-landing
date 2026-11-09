'use client';

import { useDeferredValue, useId, useMemo, useState, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { cn } from 'kadesh/utils/cn';

export type RescueDirectoryEntry = {
  id: string;
  type: string;
  /** Nombre, ciudad, estado y tipo, en texto libre. */
  search: string;
  /** Tarjeta ya pintada por el servidor. */
  card: ReactNode;
};

export type RescueDirectoryTypeOption = { value: string; label: string; count: number };

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const chipClass =
  'inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh';

/**
 * Filtro del directorio de espacios: tipo y búsqueda por texto. Las tarjetas llegan pintadas desde
 * el servidor; aquí solo se decide cuáles se ven.
 */
export default function RescueDirectoryFilters({
  entries,
  types,
}: {
  entries: RescueDirectoryEntry[];
  types: RescueDirectoryTypeOption[];
}) {
  const searchId = useId();
  const [type, setType] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const indexed = useMemo(() => entries.map((entry) => ({ ...entry, haystack: normalize(entry.search) })), [entries]);
  const needle = normalize(deferredQuery);
  const visible = indexed.filter((entry) => (!type || entry.type === type) && (!needle || entry.haystack.includes(needle)));
  const filtered = Boolean(type || needle);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full lg:max-w-sm">
          <label htmlFor={searchId} className="mb-1.5 block text-sm font-semibold text-[#3a3a3a] dark:text-[#d0d0d0]">
            Busca por nombre o ciudad
          </label>
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              size={18}
              strokeWidth={1.5}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#5a5a5a] dark:text-[#9aa3b2]"
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ej. Morelia o Patitas"
              autoComplete="off"
              className="min-h-12 w-full rounded-xl border border-[#d8dee8] bg-white pr-4 pl-10 text-[#121212] placeholder:text-[#7a7a7a] focus:border-kadesh focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-white/15 dark:bg-night-raised dark:text-white dark:placeholder:text-[#8a93a3]"
            />
          </div>
        </div>
        {types.length > 1 ? (
          <div role="group" aria-label="Tipo de espacio" className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={type === null}
              onClick={() => setType(null)}
              className={cn(
                chipClass,
                type === null
                  ? 'border-[#121212] bg-[#121212] text-white dark:border-white dark:bg-white dark:text-[#121212]'
                  : 'border-[#dcdcdc] bg-white text-[#3a3a3a] hover:border-kadesh dark:border-white/15 dark:bg-night dark:text-[#d0d0d0]',
              )}
            >
              Todos <span className="opacity-70">({entries.length})</span>
            </button>
            {types.map((option) => {
              const active = type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setType(active ? null : option.value)}
                  className={cn(
                    chipClass,
                    active
                      ? 'border-[#121212] bg-[#121212] text-white dark:border-white dark:bg-white dark:text-[#121212]'
                      : 'border-[#dcdcdc] bg-white text-[#3a3a3a] hover:border-kadesh dark:border-white/15 dark:bg-night dark:text-[#d0d0d0]',
                  )}
                >
                  {option.label} <span className="opacity-70">({option.count})</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <p role="status" className="mb-4 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
        {filtered
          ? `${visible.length} de ${entries.length} ${entries.length === 1 ? 'espacio' : 'espacios'}`
          : `${entries.length} ${entries.length === 1 ? 'espacio verificado' : 'espacios verificados'}`}
      </p>

      {visible.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((entry) => (
            <li key={entry.id}>{entry.card}</li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#d8dee8] bg-white px-6 py-12 text-center dark:border-white/15 dark:bg-night-raised">
          <p className="text-lg font-bold text-[#121212] dark:text-white">No encontramos espacios con esa búsqueda</p>
          <p className="mx-auto mt-1 max-w-md text-[#5a5a5a] dark:text-[#b0b0b0]">Prueba con otra ciudad o quita el filtro.</p>
          <button
            type="button"
            onClick={() => {
              setType(null);
              setQuery('');
            }}
            className="mt-5 inline-flex min-h-11 items-center rounded-xl border-2 border-kadesh px-5 font-semibold text-kadesh-700 transition-colors hover:bg-kadesh hover:text-white dark:text-kadesh-200"
          >
            Ver todos
          </button>
        </div>
      )}
    </div>
  );
}
