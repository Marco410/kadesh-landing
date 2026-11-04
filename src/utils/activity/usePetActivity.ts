"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { TRACK_EVENT, trackActivity } from "./track";

/** Cada cuánto se manda el latido con la pestaña visible (el back suma 5 min por latido). */
const HEARTBEAT_MS = 5 * 60 * 1000;

/** Segundos segmentos que son pantallas fijas, no un slug (`/animales/nuevo`). */
const STATIC_CHILDREN: Record<string, readonly string[]> = {
  animales: ["nuevo"],
  veterinarias: ["registro"],
  blog: ["desuscribirse"],
  notificaciones: ["alertas", "ajustes"],
  auth: ["login", "register"],
};

/**
 * Clave de la pantalla, con forma de ruta para que Operaciones la etiquete igual que `page`:
 * `/perfil` + `?tab=pets` → `/perfil?tab=pets`; `/animales/luna-cdmx` → `/animales/:id`;
 * `/animales/luna-cdmx/editar` → `/animales/:id/editar`.
 */
export function petSectionKey(pathname: string, tab: string | null): string {
  if (pathname === "/perfil" || pathname === "/perfil/") {
    return tab ? `/perfil?tab=${tab}` : "/perfil";
  }
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  const [first, second, ...rest] = segments;
  if (second === undefined) return `/${first}`;
  const statics = STATIC_CHILDREN[first] ?? [];
  const child = statics.includes(second) ? second : ":id";
  return `/${[first, child, ...rest].join("/")}`.slice(0, 200);
}

/**
 * Uso de Kadesh Pet con sesión: qué pantallas abre (`ui.section_viewed`) y cuánto tiempo está
 * (latido cada 5 min con la pestaña visible → `UserActivityDay`). Sin sesión no manda nada.
 */
export function usePetActivity(enabled: boolean) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const lastSection = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !pathname) return;
    const section = petSectionKey(pathname, tab);
    if (section === lastSection.current) return;
    lastSection.current = section;
    trackActivity(TRACK_EVENT.SECTION_VIEWED, { metadata: { section } });
  }, [enabled, pathname, tab]);

  useEffect(() => {
    if (!enabled) return;
    const beat = () => {
      if (document.visibilityState === "visible") trackActivity(TRACK_EVENT.HEARTBEAT);
    };
    beat();
    const interval = window.setInterval(beat, HEARTBEAT_MS);
    // Al volver a la pestaña: el back solo suma minutos si pasaron 4+ desde el último latido.
    document.addEventListener("visibilitychange", beat);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [enabled]);
}
