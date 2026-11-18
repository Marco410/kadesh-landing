"use client";

import { useId } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Fire03Icon, RankingIcon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import {
  AnimatedNumber,
  DashButton,
  DashEmptyState,
  DashErrorState,
  DashLoadMore,
  DashSectionCard,
  DashSwitch,
  Reveal,
  dashButtonClass,
  dashSurfaceClass,
} from "kadesh/components/app-shell";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import {
  PAW_GLOBAL_DAILY_CAP,
  PAW_ICON,
  PAW_LEVELS,
  PAW_WAYS_TO_EARN,
  pawActionLabel,
  pawLevelIcon,
  pawLevelProgress,
  pawProgressText,
} from "./constants";
import { levelColors } from "./LevelAvatar";
import PawLevelsList from "./PawLevelsList";
import type { MyPaws, PawHistoryEntry } from "./types";
import { useMyPaws } from "./useMyPaws";

const n = (value: number) => value.toLocaleString("es-MX");
const plural = (value: number, one: string, many: string) => `${n(value)} ${value === 1 ? one : many}`;

/**
 * `/perfil?tab=paws`: las huellitas de la persona. Nivel con su progreso, racha semanal, cómo se
 * ganan, el historial y si aparece en el ranking. Una consulta (`myPaws`) al abrir la vista.
 */
