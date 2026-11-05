"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Calendar03Icon, Stethoscope02Icon } from "@hugeicons/core-free-icons";
import { Bone, SkeletonRegion } from "kadesh/components/ui/skeleton";
import { Routes } from "kadesh/core/routes";
import { useWeekAgenda, type WeekSource } from "./useWeekAgenda";
import {
  WEEK_KIND_LABEL,
  weekDotGroup,
  weekItemTime,
  type WeekDay,
  type WeekDotGroup,
  type WeekItem,
} from "./weekAgenda";

/** Filas visibles del día antes de "Ver N más". */
const DAY_PREVIEW = 4;

const DOT_CLASS: Record<WeekDotGroup, string> = {
  appointment: "bg-kadesh-500",
  mine: "bg-green-600 dark:bg-green-400",
  discover: "bg-violet-500 dark:bg-violet-400",
};

const DOT_ORDER: WeekDotGroup[] = ["appointment", "mine", "discover"];

/** Etiqueta de cada fila: cada estado trae sus colores completos (`cn` no resuelve choques). */
const CHIP_CLASS: Record<WeekDotGroup, string> = {
  appointment: "bg-kadesh-50 text-kadesh-800 dark:bg-kadesh-500/15 dark:text-kadesh-200",
  mine: "bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  discover: "bg-violet-50 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200",
};

const TILE_IDLE = "bg-dash-surface-2 text-dash-ink hover:bg-dash-hover";
const TILE_SELECTED = "bg-dash-ink text-dash-on-ink shadow-dash";

function itemCount(n: number): string {
  return n === 0 ? "sin pendientes" : n === 1 ? "1 pendiente" : `${n} pendientes`;
}

function WeekRow({ item, dayKey }: { item: WeekItem; dayKey: string }) {
  const group = weekDotGroup(item.kind);
  const icon = item.kind === "appointment" ? Stethoscope02Icon : Calendar03Icon;
  return (
    <li>
      <Link
        href={item.href}
        className="flex items-center gap-3 rounded-[14px] bg-dash-surface-2 px-3 py-2.5 transition-colors hover:bg-dash-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400"
      >
        <span className="w-[5.5rem] shrink-0 text-[13px] font-semibold tabular-nums text-dash-soft">
          {weekItemTime(item, dayKey)}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="flex items-center gap-1.5">
            <HugeiconsIcon icon={icon} size={14} className="shrink-0 text-dash-muted" aria-hidden />
            <strong className="truncate text-sm font-semibold text-dash-ink">{item.title}</strong>
          </span>
          {item.detail ? <span className="mt-0.5 block truncate text-[12.5px] text-dash-muted">{item.detail}</span> : null}
        </span>
        <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[11.5px] font-semibold sm:inline ${CHIP_CLASS[group]}`}>
          {WEEK_KIND_LABEL[item.kind]}
        </span>
      </Link>
    </li>
  );
}

function sourceHint(source: WeekSource): string {
  if (source === "zone") return "Con eventos cerca de tu zona de alertas.";
  if (source === "location") return "Con eventos cerca de tu ubicación.";
  return "Con eventos de todo México.";
}

/**
 * "Los próximos 7 días" del Inicio: una ficha por día (hoy y los 6 siguientes) con puntitos de lo
 * que hay —tus citas (azul), tus eventos (verde: organizas, asistirás o te interesa) y eventos para
 * descubrir (morado)— y la lista del día elegido.
 */
export default function WeekStrip({ userId, now }: { userId: string; now: Date }) {
  const { loading, error, days, source } = useWeekAgenda({ userId, now });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  if (error && days.every((day) => day.items.length === 0)) return null;

  const selected: WeekDay = days.find((day) => day.key === selectedKey) ?? days[0];
  const visible = expanded ? selected.items : selected.items.slice(0, DAY_PREVIEW);
  const hidden = selected.items.length - visible.length;
  const weekTotal = new Set(days.flatMap((day) => day.items.map((item) => item.id))).size;

  return (
    <section aria-labelledby="week-heading" className="mt-6">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 id="week-heading" className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-dash-muted">
          Los próximos 7 días
        </h3>
        <Link
          href={`${Routes.events.index}?cuando=semana`}
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
        >
          Eventos de la semana
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} aria-hidden />
        </Link>
      </div>

      {loading ? (
        <SkeletonRegion label="Cargando tu semana" className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: 7 }, (_, index) => (
            <Bone key={index} kind="box" height={76} radius={16} />
          ))}
        </SkeletonRegion>
      ) : (
        <>
          <div role="group" aria-label="Elige un día" className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((day) => {
              const isSelected = day.key === selected.key;
              const groups = DOT_ORDER.filter((group) => day.items.some((item) => weekDotGroup(item.kind) === group));
              return (
                <button
                  key={day.key}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${day.spoken}, ${itemCount(day.items.length)}`}
                  onClick={() => {
                    setSelectedKey(day.key);
                    setExpanded(false);
                  }}
                  className={`flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2.5 transition-[background-color,box-shadow] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400 ${
                    isSelected ? TILE_SELECTED : TILE_IDLE
                  }`}
                >
                  <span className={`text-[10.5px] font-semibold tracking-[0.08em] ${isSelected ? "opacity-80" : "text-dash-muted"}`}>
                    {day.label}
                  </span>
                  <span className="text-lg font-bold leading-none tabular-nums">{day.day}</span>
                  <span className="flex h-1.5 items-center gap-0.5" aria-hidden>
                    {groups.map((group) => (
                      <span key={group} className={`size-1.5 rounded-full ${DOT_CLASS[group]}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3" aria-live="polite">
            {selected.items.length > 0 ? (
              <>
                <ul className="space-y-1.5">
                  {visible.map((item) => (
                    <WeekRow key={item.id} item={item} dayKey={selected.key} />
                  ))}
                </ul>
                {hidden > 0 ? (
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="mt-2 text-[13px] font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
                  >
                    Ver {hidden} más
                  </button>
                ) : null}
              </>
            ) : (
              <p className="rounded-[14px] bg-dash-surface-2 px-3 py-3 text-sm text-dash-muted">
                Nada para {selected.spoken}.{" "}
                {weekTotal === 0 ? (
                  <Link href={Routes.events.index} className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300">
                    Mira los próximos eventos
                  </Link>
                ) : (
                  "Elige otro día con puntito."
                )}
              </p>
            )}
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-dash-muted">
              <span className="inline-flex items-center gap-1">
                <span className={`size-1.5 rounded-full ${DOT_CLASS.appointment}`} aria-hidden /> Citas
              </span>
              <span className="inline-flex items-center gap-1">
                <span className={`size-1.5 rounded-full ${DOT_CLASS.mine}`} aria-hidden /> Tus eventos
              </span>
              <span className="inline-flex items-center gap-1">
                <span className={`size-1.5 rounded-full ${DOT_CLASS.discover}`} aria-hidden /> Eventos para ti
              </span>
              <span>
                {sourceHint(source)}
                {source !== "zone" ? (
                  <>
                    {" "}
                    <Link href={Routes.notifications.alerts} className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300">
                      Elegir mi zona
                    </Link>
                  </>
                ) : null}
              </span>
            </p>
          </div>
        </>
      )}
    </section>
  );
}
