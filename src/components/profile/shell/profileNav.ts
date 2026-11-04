import {
  BookOpen01Icon,
  Bone01Icon,
  Calendar03Icon,
  DashboardSquare01Icon,
  FlashIcon,
  HospitalLocationIcon,
  MapsLocation01Icon,
  Megaphone01Icon,
  Notification03Icon,
  RadarIcon,
  Stethoscope02Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import type { AppNavGroup } from "kadesh/components/app-shell";
import { Routes } from "kadesh/core/routes";

/**
 * Menú del panel con sesión (Mi cuenta). Solo es configuración: `ProfileShell` lo pinta.
 *
 * Las vistas de `/perfil` siguen en `?tab=` (los enlaces de siempre funcionan); sin `tab`, o con
 * uno desconocido (p. ej. el viejo `?tab=ventas`), abre Inicio. Notificaciones y alertas son
 * rutas propias que viven en el mismo shell.
 */

/** Claves de `?tab=` en `/perfil`. `inicio` es la vista sin `tab`. */
export const PROFILE_TAB_KEYS = ["inicio", "profile", "pets", "posts", "animals", "appointments", "clinics"] as const;
export type ProfileTabKey = (typeof PROFILE_TAB_KEYS)[number];

export function isProfileTabKey(value: string | null | undefined): value is ProfileTabKey {
  return !!value && (PROFILE_TAB_KEYS as readonly string[]).includes(value);
}

/** Vista del panel: una de `/perfil` o una ruta propia. */
export type ProfileViewKey = ProfileTabKey | "notifications" | "alerts";

type GroupId = "cuenta" | "animales" | "publicaciones" | "veterinarias" | "kadesh";

export const PROFILE_NAV_GROUPS: Record<GroupId, string> = {
  cuenta: "Mi cuenta",
  animales: "Mis animales",
  publicaciones: "Mis publicaciones",
  veterinarias: "Mis veterinarias",
  kadesh: "Kadesh",
};

type ViewConfig = {
  label: string;
  icon: IconSvgElement;
  group: GroupId;
  href: string;
  /** Texto bajo el título de la vista (`AppPageHeader`). */
  description: string;
};

export const PROFILE_VIEWS: Record<ProfileViewKey, ViewConfig> = {
  inicio: {
    label: "Inicio",
    icon: DashboardSquare01Icon,
    group: "cuenta",
    href: Routes.profile,
    description: "Lo que necesita tu atención y el resumen de tu cuenta.",
  },
  profile: {
    label: "Datos del perfil",
    icon: UserCircleIcon,
    group: "cuenta",
    href: Routes.profileTab("profile"),
    description: "Tu nombre, teléfono, fecha de nacimiento y foto.",
  },
  notifications: {
    label: "Notificaciones",
    icon: Notification03Icon,
    group: "cuenta",
    href: Routes.notifications.index,
    description: "Avisos de tus reportes, de tus citas y de animales en tu zona.",
  },
  alerts: {
    label: "Alertas de zona",
    icon: RadarIcon,
    group: "cuenta",
    href: Routes.notifications.alerts,
    description: "Elige una zona y te avisamos en la campana cuando reporten una mascota perdida o encontrada ahí.",
  },
  pets: {
    label: "Mascotas",
    icon: Bone01Icon,
    group: "animales",
    href: Routes.profileTab("pets"),
    description: "La cartilla digital de tus mascotas: salud, recordatorios y familia.",
  },
  appointments: {
    label: "Citas",
    icon: Calendar03Icon,
    group: "animales",
    href: Routes.profileTab("appointments"),
    description: "Las citas que reservaste en veterinarias.",
  },
  animals: {
    label: "Reportes",
    icon: Megaphone01Icon,
    group: "animales",
    href: Routes.profileTab("animals"),
    description: "Los animales que reportaste: perdidos, encontrados y en adopción.",
  },
  posts: {
    label: "Publicaciones",
    icon: BookOpen01Icon,
    group: "publicaciones",
    href: Routes.profileTab("posts"),
    description: "Lo que guardaste, te gustó y comentaste en el blog.",
  },
  clinics: {
    label: "Clínicas",
    icon: Stethoscope02Icon,
    group: "veterinarias",
    href: Routes.profileTab("clinics"),
    description: "Las veterinarias que reclamaste. Ya verificadas, aquí las administras.",
  },
};

const GROUP_ORDER: Array<[GroupId, ProfileViewKey[]]> = [
  ["cuenta", ["inicio", "profile", "notifications", "alerts"]],
  ["animales", ["pets", "appointments", "animals"]],
  ["publicaciones", ["posts"]],
  ["veterinarias", ["clinics"]],
];

/** Enlaces al sitio público (salen del panel). */
const KADESH_LINKS = [
  { id: "site-veterinarias", label: "Veterinarias", icon: HospitalLocationIcon, href: Routes.veterinaries.index },
  { id: "site-animales", label: "Animales", icon: MapsLocation01Icon, href: Routes.animals.index },
  { id: "site-novedades", label: "Novedades", icon: FlashIcon, href: Routes.novedades },
];

export const PROFILE_NAV_COLLAPSED_KEY = "kadesh.pet.navCollapsed";

/** Globos del menú (pendientes). `null`/0 no se muestra. */
export type ProfileNavCounts = Partial<Record<ProfileViewKey, number | null>>;

const BADGE_LABELS: Partial<Record<ProfileViewKey, (n: number) => string>> = {
  notifications: (n) => `${n} sin leer`,
  pets: (n) => `${n} ${n === 1 ? "recordatorio" : "recordatorios"} por atender`,
  appointments: (n) => `${n} ${n === 1 ? "cita próxima" : "citas próximas"}`,
  clinics: (n) => `${n} ${n === 1 ? "cita" : "citas"} por confirmar`,
};

/** Vista activa a partir de la ruta y `?tab=`. */
export function profileViewFor(pathname: string, tab: string | null): ProfileViewKey | null {
  if (pathname === Routes.notifications.alerts) return "alerts";
  if (pathname.startsWith(Routes.notifications.index)) return "notifications";
  if (pathname === Routes.profile) return isProfileTabKey(tab) ? tab : "inicio";
  return null;
}

export function buildProfileNavGroups(active: ProfileViewKey | null, counts: ProfileNavCounts): AppNavGroup[] {
  const groups: AppNavGroup[] = GROUP_ORDER.map(([groupId, keys]) => ({
    id: groupId,
    title: PROFILE_NAV_GROUPS[groupId],
    items: keys.map((key) => {
      const view = PROFILE_VIEWS[key];
      const badge = counts[key] ?? null;
      return {
        id: key,
        label: view.label,
        icon: view.icon,
        href: view.href,
        active: key === active,
        badge,
        badgeLabel: badge ? BADGE_LABELS[key]?.(badge) : undefined,
      };
    }),
  }));
  groups.push({
    id: "kadesh",
    title: PROFILE_NAV_GROUPS.kadesh,
    items: KADESH_LINKS.map((link) => ({ ...link, external: true })),
  });
  return groups;
}

export function profileGroupTitle(view: ProfileViewKey): string {
  return PROFILE_NAV_GROUPS[PROFILE_VIEWS[view].group];
}