export default function PawsSection({ userId }: { userId: string }) {
  const { paws, history, hasMore, loading, error, refetch, loadMore, loadingMore, setRankingHidden, savingVisibility } =
    useMyPaws(userId);

  if (error) {
    return (
      <DashErrorState
        message="No pudimos cargar tus huellitas. Revisa tu conexión e intenta de nuevo."
        action={
          <DashButton variant="outline" size="sm" onClick={() => void refetch()}>
            Reintentar
          </DashButton>
        }
      />
    );
  }
  if (loading || !paws) return <PawsSkeleton />;
  if (!paws.enabled) {
    return (
      <DashEmptyState
        icon={PAW_ICON}
        title="Las huellitas llegan pronto"
        description="Muy pronto vas a ganar huellitas por cada reporte, aviso y caso cerrado, y a subir de nivel."
      />
    );
  }

  const onToggleRanking = async (visible: boolean) => {
    try {
      const message = await setRankingHidden(!visible);
      sileo.success({ title: message });
    } catch (err) {
      sileo.error({
        title: "No pudimos guardar",
        description: err instanceof Error ? err.message : "Intenta de nuevo en un momento.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <LevelCard paws={paws} />
        <StreakCard paws={paws} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px]">
        <DashSectionCard
          index={2}
          title="Cómo ganar huellitas"
          description={`Por ayudar de verdad. Hasta ${n(PAW_GLOBAL_DAILY_CAP)} al día entre reportes, avisos, cierres, comentarios y reseñas.`}
        >
          <ul className="divide-y divide-dash-line">
            {PAW_WAYS_TO_EARN.map((way) => (
              <li key={way.action} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-dash-ink">{way.label}</p>
                  <p className="text-xs text-dash-muted">{way.limit}</p>
                </div>
                <span className="shrink-0 rounded-full bg-kadesh-50 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-kadesh-800 dark:bg-kadesh-500/15 dark:text-kadesh-200">
                  +{n(way.points)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-dash-muted">
            Los likes, favoritos y visitas no dan huellitas. Si se borra un reporte, se oculta un aviso o se reabre un
            caso, las huellitas que dio se quitan.
          </p>
        </DashSectionCard>

        <DashSectionCard index={3} title="Movimientos" description="Lo que ganaste y lo que se quitó, lo más reciente arriba.">
          {history.length === 0 ? (
            <div className="rounded-2xl bg-dash-surface-2 px-4 py-8 text-center">
              <p className="text-sm font-medium text-dash-ink">Aún no tienes movimientos</p>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-dash-muted">
                Publica un reporte o avisa que viste a un animal perdido para ganar tus primeras huellitas.
              </p>
              <Link href={Routes.animals.index} className={cn(dashButtonClass({ variant: "outline", size: "sm" }), "mt-4")}>
                Ver animales perdidos
              </Link>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-dash-line">
                {history.map((entry) => (
                  <HistoryRow key={entry.id} entry={entry} />
                ))}
              </ul>
              {hasMore ? <DashLoadMore onClick={() => void loadMore()} loading={loadingMore} /> : null}
            </>
          )}
        </DashSectionCard>

        <DashSectionCard index={4} title="Niveles" description="Desde cuántas huellitas empieza cada uno.">
          <PawLevelsList currentLevel={paws.level.level} surface="dash" />
        </DashSectionCard>
      </div>

      <RankingCard paws={paws} saving={savingVisibility} onChange={onToggleRanking} />
    </div>
  );
}

function LevelCard({ paws }: { paws: MyPaws }) {
  const { level, lifetimeEarned, toNextLevel } = paws;
  const next = PAW_LEVELS.find((step) => step.level === level.level + 1) ?? null;
  const progress = pawLevelProgress(level, lifetimeEarned);
  const progressLabel = pawProgressText(level, toNextLevel);
  const colors = levelColors(level.key);
  const nextColors = next ? levelColors(next.key) : null;

  return (
    <Reveal as="section" index={0} className={cn(dashSurfaceClass, "relative flex flex-col overflow-hidden p-6 xl:p-8")}>
      {/* Brillo del color del nivel en la esquina. */}
      <span
        aria-hidden
        className={cn("pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-gradient-to-br to-transparent blur-2xl", colors.glow)}
      />

      <div className="relative flex flex-wrap items-center gap-4">
        <span className={cn("flex size-16 shrink-0 items-center justify-center rounded-2xl shadow-lg", colors.solid)}>
          <HugeiconsIcon icon={pawLevelIcon(level.key)} size={32} strokeWidth={1.8} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className={cn("text-[13px] font-semibold uppercase tracking-[0.08em]", colors.text)}>
            Nivel {level.level} de {PAW_LEVELS.length}
          </p>
          <h2 className="text-[clamp(1.7rem,1.2rem+1.6vw,2.4rem)] font-bold leading-[1.05] tracking-[-0.04em] text-dash-ink">
            {level.label}
          </h2>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[clamp(2rem,1.4rem+2vw,2.9rem)] font-bold leading-none tracking-[-0.04em] text-dash-ink tabular-nums">
            <AnimatedNumber value={paws.balance} />
          </p>
          <p className="mt-1 text-sm text-dash-soft">{paws.balance === 1 ? "huellita" : "huellitas"}</p>
        </div>
      </div>

      <div className="relative mt-7 rounded-2xl bg-dash-surface-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="text-sm font-medium text-dash-ink">{progressLabel}</p>
          {next && nextColors ? (
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", nextColors.soft)}>
              <HugeiconsIcon icon={next.icon} size={13} strokeWidth={2} aria-hidden />
              Siguiente: {next.label}
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div
            className="h-3 flex-1 overflow-hidden rounded-full bg-dash-surface-3"
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
          <span className="shrink-0 text-sm font-semibold tabular-nums text-dash-soft">
            {level.nextAt !== null ? `${n(lifetimeEarned)} / ${n(level.nextAt)}` : `${n(lifetimeEarned)}`}
          </span>
        </div>
      </div>

      <ol className="relative mt-7 grid grid-cols-6 gap-1" aria-label="Niveles">
        {/* Línea que une los niveles; la parte alcanzada va del color del nivel actual. */}
        <span aria-hidden className="absolute left-[8.33%] right-[8.33%] top-5 h-1 rounded-full bg-dash-surface-3" />
        <span
          aria-hidden
          className={cn("absolute left-[8.33%] top-5 h-1 rounded-full", colors.bar)}
          style={{ width: `${((level.level - 1) / (PAW_LEVELS.length - 1)) * 83.34}%` }}
        />
        {PAW_LEVELS.map((step) => {
          const reached = step.level <= level.level;
          const current = step.level === level.level;
          const stepColors = levelColors(step.key);
          return (
            <li key={step.key} aria-current={current ? "step" : undefined} className="relative flex flex-col items-center text-center">
              <span
                className={cn(
                  "relative flex items-center justify-center rounded-full border-4 border-dash-surface transition-transform",
                  current ? "size-11 -mt-0.5 scale-110 shadow-lg" : "size-10",
                  reached ? stepColors.solid : "bg-dash-surface-2 text-dash-muted",
                )}
              >
                <HugeiconsIcon icon={step.icon} size={current ? 18 : 16} strokeWidth={2} aria-hidden />
              </span>
              <p
                className={cn(
                  "mt-2 w-full truncate text-[11px] font-semibold sm:text-xs",
                  current ? stepColors.text : reached ? "text-dash-ink" : "text-dash-muted",
                )}
              >
                <span className="sr-only">
                  Nivel {step.level}
                  {reached ? (current ? " (actual)" : " (alcanzado)") : ""}:{" "}
                </span>
                {step.label}
              </p>
              <p className="text-[10px] tabular-nums text-dash-muted sm:text-[11px]">{n(step.from)}</p>
            </li>
          );
        })}
      </ol>
    </Reveal>
  );
}

function StreakCard({ paws }: { paws: MyPaws }) {
  const weeks = paws.streakWeeks;
  const status = paws.streakActiveThisWeek
    ? "Esta semana ya cuenta."
    : weeks > 0
      ? "Ayuda en algo esta semana para no perderla."
      : "Ayuda en algo esta semana para empezarla.";

  return (
    <Reveal as="section" index={1} className={cn(dashSurfaceClass, "flex flex-col p-6")}>
      <div className="flex items-center gap-2 text-dash-soft">
        <HugeiconsIcon icon={Fire03Icon} size={20} aria-hidden />
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-dash-ink">Racha semanal</h2>
      </div>
      <p className="mt-4 text-[clamp(2.2rem,1.6rem+2vw,3rem)] font-bold leading-none tracking-[-0.04em] text-dash-ink tabular-nums">
        <AnimatedNumber value={weeks} />
      </p>
      <p className="mt-1 text-sm text-dash-soft">{weeks === 1 ? "semana seguida" : "semanas seguidas"}</p>
      <p
        className={cn(
          "mt-4 rounded-2xl px-3 py-2 text-sm font-medium",
          paws.streakActiveThisWeek
            ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300"
            : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
        )}
      >
        {status}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-dash-muted">
        Una acción que ayude por semana (lunes a domingo) la mantiene. Desde la segunda semana seguida ganas un bono de
        hasta 25 huellitas.
      </p>
      {paws.bestStreakWeeks > 0 ? (
        <p className="mt-auto pt-4 text-sm text-dash-soft">
          Tu mejor racha: <strong className="font-semibold text-dash-ink">{plural(paws.bestStreakWeeks, "semana", "semanas")}</strong>
        </p>
      ) : null}
    </Reveal>
  );
}

function HistoryRow({ entry }: { entry: PawHistoryEntry }) {
  const positive = entry.amount > 0;
  const date = new Date(entry.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-dash-ink">{pawActionLabel(entry.action, entry.kind)}</p>
        <p className="text-xs text-dash-muted">{date}</p>
      </div>
      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          positive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-400",
        )}
      >
        {positive ? "+" : "−"}
        {n(Math.abs(entry.amount))}
      </span>
    </li>
  );
}

function RankingCard({
  paws,
  saving,
  onChange,
}: {
  paws: MyPaws;
  saving: boolean;
  onChange: (visible: boolean) => void;
}) {
  const labelId = useId();
  const descriptionId = useId();
  const visible = !paws.rankingHidden;
  return (
    <Reveal as="section" index={4} className={cn(dashSurfaceClass, "flex flex-wrap items-center gap-4 p-5 md:p-6")}>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-dash-surface-2 text-dash-soft">
        <HugeiconsIcon icon={RankingIcon} size={22} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id={labelId} className="text-[15px] font-semibold text-dash-ink">
          Aparecer en el ranking de quien más apoya
        </h2>
        <p id={descriptionId} className="mt-0.5 text-[13px] leading-relaxed text-dash-muted">
          {visible && paws.rank ? `Vas en el lugar ${n(paws.rank)}. ` : ""}
          Solo se ven tu nombre y tu foto, nunca tus datos de contacto.{" "}
          <Link href={Routes.ranking} className="font-medium text-kadesh-600 hover:underline dark:text-kadesh-300">
            Ver el ranking
          </Link>
        </p>
      </div>
      <DashSwitch checked={visible} onChange={onChange} disabled={saving} labelledBy={labelId} describedBy={descriptionId} />
    </Reveal>
  );
}

function PawsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando tus huellitas" role="status">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className={cn(dashSurfaceClass, "p-6 xl:p-8")}>
          <div className="flex items-center gap-4">
            <div className="dash-shimmer size-14 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="dash-shimmer h-3 w-24 rounded-full" />
              <div className="dash-shimmer h-7 w-40 rounded-full" />
            </div>
          </div>
          <div className="dash-shimmer mt-8 h-3 w-full rounded-full" />
          <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="dash-shimmer h-14 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className={cn(dashSurfaceClass, "space-y-3 p-6")}>
          <div className="dash-shimmer h-4 w-32 rounded-full" />
          <div className="dash-shimmer h-12 w-20 rounded-2xl" />
          <div className="dash-shimmer h-10 w-full rounded-2xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className={cn(dashSurfaceClass, "space-y-3 p-6")}>
            <div className="dash-shimmer h-4 w-40 rounded-full" />
            {Array.from({ length: 5 }).map((_, row) => (
              <div key={row} className="dash-shimmer h-8 w-full rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

