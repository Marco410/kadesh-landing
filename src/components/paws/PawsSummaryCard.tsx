"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Fire03Icon } from "@hugeicons/core-free-icons";
import { AnimatedNumber, Reveal, dashSurfaceClass } from "kadesh/components/app-shell";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import { PAW_LEVELS, pawLevelIcon, pawLevelProgress, pawProgressText } from "./constants";
import { levelColors } from "./LevelAvatar";
import { MY_PAWS_SUMMARY_QUERY } from "./queries";
import type { MyPawsSummaryResponse } from "./types";

/**
 * Tarjeta de Inicio del perfil: nivel, huellitas y progreso al siguiente nivel, con enlace a la
 * vista completa. Su propia consulta (sin historial), para que si falla no tire el resto de Inicio.
 * Con las huellitas apagadas en el back, o si la consulta falla, no se muestra.
 */
export default function PawsSummaryCard({ userId, index = 0 }: { userId: string; index?: number }) {
  const { data, loading } = useQuery<MyPawsSummaryResponse>(MY_PAWS_SUMMARY_QUERY, {
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });
  const paws = data?.myPaws ?? null;

  if (!paws) {
    if (!loading) return null;
    return <div className={cn(dashSurfaceClass, "dash-shimmer h-[188px]")} aria-hidden />;
  }
  if (!paws.enabled) return null;

  const { level, lifetimeEarned } = paws;
  const progress = pawLevelProgress(level, lifetimeEarned);
  const next = PAW_LEVELS.find((step) => step.level === level.level + 1) ?? null;
  const colors = levelColors(level.key);

  return (
    <Reveal as="section" index={index} className={cn(dashSurfaceClass, "min-w-0 p-5 md:p-6")}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-dash-ink">Huellitas</h2>
        <Link
          href={Routes.profileTab("paws")}
          className="inline-flex items-center gap-1 rounded-full text-sm font-medium text-kadesh-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400 dark:text-kadesh-300"
        >
          Ver más
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} aria-hidden />
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-md", colors.solid)}>
          <HugeiconsIcon icon={pawLevelIcon(level.key)} size={24} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("text-xs font-semibold uppercase tracking-[0.08em]", colors.text)}>
            Nivel {level.level} de {PAW_LEVELS.length}
          </p>
          <p className="truncate text-lg font-bold tracking-[-0.03em] text-dash-ink">{level.label}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold leading-none tracking-[-0.04em] text-dash-ink tabular-nums">
            <AnimatedNumber value={paws.balance} />
          </p>
          <p className="mt-1 text-xs text-dash-soft">{paws.balance === 1 ? "huellita" : "huellitas"}</p>
        </div>
      </div>

      <div
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-dash-surface-2"
        role="progressbar"
        aria-label={next ? `Progreso hacia el nivel ${next.label}` : "Nivel más alto alcanzado"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", colors.bar)}
          style={{ width: `${Math.max(progress, lifetimeEarned > level.from ? 3 : 0)}%` }}
        />
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-3 text-[13px]">
        <span className="text-dash-soft">{pawProgressText(level, paws.toNextLevel)}</span>
        {level.nextAt !== null ? (
          <span className="shrink-0 tabular-nums text-dash-muted">
            {lifetimeEarned.toLocaleString("es-MX")} / {level.nextAt.toLocaleString("es-MX")}
          </span>
        ) : null}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[13px] text-dash-muted">
        <HugeiconsIcon icon={Fire03Icon} size={15} aria-hidden />
        {paws.streakWeeks > 0
          ? `Racha de ${paws.streakWeeks} ${paws.streakWeeks === 1 ? "semana" : "semanas"}${
              paws.streakActiveThisWeek ? "" : ": ayuda en algo esta semana para no perderla"
            }`
          : "Ayuda en algo esta semana para empezar tu racha"}
      </p>
    </Reveal>
  );
}
