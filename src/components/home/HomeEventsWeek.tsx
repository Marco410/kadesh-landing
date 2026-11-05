'use client';

import { useEffect, useMemo, useState } from 'react';
import EventCard from 'kadesh/components/events/EventCard';
import { DEFAULT_EVENT_TIME_ZONE, eventCategory } from 'kadesh/components/events/constants';
import { eventDayKey } from 'kadesh/components/events/format';
import type { EventFeedItem } from 'kadesh/components/events/types';
import { localTodayKey, occurrencesByDay, weekTiles } from 'kadesh/components/events/week';

/** Tarjetas visibles del día antes de «Ver N más». */
const DAY_PREVIEW = 3;

/** Cada estado trae sus colores completos: `cn` no resuelve choques de Tailwind. */
const TILE_IDLE =
  'border-[#e3e7ee] bg-white text-[#121212] hover:border-kadesh dark:border-white/12 dark:bg-[#1e1e1e] dark:text-white';
const TILE_SELECTED = 'border-[#121212] bg-[#121212] text-white dark:border-white dark:bg-white dark:text-[#121212]';

function countLabel(n: number): string {
  return n === 0 ? 'sin eventos' : n === 1 ? '1 evento' : `${n} eventos`;
}

/**
 * Los próximos 7 días en la portada: todos los eventos publicados de México, sin filtro. Una ficha
 * por día con puntitos del color de cada tipo de evento y, abajo, las tarjetas del día elegido.
 * El HTML sale con «hoy» en hora de CDMX; al hidratar se ajusta al día del navegador.
 */
export default function HomeEventsWeek({ from, events }: { from: string; events: EventFeedItem[] }) {
  const [todayKey, setTodayKey] = useState(() => eventDayKey(from, DEFAULT_EVENT_TIME_ZONE));
  useEffect(() => {
    const local = localTodayKey();
    if (local !== todayKey) setTodayKey(local);
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tiles = useMemo(() => weekTiles(todayKey), [todayKey]);
  const byDay = useMemo(() => occurrencesByDay(events, tiles), [events, tiles]);
  const firstWithEvents = tiles.find((tile) => (byDay.get(tile.key) ?? []).length > 0)?.key ?? tiles[0].key;
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const selected = tiles.find((tile) => tile.key === selectedKey) ?? tiles.find((tile) => tile.key === firstWithEvents) ?? tiles[0];
  const dayItems = byDay.get(selected.key) ?? [];
  const visible = expanded ? dayItems : dayItems.slice(0, DAY_PREVIEW);
  const hidden = dayItems.length - visible.length;

  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#5a5a5a] dark:text-[#9aa3b2]">
        Los próximos 7 días
      </p>
      <div role="group" aria-label="Elige un día" className="grid grid-cols-7 gap-1.5 sm:gap-3">
        {tiles.map((tile) => {
          const items = byDay.get(tile.key) ?? [];
          const isSelected = tile.key === selected.key;
          const colors = [...new Set(items.map((item) => eventCategory(item.event.category).color))].slice(0, 3);
          return (
            <button
              key={tile.key}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${tile.spoken}, ${countLabel(items.length)}`}
              onClick={() => {
                setSelectedKey(tile.key);
                setExpanded(false);
              }}
              className={`flex min-h-[84px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh sm:min-h-[96px] ${
                isSelected ? TILE_SELECTED : TILE_IDLE
              }`}
            >
              <span className={`text-[10.5px] font-bold tracking-[0.08em] sm:text-xs ${isSelected ? 'opacity-80' : 'text-[#5a5a5a] dark:text-[#9aa3b2]'}`}>
                {tile.label}
              </span>
              <span className="text-xl font-black leading-none tabular-nums sm:text-2xl">{tile.day}</span>
              <span className="flex h-2 items-center gap-0.5" aria-hidden>
                {colors.map((color) => (
                  <span key={color} className="size-1.5 rounded-full sm:size-2" style={{ backgroundColor: color }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6" aria-live="polite">
        {dayItems.length > 0 ? (
          <>
            <p className="mb-4 text-sm font-semibold text-[#3a3a3a] dark:text-[#d0d0d0]">
              {countLabel(dayItems.length).replace(/^./, (c) => c.toUpperCase())} {selected.spoken}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map(({ event, session }) => (
                <EventCard
                  key={`${event.id}:${session.id}`}
                  item={{ event, nextStartsAt: session.startsAt, nextEndsAt: session.endsAt, distanceKm: null }}
                />
              ))}
            </div>
            {hidden > 0 ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="mt-5 inline-flex min-h-11 items-center font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
              >
                Ver {hidden} más de este día
              </button>
            ) : null}
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-[#d8dee8] px-5 py-8 text-center text-[#5a5a5a] dark:border-white/15 dark:text-[#b0b0b0]">
            No hay eventos {selected.spoken}. Elige un día con puntitos.
          </p>
        )}
      </div>

    </div>
  );
}
