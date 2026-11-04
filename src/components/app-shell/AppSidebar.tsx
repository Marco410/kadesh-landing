"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Cancel01Icon,
  Globe02Icon,
  Logout01Icon,
  SidebarLeft01Icon,
  SidebarRight01Icon,
} from "@hugeicons/core-free-icons";
import FontSizeSlider from "kadesh/components/layout/FontSizeSlider";
import ThemeToggle from "kadesh/components/layout/ThemeToggle";
import Logo from "kadesh/components/shared/Logo";
import { useLogout } from "kadesh/components/auth/hooks";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import { useUser } from "kadesh/utils/UserContext";
import { indicatorTransition } from "./motion";
import { DashAvatar } from "./DashAvatar";

const THEME_BUTTON =
  "flex size-10 items-center justify-center rounded-full bg-dash-surface text-dash-soft transition-colors hover:text-dash-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400";

export type AppNavItem = {
  id: string;
  label: string;
  icon: IconSvgElement;
  href: string;
  active?: boolean;
  /** Globo con un contador (pendientes). 0 / null no se muestra. */
  badge?: number | null;
  /** Texto del globo para lectores de pantalla ("3 sin leer"). Sin esto se lee solo el número. */
  badgeLabel?: string;
  /** Sale del panel al sitio público: lleva ↗ y nunca queda activo. */
  external?: boolean;
};

export type AppNavGroup = {
  id: string;
  title: string;
  items: AppNavItem[];
};

/**
 * Menú lateral del panel. En escritorio vive sobre el fondo (sin tarjeta propia) y solo la
 * opción activa es una píldora blanca que se desliza al cambiar; colapsado deja solo iconos. En
 * móvil es un cajón que abre la barra superior (siempre completo).
 */
