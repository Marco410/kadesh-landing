"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Megaphone01Icon } from "@hugeicons/core-free-icons";
import { AppShell, type AppCrumb } from "kadesh/components/app-shell";
import { Bone, SkeletonRegion } from "kadesh/components/ui/skeleton";
// Directo (no el barrel): el barrel de notificaciones exporta NotificationsShell, que usa este shell.
import NotificationBell from "kadesh/components/notifications/NotificationBell";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import {
  PROFILE_NAV_COLLAPSED_KEY,
  PROFILE_VIEWS,
  buildProfileNavGroups,
  profileGroupTitle,
  profileViewFor,
} from "./profileNav";
import { useProfileNavCounts } from "./useProfileNavCounts";

type ShellDetail = { setDetail: (label: string | null) => void };

const ProfileShellContext = createContext<ShellDetail>({ setDetail: () => {} });

/**
 * Última miga de una vista con detalle (la mascota o la clínica abierta). La vista la declara y
 * se quita sola al cerrar el detalle o salir de la vista.
 */
export function useProfileDetailCrumb(label: string | null | undefined) {
  const { setDetail } = useContext(ProfileShellContext);
  useEffect(() => {
    setDetail(label || null);
    return () => setDetail(null);
  }, [label, setDetail]);
}

/**
 * Panel con sesión de Kadesh Pet: `/perfil` (todas sus vistas) y `/notificaciones`. Se monta una
 * vez en `app/(cuenta)/layout.tsx`, así el menú no se remonta al pasar de una ruta a otra.
 *
 * - Exige sesión: sin usuario manda a login y vuelve a la misma vista (con su query).
 * - Al cambiar de vista el foco va al `h1` de la nueva (`[data-app-title]`), no al inicio.
 */
export default function ProfileShell({ children }: { children: ReactNode }) {
  const { user, loading: sessionLoading, sessionPending } = useUser();
  // Sesión sin confirmar por red: se espera, no se pide la cuenta.
  const loading = sessionLoading || sessionPending;
  const router = useRouter();
  const pathname = usePathname() ?? Routes.profile;
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const view = profileViewFor(pathname, tab);
  const { counts, unread } = useProfileNavCounts(user?.id);
  const [detail, setDetail] = useState<string | null>(null);
  const signedIn = Boolean(user?.id);

  useEffect(() => {
    if (loading || signedIn) return;
    const query = searchParams.toString();
    const next = query ? `${pathname}?${query}` : pathname;
    router.push(`${Routes.auth.login}?redirect=${encodeURIComponent(next)}`);
  }, [loading, signedIn, pathname, searchParams, router]);

  // `vista` (las secciones de una clínica) no cuenta: es un segmentado dentro de la vista y el foco
  // debe quedarse en él.
  const viewKey = [
    pathname,
    tab,
    searchParams.get("clinic"),
    searchParams.get("pet"),
    searchParams.get("org"),
    searchParams.get("solicitud"),
  ].join("|");
  const firstView = useRef(true);
  useEffect(() => {
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("[data-app-title]")?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [viewKey]);

  const groups = useMemo(() => buildProfileNavGroups(view, counts), [view, counts]);

  const crumbs = useMemo<AppCrumb[]>(() => {
    if (!view) return [{ label: "Mi cuenta" }];
    const config = PROFILE_VIEWS[view];
    const list: AppCrumb[] = [
      { label: "Perfil", href: Routes.profile },
      { label: profileGroupTitle(view) },
      { label: config.label, href: detail ? config.href : undefined },
    ];
    if (detail) list.push({ label: detail });
    return list;
  }, [view, detail]);

  const contextValue = useMemo<ShellDetail>(() => ({ setDetail }), []);

  return (
    <ProfileShellContext.Provider value={contextValue}>
      <AppShell
        brandTitle="Kadesh Pet"
        brandSubtitle="Mi cuenta"
        groups={groups}
        crumbs={crumbs}
        collapsibleStorageKey={PROFILE_NAV_COLLAPSED_KEY}
        actions={<ReportAnimalAction />}
        notifications={
          signedIn ? (
            <>
              {/* En móvil la bandeja no cabe junto al menú de cuenta: lleva a la página. */}
              <span className="sm:hidden">
                <NotificationBell variant="link" tone="dash" count={unread} />
              </span>
              <span className="hidden sm:block">
                <NotificationBell variant="panel" tone="dash" count={unread} />
              </span>
            </>
          ) : null
        }
      >
        {signedIn ? children : <ProfileShellLoading />}
      </AppShell>
    </ProfileShellContext.Provider>
  );
}

/** Acción principal del panel: el único botón con el degradado de marca en la barra. */
function ReportAnimalAction() {
  return (
    <Link
      href={Routes.animals.new}
      className="dash-grad-accent inline-flex size-10 shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-[-0.01em] text-white shadow-dash-accent transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash-accent-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dash-canvas md:w-auto md:px-4"
    >
      <HugeiconsIcon icon={Megaphone01Icon} size={18} aria-hidden />
      <span className="sr-only md:not-sr-only">Reportar animal</span>
    </Link>
  );
}

/** Mientras se sabe si hay sesión (o se redirige a login): la forma del encabezado y una tarjeta. */
function ProfileShellLoading() {
  return (
    <SkeletonRegion label="Cargando tu cuenta" className="space-y-4">
      <Bone kind="line" width={140} height={14} />
      <Bone kind="line" width={260} height={36} />
      <Bone kind="box" height={220} radius={24} />
    </SkeletonRegion>
  );
}
