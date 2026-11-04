"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  AlertCircleIcon,
  ArrowDownRight01Icon,
  ArrowUpRight01Icon,
  Cancel01Icon,
  InboxIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";
import AnimatedNumber from "./AnimatedNumber";
import Reveal from "./Reveal";
import { Sparkline } from "./charts";
import { DASH_EASE, indicatorTransition } from "./motion";

/*
 * Kit del panel con sesión sobre los tokens `dash-*` (globals.css). Copia adaptada del kit de
 * Operaciones de kadesh-business (`components/admin/ui.tsx`): tarjetas de 24 px con sombra suave,
 * píldoras, chips activos en tinta y el azul de marca solo en la acción principal.
 *
 * `cn` no mezcla clases: ningún componente acepta `className` para "sobrescribir" su variante.
 * Si hace falta otra, se agrega aquí.
 */

/** Tarjeta base del panel: 24 px, borde casi invisible y sombra suave. */
export const dashSurfaceClass = "rounded-3xl border border-dash-line bg-dash-surface shadow-dash";

// ─── Insignias ──────────────────────────────────────────────────────────────────────────────

export type DashTone = "neutral" | "ok" | "warning" | "danger" | "accent";

const BADGE_TONES: Record<DashTone, string> = {
  neutral: "bg-dash-surface-2 text-dash-soft",
  ok: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  accent: "bg-kadesh-50 text-kadesh-800 dark:bg-kadesh-500/15 dark:text-kadesh-200",
};

/** Píldora de estado. Los colores de estatus son datos: aquí sí van con su `dark:`. */
export function DashStatusBadge({ label, tone = "neutral" }: { label: string; tone?: DashTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5",
        BADGE_TONES[tone],
      )}
    >
      {label}
    </span>
  );
}

// ─── Controles ──────────────────────────────────────────────────────────────────────────────