export default function AppSidebar({
  brandTitle,
  brandSubtitle,
  groups,
  open,
  onClose,
  layoutGroupId,
  collapsed = false,
  onToggleCollapsed,
}: {
  brandTitle: string;
  brandSubtitle: string;
  groups: AppNavGroup[];
  open: boolean;
  onClose: () => void;
  /** Separa la animación de la píldora si hubiera dos menús en pantalla. */
  layoutGroupId: string;
  collapsed?: boolean;
  /** Sin esto no hay botón para colapsar. */
  onToggleCollapsed?: () => void;
}) {
  const { user } = useUser();
  const logout = useLogout();
  const fullName = [user?.name, user?.lastName].filter(Boolean).join(" ").trim();
  /** Clases que solo aplican en escritorio con el menú colapsado. */
  const slim = (classes: string) => (collapsed ? classes : null);

  return (
    <aside
      id="app-sidebar"
      aria-label="Menú de tu cuenta"
      data-open={open}
      data-collapsed={collapsed}
      className={cn(
        // Móvil: cajón fijo fuera de pantalla; `visibility` espera a que termine de salir.
        "fixed inset-y-0 left-0 z-50 flex w-[min(86vw,312px)] -translate-x-[105%] flex-col bg-dash-surface px-3 pb-4 pt-4 shadow-dash-lift",
        "invisible transition-[transform,visibility] duration-[350ms] ease-[cubic-bezier(0.16,0.84,0.44,1)]",
        // Al abrir, `visibility` cambia de golpe (si se animara, el primer cuadro sigue oculto y el
        // foco no puede entrar); al cerrar sí espera a que termine de salir.
        "data-[open=true]:visible data-[open=true]:translate-x-0 data-[open=true]:[transition-property:transform]",
        // Escritorio: columna fija del grid, sobre el fondo.
        "lg:visible lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:w-auto lg:translate-x-0 lg:bg-transparent lg:pl-4 lg:pr-3.5 lg:pt-5 lg:shadow-none",
        slim("lg:px-3"),
      )}
    >
      <div className={cn("flex items-center gap-3 px-1.5", slim("lg:justify-center lg:px-0"))}>
        {/* La K es blanca y ocupa todo su lienzo: va sobre el degradado de marca, con aire alrededor. */}
        <Link
          href={Routes.profile}
          onClick={onClose}
          aria-label={`${brandTitle}: inicio de tu cuenta`}
          className="dash-grad-accent flex size-10 shrink-0 items-center justify-center rounded-[13px] shadow-dash-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dash-canvas"
        >
          <Logo size={20} className="rounded-none" />
        </Link>
        <span className={cn("min-w-0 flex-1 leading-tight", slim("lg:hidden"))}>
          <strong className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-dash-ink">
            {brandTitle}
          </strong>
          <span className="block truncate text-[13px] text-dash-muted">{brandSubtitle}</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="flex size-11 items-center justify-center rounded-full text-dash-soft transition-colors hover:bg-dash-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400 lg:hidden"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={20} />
        </button>
      </div>

      {onToggleCollapsed ? (
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          aria-controls="app-sidebar-nav"
          title={collapsed ? "Mostrar menú" : "Ocultar menú"}
          className={cn(
            "mt-4 hidden h-9 items-center gap-2 rounded-full px-3 text-[13px] font-medium text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400 lg:inline-flex",
            collapsed ? "lg:mx-auto lg:w-11 lg:justify-center lg:px-0" : "self-start",
          )}
        >
          <HugeiconsIcon icon={collapsed ? SidebarRight01Icon : SidebarLeft01Icon} size={18} />
          <span className={cn(collapsed && "sr-only")}>{collapsed ? "Mostrar menú" : "Ocultar menú"}</span>
        </button>
      ) : null}

      <nav
        id="app-sidebar-nav"
        aria-label="Secciones"
        className={cn("-mx-1 mt-5 flex-1 overflow-y-auto px-1 [scrollbar-width:thin]", onToggleCollapsed && "lg:mt-3")}
      >
        {groups.map((group, groupIndex) => (
          <div key={group.id} className="mb-4 last:mb-0">
            {/* `muted` y no `faint`: es texto y debe pasar AA (4.5:1) sobre el fondo. */}
            <p
              className={cn(
                "px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-dash-muted",
                slim("lg:sr-only"),
              )}
            >
              {group.title}
            </p>
            {collapsed && groupIndex > 0 ? (
              <span aria-hidden className="mx-auto mb-2 hidden h-px w-6 bg-dash-line-strong lg:block" />
            ) : null}
            <ul className="mt-1.5 space-y-0.5">
              {group.items.map((item) => {
                const active = item.active && !item.external;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex h-11 items-center gap-3 rounded-[14px] px-3 text-[15px] transition-colors duration-200 lg:h-10",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400",
                        slim("lg:size-11 lg:justify-center lg:px-0 lg:mx-auto"),
                        active
                          ? "font-semibold text-dash-ink"
                          : "font-medium text-dash-soft hover:bg-dash-hover hover:text-dash-ink",
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId={`${layoutGroupId}-active`}
                          transition={indicatorTransition}
                          className="absolute inset-0 rounded-[14px] bg-dash-surface-2 shadow-[0_1px_2px_rgba(20,20,20,0.06),0_6px_16px_-10px_rgba(20,20,20,0.25)] lg:bg-dash-surface"
                          aria-hidden
                        />
                      ) : null}
                      <span
                        className={cn(
                          "relative flex shrink-0",
                          active
                            ? "text-kadesh-600 dark:text-kadesh-300"
                            : "text-dash-muted transition-colors group-hover:text-dash-soft",
                        )}
                      >
                        <HugeiconsIcon icon={item.icon} size={20} strokeWidth={1.8} />
                      </span>
                      <span className={cn("relative flex min-w-0 flex-1 items-center gap-2", slim("lg:sr-only"))}>
                        <span className="truncate">{item.label}</span>
                        {item.external ? (
                          <>
                            <HugeiconsIcon
                              icon={ArrowUpRight01Icon}
                              size={14}
                              className="shrink-0 text-dash-muted"
                              aria-hidden
                            />
                            <span className="sr-only">(sitio público)</span>
                          </>
                        ) : null}
                      </span>
                      {item.badge ? (
                        <span
                          className={cn(
                            "relative flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold tabular-nums text-white",
                            slim("lg:absolute lg:-right-0.5 lg:-top-0.5 lg:h-4 lg:min-w-4 lg:px-1 lg:text-[10px]"),
                          )}
                        >
                          <span aria-hidden>{item.badge > 99 ? "99+" : item.badge}</span>
                          <span className="sr-only">{item.badgeLabel ?? String(item.badge)}</span>
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "mt-3 rounded-3xl border border-dash-line bg-dash-surface p-2.5 shadow-dash",
          slim("lg:flex lg:flex-col lg:items-center lg:gap-2 lg:rounded-[22px] lg:p-1.5"),
        )}
      >
        <div className={cn("flex items-center gap-2.5 px-0.5", slim("lg:px-0"))}>
          <DashAvatar name={fullName || user?.email || "Kadesh"} imageUrl={user?.profileImage?.url} size="md" />
          <span className={cn("min-w-0 flex-1 leading-tight", slim("lg:hidden"))}>
            <strong className="block truncate text-sm font-semibold text-dash-ink">{fullName || "Mi cuenta"}</strong>
            <span className="block truncate text-xs text-dash-muted">{user?.email}</span>
          </span>
        </div>
        {/* En teléfono la barra no tiene espacio para tema y tamaño de texto: van aquí. */}
        <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl bg-dash-surface-2 py-1 pl-3 pr-1 sm:hidden">
          <span className="text-[13px] font-medium text-dash-soft">Tema y texto</span>
          <span className="flex items-center gap-1">
            <FontSizeSlider tone="panel" />
            <ThemeToggle className={THEME_BUTTON} />
          </span>
        </div>
        <div className={cn("mt-2 grid grid-cols-2 gap-1.5", slim("lg:mt-0 lg:grid-cols-1"))}>
          <Link
            href={Routes.home}
            title="Ir al sitio"
            className={cn(
              "inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-dash-line-strong text-[13px] font-semibold text-dash-ink transition-colors hover:border-kadesh-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400",
              slim("lg:size-10 lg:border-transparent lg:hover:bg-dash-hover"),
            )}
          >
            <HugeiconsIcon icon={Globe02Icon} size={16} />
            <span className={cn(slim("lg:sr-only"))}>Ir al sitio</span>
          </Link>
          <button
            type="button"
            onClick={logout}
            title="Cerrar sesión"
            className={cn(
              "inline-flex h-10 items-center justify-center gap-1.5 rounded-full text-[13px] font-medium text-dash-soft transition-colors hover:bg-dash-hover hover:text-dash-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400",
              slim("lg:size-10"),
            )}
          >
            <HugeiconsIcon icon={Logout01Icon} size={16} />
            <span className={cn(slim("lg:sr-only"))}>Salir</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
