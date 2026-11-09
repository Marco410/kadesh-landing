"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowLeft01Icon, CharityIcon, WhatsappIcon } from "@hugeicons/core-free-icons";
import {
  AppPageHeader,
  DashAvatar,
  DashEmptyState,
  DashErrorState,
  DashStatusBadge,
  Reveal,
  dashButtonClass,
  dashSurfaceClass,
} from "kadesh/components/app-shell";
import { PROFILE_VIEWS, profileGroupTitle } from "kadesh/components/profile/shell/profileNav";
import { useProfileDetailCrumb } from "kadesh/components/profile/shell/ProfileShell";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import {
  RESCUE_ORG_STATUS,
  isRescueViewKey,
  rescueRoleLabel,
  rescueStatusBadge,
  rescueTypeLabel,
  type RescueViewKey,
} from "./constants";
import { MY_RESCUE_ORGS_QUERY, type MyRescueOrgsResponse } from "./queries";
import RescueManagePanel from "./RescueManagePanel";
import { rescueVerificationWhatsAppUrl } from "./rescueWhatsApp";
import type { RescueOrganization } from "./types";

function RescueHeader({ actions }: { actions?: ReactNode }) {
  return (
    <AppPageHeader
      eyebrow={profileGroupTitle("rescate")}
      title={PROFILE_VIEWS.rescate.label}
      description={PROFILE_VIEWS.rescate.description}
      actions={actions}
    />
  );
}

function placeOf(org: Pick<RescueOrganization, "city" | "state">): string {
  return [org.city, org.state].filter(Boolean).join(", ");
}

/**
 * `/perfil?tab=rescate`: los espacios de rescate de la persona. Sin espacio, invita a activarlo.
 * Con `&org=<id>` abre su administración (resumen, animales, equipo y perfil público). Si la
 * persona solo tiene uno, la lista igual se muestra: así ve su estado y puede activar otro.
 */
export default function RescueSection({ userId }: { userId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get("org");
  const vista = searchParams.get("vista");
  const { data, loading, error, refetch } = useQuery<MyRescueOrgsResponse>(MY_RESCUE_ORGS_QUERY, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });

  const orgs = data?.rescueOrganizations ?? [];
  const selected = orgId ? orgs.find((org) => org.id === orgId) ?? null : null;
  useProfileDetailCrumb(selected?.name);

  if (selected) {
    const view: RescueViewKey = isRescueViewKey(vista) ? vista : "resumen";
    const verified = selected.status === RESCUE_ORG_STATUS.VERIFIED;
    return (
      <div>
        <AppPageHeader
          eyebrow={
            <Link
              href={Routes.profileRescue()}
              className="inline-flex items-center gap-1 rounded transition-colors hover:text-dash-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} aria-hidden />
              {PROFILE_VIEWS.rescate.label}
            </Link>
          }
          title={selected.name}
          description={[rescueTypeLabel(selected.type), placeOf(selected)].filter(Boolean).join(" · ")}
          actions={
            verified && selected.slug ? (
              <Link
                href={Routes.organizations.detail(selected.slug)}
                className={dashButtonClass({ variant: "outline", size: "sm" })}
              >
                Ver perfil público
              </Link>
            ) : null
          }
        />
        <RescueManagePanel
          org={selected}
          view={view}
          onViewChange={(next) => router.replace(Routes.profileRescue(selected.id, next), { scroll: false })}
          onChanged={() => refetch()}
        />
      </div>
    );
  }

  const activateLink = (
    <Link href={Routes.rescueActivate} className={dashButtonClass({ variant: "primary", size: "sm" })}>
      <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} aria-hidden />
      Activar espacio
    </Link>
  );

  if (loading && orgs.length === 0) {
    return (
      <div className="space-y-2">
        <RescueHeader />
        {[1, 2].map((item) => (
          <div key={item} className="h-28 dash-shimmer rounded-3xl" />
        ))}
      </div>
    );
  }

  if (error && orgs.length === 0) {
    return (
      <div>
        <RescueHeader />
        <DashErrorState
          message="No pudimos cargar tus espacios de rescate."
          action={
            <button type="button" onClick={() => refetch()} className={dashButtonClass({ variant: "outline", size: "sm" })}>
              Reintentar
            </button>
          }
        />
      </div>
    );
  }

  if (orgs.length === 0) {
    return (
      <div>
        <RescueHeader />
        <DashEmptyState
          icon={CharityIcon}
          title="¿Rescatas animales? Activa tu espacio"
          description="Para rescatistas, refugios, hogares temporales y colectivos. Publica tus animales a nombre de tu organización, trabaja en equipo y ten un perfil público con tus adopciones y cómo ayudarte. Es gratis."
          action={activateLink}
        />
      </div>
    );
  }

  // Si se pidió un `org` que no es de la persona, se muestra la lista (sin romper el enlace).
  return (
    <div>
      <RescueHeader actions={activateLink} />
      <ul className="space-y-3">
        {orgs.map((org, index) => {
          const badge = rescueStatusBadge(org.status);
          const pending = org.status === RESCUE_ORG_STATUS.PENDING;
          return (
            <Reveal as="li" key={org.id} index={index} className={cn(dashSurfaceClass, "p-4 md:p-5")}>
              <div className="flex items-start gap-3">
                <DashAvatar name={org.name} imageUrl={org.logo?.url} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-dash-ink">{org.name}</p>
                    <DashStatusBadge label={badge.label} tone={badge.tone} />
                    {org.isAlly ? <DashStatusBadge label="Aliado KADESH" tone="accent" /> : null}
                  </div>
                  <p className="mt-0.5 text-sm text-dash-muted">
                    {[rescueTypeLabel(org.type), placeOf(org), `Tu rol: ${rescueRoleLabel(org.viewerRole)}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {pending ? (
                    <p className="mt-2 text-sm text-dash-soft">
                      Ya puedes usar tu espacio. Para que tu perfil sea público, escríbenos por WhatsApp y lo
                      verificamos.
                    </p>
                  ) : null}
                  {org.status === RESCUE_ORG_STATUS.REJECTED || org.status === RESCUE_ORG_STATUS.SUSPENDED ? (
                    <p className="mt-2 text-sm text-dash-soft">
                      {org.statusNote?.trim() || "Escríbenos por WhatsApp para revisar tu caso."}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={Routes.profileRescue(org.id)} className={dashButtonClass({ variant: "dark", size: "sm" })}>
                      Administrar
                    </Link>
                    {pending ? (
                      <a
                        href={rescueVerificationWhatsAppUrl(org)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={dashButtonClass({ variant: "outline", size: "sm" })}
                      >
                        <HugeiconsIcon icon={WhatsappIcon} size={16} strokeWidth={1.6} aria-hidden />
                        Verificar por WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </ul>
    </div>
  );
}