/** Cambio de vista dentro de una sección: pista cálida con la opción activa en píldora que se desliza. */
export function DashSegmented<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
}: {
  items: Array<{ id: T; label: string; count?: number | null }>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  const layoutId = useId();
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex max-w-full gap-0.5 self-start overflow-x-auto rounded-full bg-dash-surface-2 p-[3px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative h-10 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400",
              selected ? "font-semibold text-dash-ink" : "font-medium text-dash-soft hover:text-dash-ink",
            )}
          >
            {selected ? (
              <motion.span
                layoutId={`segmented-${layoutId}`}
                transition={indicatorTransition}
                className="absolute inset-0 rounded-full bg-dash-surface shadow-[0_1px_3px_rgba(20,20,20,0.12)] dark:bg-dash-surface-3"
                aria-hidden
              />
            ) : null}
            <span className="relative">
              {item.label}
              {item.count != null ? (
                <span className="ml-1.5 text-xs font-semibold tabular-nums text-dash-muted">
                  {item.count.toLocaleString("es-MX")}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Filtro de una lista: píldoras con borde; la activa en tinta. Opcionales: `count` (cuántos hay)
 * y `dot` (clase de color del punto, p. ej. el color de un estatus).
 */
export function DashFilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: T; label: string; count?: number | null; dot?: string }>;
  value: T;
  onChange: (value: T) => void;
  label?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {label ? <span className="shrink-0 text-[13px] font-semibold text-dash-muted">{label}</span> : null}
      <div className="-mx-1 -my-1 flex min-w-0 snap-x gap-1.5 overflow-x-auto px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] xl:flex-wrap xl:overflow-visible [&::-webkit-scrollbar]:hidden">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex h-11 shrink-0 cursor-pointer snap-start items-center gap-2 rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400 xl:h-[38px]",
                selected
                  ? "border-dash-ink bg-dash-ink text-dash-on-ink"
                  : "border-dash-line bg-dash-surface text-dash-soft hover:border-dash-line-strong hover:text-dash-ink",
              )}
            >
              {option.dot ? <span className={cn("size-2 shrink-0 rounded-full", option.dot)} aria-hidden /> : null}
              {option.label}
              {option.count != null ? (
                <span
                  className={cn("text-xs font-semibold tabular-nums", selected ? "text-dash-on-ink/70" : "text-dash-muted")}
                >
                  {option.count.toLocaleString("es-MX")}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Botones ────────────────────────────────────────────────────────────────────────────────

export type DashButtonVariant = "primary" | "dark" | "outline" | "ghost" | "danger" | "danger-ghost";
export type DashButtonSize = "md" | "sm" | "icon" | "icon-sm";

/**
 * Clases de botón, también para `<a>`/`<Link>` que deben verse como botón. `primary` (el
 * degradado azul) es solo para la acción principal de la vista; lo demás va en `dark`, `outline`
 * o `ghost`. `fullWidth` para el botón que ocupa toda la fila (formularios en móvil).
 */
export function dashButtonClass({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: {
  variant?: DashButtonVariant;
  size?: DashButtonSize;
  fullWidth?: boolean;
} = {}) {
  return cn(
    "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[-0.01em]",
    "transition-[background-color,border-color,box-shadow,transform,color,opacity] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)]",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dash-surface",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    {
      md: "h-11 px-5 text-[15px]",
      sm: "h-10 px-4 text-sm",
      icon: "size-11",
      "icon-sm": "size-10",
    }[size],
    fullWidth && "w-full",
    {
      primary: "dash-grad-accent text-white shadow-dash-accent hover:-translate-y-px hover:shadow-dash-accent-lift",
      dark: "bg-dash-ink text-dash-on-ink hover:opacity-90",
      outline: "border border-dash-line-strong bg-dash-surface text-dash-ink hover:border-kadesh-400",
      ghost: "text-dash-soft hover:bg-dash-hover hover:text-dash-ink",
      danger: "bg-red-600 text-white hover:bg-red-700",
      "danger-ghost": "text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10",
    }[variant],
  );
}

export function DashButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  children,
  type = "button",
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  variant?: DashButtonVariant;
  size?: DashButtonSize;
  fullWidth?: boolean;
  icon?: IconSvgElement;
}) {
  return (
    <button type={type} className={dashButtonClass({ variant, size, fullWidth })} {...props}>
      {icon ? (
        <HugeiconsIcon icon={icon} size={size === "sm" || size === "icon-sm" ? 16 : 18} aria-hidden />
      ) : null}
      {children}
    </button>
  );
}

// ─── Tarjetas y estados ─────────────────────────────────────────────────────────────────────

export function DashSectionCard({
  title,
  description,
  action,
  children,
  index = 0,
  as = "section",
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  /** Posición para escalonar la entrada (50 ms cada una, tope 8). */
  index?: number;
  as?: "section" | "div";
}) {
  return (
    <Reveal as={as} index={index} className={cn(dashSurfaceClass, "min-w-0 p-5 md:p-6")}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-dash-ink">{title}</h2>
          {description ? <p className="mt-0.5 text-[13px] text-dash-muted">{description}</p> : null}
        </div>
        {action ? <div className="min-w-0 max-w-full">{action}</div> : null}
      </div>
      {children}
    </Reveal>
  );
}

