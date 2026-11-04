"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  BookOpen01Icon,
  Calendar03Icon,
  ContactIcon,
  DashboardSquare01Icon,
  Globe02Icon,
  HospitalLocationIcon,
  Location01Icon,
  Logout01Icon,
  Notification03Icon,
} from "@hugeicons/core-free-icons";
import { useLogout } from "kadesh/components/auth/hooks";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import { DashAvatar } from "./DashAvatar";
import { greetingFor } from "./greeting";
import { popTransition } from "./motion";
import { useIsClient } from "./useIsClient";

type MenuLink = { id: string; label: string; href: string; icon: IconSvgElement };

const itemClass =
  "flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-dash-ink transition-colors hover:bg-dash-surface-2 focus:outline-none focus-visible:bg-dash-surface-2";

/** Lo que daba la barra del sitio con sesión: Mi perfil, Mis citas (avatar) y la campana. */
const ACCOUNT_LINKS: MenuLink[] = [
  { id: "perfil", label: "Mi perfil", href: Routes.profile, icon: DashboardSquare01Icon },
  { id: "citas", label: "Mis citas", href: `${Routes.profile}?tab=appointments`, icon: Calendar03Icon },
  { id: "notificaciones", label: "Notificaciones", href: Routes.notifications.index, icon: Notification03Icon },
];

/** El resto de la barra del sitio: sin ella, estos enlaces se perderían dentro del panel. */
const SITE_LINKS: MenuLink[] = [
  { id: "sitio", label: "Ir al sitio", href: Routes.home, icon: Globe02Icon },
  { id: "veterinarias", label: "Veterinarias", href: Routes.veterinaries.index, icon: HospitalLocationIcon },
  { id: "animales", label: "Animales", href: Routes.animals.index, icon: Location01Icon },
  { id: "blog", label: "Blog", href: Routes.blog.index, icon: BookOpen01Icon },
  { id: "contacto", label: "Contacto", href: Routes.contact, icon: ContactIcon },
];

/**
 * Menú del avatar en la barra del panel. Reemplaza el del sitio: tu cuenta (perfil, citas,
 * notificaciones), los enlaces del sitio público y cerrar sesión.
 */
export default function UserMenu() {
  const { user } = useUser();
  const mounted = useIsClient();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const fullName = [user?.name, user?.lastName].filter(Boolean).join(" ").trim();

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const renderLinks = (links: MenuLink[]) =>
    links.map((item) => (
      <Link key={item.id} href={item.href} role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
        <HugeiconsIcon icon={item.icon} size={18} className="text-dash-muted" />
        {item.label}
      </Link>
    ));

  return (
    <div className="relative" ref={wrapper}>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menú de tu cuenta"
        className="flex cursor-pointer items-center gap-2.5 rounded-full py-0.5 pl-1 pr-0.5 transition-colors hover:bg-dash-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400 xl:pl-3"
      >
        {mounted ? (
          <span className="hidden text-right leading-tight xl:block">
            <small className="block text-xs text-dash-muted">{greetingFor(new Date())}</small>
            <strong className="block max-w-[11rem] truncate text-sm font-semibold text-dash-ink">
              {user?.name || "Kadesh"}
            </strong>
          </span>
        ) : null}
        <DashAvatar name={fullName || user?.email || "Kadesh"} imageUrl={user?.profileImage?.url} size="md" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            aria-label="Tu cuenta"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={reduce ? { duration: 0 } : popTransition}
            className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-[calc(100dvh-5rem)] w-64 origin-top-right overflow-y-auto rounded-[18px] border border-dash-line bg-dash-surface p-1.5 font-dash shadow-dash-lift"
          >
            <div className="flex items-center gap-2.5 px-2.5 pb-2.5 pt-1.5">
              <DashAvatar name={fullName || user?.email || "Kadesh"} imageUrl={user?.profileImage?.url} size="md" />
              <span className="min-w-0 leading-tight">
                <strong className="block truncate text-sm font-semibold text-dash-ink">{fullName || "Mi cuenta"}</strong>
                <span className="block truncate text-xs text-dash-muted">{user?.email}</span>
              </span>
            </div>

            <div className="border-t border-dash-line py-1">{renderLinks(ACCOUNT_LINKS)}</div>
            <div className="border-t border-dash-line py-1">{renderLinks(SITE_LINKS)}</div>

            <div className="border-t border-dash-line pt-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  void logout();
                }}
                className={itemClass}
              >
                <HugeiconsIcon icon={Logout01Icon} size={18} className="text-dash-muted" />
                Cerrar sesión
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
