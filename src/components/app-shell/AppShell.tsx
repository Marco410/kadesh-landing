"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { cn } from "kadesh/utils/cn";
import AppSidebar, { type AppNavGroup } from "./AppSidebar";
import AppTopBar, { type AppCrumb } from "./AppTopBar";
import { DashPortalContext } from "./DashPortalContext";
import { useSidebarCollapsed } from "./useSidebarCollapsed";

/**
 * Shell del panel con sesión (Mi cuenta en Kadesh Pet): menú lateral agrupado, barra superior
 * flotante y contenido a todo el ancho, sobre los tokens `dash-*`. Copia adaptada del shell de
 * kadesh-business (ver README).
 *
 * - Escritorio (`lg`): grid con el menú fijo a la izquierda.
 * - Móvil: el menú es un cajón. Se cierra con Escape, el ✕, el velo o al elegir una sección;
 *   mientras está abierto el resto queda inerte y sin scroll, y al cerrar el foco regresa al botón.
 * - `MotionConfig reducedMotion="user"`: respeta "reducir movimiento" del sistema.
 * - `DashPortalContext`: los modales y menús en portal (fuera de `.kd-dash`) lo leen para
 *   ponerse `font-dash`; en el sitio público valen `false` y no cambian.
 */
export default function AppShell({
  brandTitle,
  brandSubtitle,
  groups,
  crumbs,
  actions,
  notifications,
  collapsibleStorageKey,
  children,
}: {
  brandTitle: string;
  brandSubtitle: string;
  groups: AppNavGroup[];
  crumbs: AppCrumb[];
  actions?: ReactNode;
  /** Campana de la barra (el producto la arma con su contador). */
  notifications?: ReactNode;
  /** Con una llave, el menú se puede colapsar a solo iconos en escritorio y se recuerda. */
  collapsibleStorageKey?: string;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useSidebarCollapsed(collapsibleStorageKey);
  const wasOpen = useRef(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) {
      // Al cerrar, el foco vuelve al botón que abrió el menú.
      if (wasOpen.current) {
        document.querySelector<HTMLButtonElement>('[aria-controls="app-sidebar"]')?.focus();
      }
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Lo flotante que vive fuera del shell (ayuda por WhatsApp) también queda inerte.
    const outside = Array.from(document.querySelectorAll<HTMLElement>("[data-dash-outside]"));
    outside.forEach((element) => element.setAttribute("inert", ""));
    document.addEventListener("keydown", onKey);
    // El foco va a la sección actual (y la deja a la vista si el menú tiene scroll).
    (
      document.querySelector<HTMLElement>('#app-sidebar [aria-current="page"]') ??
      document.querySelector<HTMLElement>("#app-sidebar a, #app-sidebar button")
    )?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      outside.forEach((element) => element.removeAttribute("inert"));
    };
  }, [menuOpen]);

  return (
    <MotionConfig reducedMotion="user">
      <DashPortalContext.Provider value={true}>
        <div
          className={cn(
            "kd-dash font-dash min-h-dvh lg:grid lg:transition-[grid-template-columns] lg:duration-300",
            collapsed ? "lg:grid-cols-[84px_minmax(0,1fr)]" : "lg:grid-cols-[272px_minmax(0,1fr)]",
          )}
        >
          <a
            href="#app-content"
            className="fixed left-3 top-3 z-[70] -translate-y-[160%] rounded-full bg-dash-ink px-4 py-2 text-sm font-semibold text-dash-on-ink transition-transform focus:translate-y-0"
          >
            Saltar al contenido
          </a>

          <AppSidebar
            brandTitle={brandTitle}
            brandSubtitle={brandSubtitle}
            groups={groups}
            open={menuOpen}
            onClose={closeMenu}
            layoutGroupId="app-nav"
            collapsed={collapsed}
            onToggleCollapsed={collapsibleStorageKey ? () => setCollapsed(!collapsed) : undefined}
          />

          <div
            aria-hidden
            onClick={closeMenu}
            className={cn(
              // z-45: por encima de la barra (z-40) y de lo flotante del sitio (WhatsApp, z-40); debajo del cajón (z-50).
                "fixed inset-0 z-[45] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
              menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          />

          <div className="min-w-0" inert={menuOpen || undefined}>
            <AppTopBar
              crumbs={crumbs}
              actions={actions}
              menuOpen={menuOpen}
              onOpenMenu={() => setMenuOpen(true)}
              notifications={notifications}
            />
            <main
              id="app-content"
              tabIndex={-1}
              className="w-full px-4 pb-16 pt-5 focus:outline-none sm:px-6 lg:pb-20 lg:pl-2 lg:pr-6 lg:pt-7"
            >
              {children}
            </main>
          </div>
        </div>
      </DashPortalContext.Provider>
    </MotionConfig>
  );
}