export function DashEmptyState({
  title,
  description,
  icon = InboxIcon,
  action,
}: {
  title: string;
  description: ReactNode;
  icon?: IconSvgElement;
  action?: ReactNode;
}) {
  return (
    <div className={cn(dashSurfaceClass, "px-6 py-12 text-center")}>
      <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-dash-surface-2 text-dash-muted">
        <HugeiconsIcon icon={icon} size={22} aria-hidden />
      </span>
      <p className="text-base font-semibold tracking-[-0.01em] text-dash-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-dash-muted">{description}</p>
      {action ? <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

export function DashErrorState({ message, action }: { message: ReactNode; action?: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
    >
      <HugeiconsIcon icon={AlertCircleIcon} size={20} className="mt-0.5 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">{message}</span>
      {action}
    </div>
  );
}

/** Filas de carga con brillo (`dash-shimmer`), con la forma de una lista. */
export function DashLoadingRows({ rows = 5, label = "Cargando" }: { rows?: number; label?: string }) {
  return (
    <div className={cn(dashSurfaceClass, "overflow-hidden")} aria-busy="true" aria-label={label} role="status">
      <div className="divide-y divide-dash-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex h-16 items-center gap-3 px-4">
            <div className="dash-shimmer size-9 shrink-0 rounded-full" />
            <div className="dash-shimmer h-3 w-full max-w-md rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashLoadMore({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <div className="flex justify-center pt-2">
      <DashButton variant="outline" onClick={onClick} disabled={loading}>
        {loading ? "Cargando…" : "Cargar más"}
      </DashButton>
    </div>
  );
}

// ─── KPIs ───────────────────────────────────────────────────────────────────────────────────

export type DashStatDelta = {
  /** % de cambio; `null` = sin con qué comparar (solo se muestra el texto). */
  value: number | null;
  label?: string;
};

/**
 * Indicador (KPI). Variantes:
 * - `default`: tarjeta blanca.
 * - `dark`: casi negra con brillo azul, para el número más importante de la vista (uno por vista).
 * - `tint`: azul claro, para el segundo. Su texto secundario va en `soft`: `muted` no pasa AA ahí.
 * `tone` (warning, danger, success) pinta un punto junto a la etiqueta y la cifra; no el borde.
 * Si `value` es número, cuenta hacia arriba al aparecer (`formatValue` le da formato).
 * `href`/`onClick` la vuelven tocable (lift al pasar).
 */
export function DashStatTile({
  label,
  value,
  hint,
  tone = "default",
  onClick,
  href,
  variant = "default",
  icon,
  delta,
  sparkline,
  formatValue,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "warning" | "danger" | "success";
  onClick?: () => void;
  href?: string;
  variant?: "default" | "dark" | "tint";
  icon?: IconSvgElement;
  delta?: DashStatDelta | null;
  sparkline?: number[] | null;
  formatValue?: (value: number) => string;
}) {
  const dark = variant === "dark";
  const tint = variant === "tint";
  const toneDot = {
    default: null,
    warning: "bg-amber-500",
    danger: "bg-red-500",
    success: "bg-green-500",
  }[tone];
  const toneValue = dark
    ? "text-white"
    : {
        default: "text-dash-ink",
        warning: "text-amber-700 dark:text-amber-400",
        danger: "text-red-700 dark:text-red-400",
        success: "text-green-700 dark:text-green-300",
      }[tone];
  const secondary = dark ? "text-white/70" : tint ? "text-dash-soft" : "text-dash-muted";

  const content = (
    <>
      <span className="flex items-center gap-2.5">
        {icon ? (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              dark && "bg-white/12 text-white",
              tint && "bg-white/70 text-kadesh-700 dark:bg-white/10 dark:text-kadesh-300",
              variant === "default" && "bg-dash-surface-2 text-dash-soft",
            )}
          >
            <HugeiconsIcon icon={icon} size={18} aria-hidden />
          </span>
        ) : null}
        <span className={cn("flex min-w-0 items-center gap-1.5 text-[13px] font-medium leading-tight", secondary)}>
          {toneDot ? <span className={cn("size-2 shrink-0 rounded-full", toneDot)} aria-hidden /> : null}
          <span className="min-w-0">{label}</span>
        </span>
      </span>
      <span
        className={cn(
          "block text-[1.75rem] font-bold leading-none tracking-[-0.045em] tabular-nums sm:text-[2rem]",
          toneValue,
        )}
      >
        {typeof value === "number" ? <AnimatedNumber value={value} format={formatValue} /> : value}
      </span>
      {hint || delta ? (
        <span className="flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1">
          {delta ? <DeltaPill delta={delta} onDark={dark} /> : null}
          {hint ? <span className={cn("text-[13px] leading-snug", secondary)}>{hint}</span> : null}
        </span>
      ) : null}
      {sparkline && sparkline.length > 1 ? (
        <Sparkline series={sparkline} tone={dark ? "onDark" : "accent"} className="-mb-1 mt-auto" />
      ) : null}
    </>
  );

  const className = cn(
    "relative flex h-full w-full flex-col gap-2.5 overflow-hidden rounded-3xl border p-4 text-left sm:p-5",
    variant === "default" && "border-dash-line bg-dash-surface shadow-dash",
    dark && "dash-grad-dark border-transparent text-white shadow-dash dark:border-white/10",
    tint && "dash-grad-tint border-[color:var(--dash-tint-line)] shadow-dash",
  );
  const interactive =
    "cursor-pointer transition-[transform,box-shadow] duration-[250ms] ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-0.5 hover:shadow-dash-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400";

  if (href) {
    return (
      <Link href={href} className={cn(className, interactive)}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(className, interactive)}>
        {content}
      </button>
    );
  }
  return <div className={className}>{content}</div>;
}

function DeltaPill({ delta, onDark }: { delta: DashStatDelta; onDark: boolean }) {
  const up = delta.value != null && delta.value > 0;
  const down = delta.value != null && delta.value < 0;
  const text = delta.value != null ? `${delta.value > 0 ? "+" : ""}${delta.value}%` : delta.label;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        onDark
          ? "bg-white/14 text-white"
          : up
            ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300"
            : down
              ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300"
              : "bg-dash-surface-2 text-dash-muted",
      )}
      title={delta.label}
    >
      {up ? <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} aria-hidden /> : null}
      {down ? <HugeiconsIcon icon={ArrowDownRight01Icon} size={13} aria-hidden /> : null}
      {text}
      {delta.value != null && delta.label ? <span className="sr-only"> {delta.label}</span> : null}
    </span>
  );
}

// ─── Campos y tablas ────────────────────────────────────────────────────────────────────────

export const dashInputClass =
  "h-11 w-full rounded-[14px] border border-dash-line-strong bg-dash-surface px-3.5 text-[15px] text-dash-ink placeholder:text-dash-muted transition-[border-color,box-shadow] focus:border-kadesh-400 focus:outline-none focus:ring-[3px] focus:ring-kadesh-500/15 disabled:cursor-not-allowed disabled:opacity-60";

export const dashSelectClass = cn(dashInputClass, "cursor-pointer");

/** `h-auto` le gana a `h-11` por el orden del CSS de Tailwind, no por ir después (`cn` no mezcla). */
export const dashTextareaClass = cn(dashInputClass, "h-auto min-h-24 py-2.5 leading-relaxed");

export const dashLabelClass = "mb-1.5 block text-[13px] font-semibold text-dash-soft";

/** Contenedor de tabla (tarjeta con scroll horizontal). */
export const dashTableWrapClass = cn(dashSurfaceClass, "overflow-x-auto");
export const dashTableClass = "w-full text-left text-sm";
export const dashTheadClass =
  "bg-dash-surface-2/60 text-[12px] font-semibold uppercase tracking-[0.04em] text-dash-muted";
export const dashThClass = "px-4 py-3 font-semibold";
export const dashTdClass = "px-4 py-3 align-middle";
export const dashRowClass = "border-t border-dash-line transition-colors duration-150 hover:bg-kadesh-500/[0.04]";

// ─── Paneles que se abren ───────────────────────────────────────────────────────────────────

const closeButtonClass =
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400 disabled:opacity-50";

/**
 * Lo común a modal y cajón: portal a `body` (ningún contenedor con transform lo recorta), Escape,
 * scroll del fondo bloqueado y foco. Al abrir, el foco entra al panel; al cerrar, regresa a
 * quien lo abrió. Con `busy` no se cierra con Escape ni con el velo.
 */
function useOverlay(open: boolean, onClose: () => void, busy: boolean) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);

  useEffect(() => {
    onCloseRef.current = onClose;
    busyRef.current = busy;
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    const frame = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      // El primer campo que de verdad acepte el foco (un input de archivo oculto no lo acepta).
      const candidates = panel.querySelectorAll<HTMLElement>(
        "[data-autofocus], input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled])",
      );
      for (const element of Array.from(candidates)) {
        element.focus({ preventScroll: true });
        if (document.activeElement === element) return;
      }
      panel.focus({ preventScroll: true });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open]);

  return { mounted, panelRef };
}

/**
 * Modal centrado (hoja inferior en móvil) con encabezado fijo y pie opcional. `AnimatePresence`
 * envuelve lo que se monta y desmonta: así también anima al cerrarse.
 */
export function DashModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  busy = false,
  headerAside,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
  /** Mientras guarda: no se cierra con Escape, el velo ni la ✕. */
  busy?: boolean;
  /** Algo junto al título (insignia de estado). */
  headerAside?: ReactNode;
}) {
  const { mounted, panelRef } = useOverlay(open, onClose, busy);
  const reduce = useReducedMotion();
  const titleId = useId();
  const widths = { md: "sm:max-w-xl", lg: "sm:max-w-3xl", xl: "sm:max-w-5xl" }[size];
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="dash-modal"
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={busy ? undefined : onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: DASH_EASE }}
            onClick={(event) => event.stopPropagation()}
            className={cn(
              "kd-dash-portal flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-dash-line bg-dash-surface font-dash text-dash-ink shadow-dash-lift focus:outline-none sm:max-h-[90vh] sm:rounded-3xl",
              widths,
            )}
          >
            <div className="flex items-start justify-between gap-3 border-b border-dash-line px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id={titleId} className="text-xl font-semibold tracking-[-0.02em] text-dash-ink [overflow-wrap:anywhere]">
                    {title}
                  </h2>
                  {headerAside}
                </div>
                {subtitle ? (
                  <div className="mt-1 text-sm text-dash-muted [overflow-wrap:anywhere]">{subtitle}</div>
                ) : null}
              </div>
              <button type="button" onClick={onClose} disabled={busy} aria-label="Cerrar" className={closeButtonClass}>
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer ? (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-dash-line bg-dash-surface px-5 py-3.5 sm:px-6">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/**
 * Panel lateral (hoja inferior en móvil). Para ver o editar a fondo sin perder el contexto de la
 * vista. Sale de la derecha desde 640 px.
 */
export function DashDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  busy = false,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  busy?: boolean;
}) {
  const { mounted, panelRef } = useOverlay(open, onClose, busy);
  const reduce = useReducedMotion();
  const titleId = useId();
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 640px)");
    const sync = () => setDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  if (!mounted) return null;
  const offscreen = reduce ? { opacity: 0 } : desktop ? { opacity: 0, x: 48 } : { opacity: 0, y: 32 };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div key="dash-drawer" className="fixed inset-0 z-[90]">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.2 } }}
            transition={{ duration: 0.2 }}
            onClick={busy ? undefined : onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={reduce ? false : offscreen}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ ...offscreen, transition: { duration: reduce ? 0 : 0.35, ease: DASH_EASE } }}
            transition={{ duration: 0.35, ease: DASH_EASE }}
            className="kd-dash-portal absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl border border-dash-line bg-dash-surface font-dash text-dash-ink shadow-dash-lift focus:outline-none sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-full sm:max-w-2xl sm:rounded-none sm:rounded-l-3xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-dash-line px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 id={titleId} className="text-lg font-semibold tracking-[-0.02em] text-dash-ink [overflow-wrap:anywhere]">
                  {title}
                </h2>
                {subtitle ? (
                  <div className="mt-0.5 text-sm text-dash-muted [overflow-wrap:anywhere]">{subtitle}</div>
                ) : null}
              </div>
              <button type="button" onClick={onClose} disabled={busy} aria-label="Cerrar" className={closeButtonClass}>
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer ? (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-dash-line px-5 py-3.5 sm:px-6">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
