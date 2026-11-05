"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  FavouriteIcon,
  Home09Icon,
  Megaphone01Icon,
  UserGroupIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import {
  DashSectionCard,
  DashStatTile,
  Reveal,
  dashButtonClass,
  dashSurfaceClass,
} from "kadesh/components/app-shell";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import {
  RESCUE_ORG_STATUS,
  canEditRescueProfile,
  canManageRescueTeam,
  canPublishForRescue,
  type RescueViewKey,
} from "./constants";
import { rescueVerificationWhatsAppUrl } from "./rescueWhatsApp";
import type { RescueOrganization } from "./types";

type Task = { id: string; done: boolean; label: string; detail: string; view: RescueViewKey };

/** Lo que le falta al perfil para verse completo (solo lo ve quien puede editarlo). */
function profileTasks(org: RescueOrganization): Task[] {
  return [
    {
      id: "logo",
      done: Boolean(org.logo?.url),
      label: "Sube tu logo",
      detail: "Es lo que se ve en tus animales y, si eres aliado, en la portada.",
      view: "perfil",
    },
    {
      id: "description",
      done: Boolean(org.description?.trim()),
      label: "Cuenta quiénes son",
      detail: "Desde cuándo rescatan, dónde y cómo trabajan.",
      view: "perfil",
    },
    {
      id: "help",
      done: Boolean(org.donationUrl?.trim() || org.donationInfo?.trim() || org.needs?.trim()),
      label: "Di cómo ayudarte",
      detail: "Un link para donar, tus datos o lo que necesitas (croquetas, medicinas…).",
      view: "perfil",
    },
    {
      id: "team",
      done: (org.membersCount ?? 1) > 1,
      label: "Suma a tu equipo",
      detail: "Voluntarios y hogares temporales que te ayudan a actualizar a los animales.",
      view: "equipo",
    },
  ];
}

/**
 * Resumen del espacio: estado de verificación, cifras, acciones rápidas y lo que falta del perfil.
 */
export default function RescueSummaryView({
  org,
  onGoTo,
}: {
  org: RescueOrganization;
  onGoTo: (view: RescueViewKey) => void;
}) {
  const role = org.viewerRole;
  const pending = org.status === RESCUE_ORG_STATUS.PENDING;
  const closed = org.status === RESCUE_ORG_STATUS.REJECTED || org.status === RESCUE_ORG_STATUS.SUSPENDED;
  const canPublish = canPublishForRescue(role) && !closed;
  const tasks = canEditRescueProfile(role)
    ? profileTasks(org).filter((task) => task.view !== "equipo" || canManageRescueTeam(role))
    : [];
  const pendingTasks = tasks.filter((task) => !task.done);

  return (
    <div className="flex flex-col gap-4">
      {pending ? (
        <Reveal className={cn(dashSurfaceClass, "border-amber-300/70 p-5 dark:border-amber-500/30")}>
          <p className="font-semibold text-dash-ink">Tu espacio está en revisión</p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-dash-muted">
            Ya puedes publicar animales y armar tu equipo. Mientras lo verificamos, tus animales se muestran con
            tu nombre y tu perfil público aún no aparece. Escríbenos por WhatsApp con tus redes o fotos de tus
            rescates y lo revisamos.
          </p>
          <a
            href={rescueVerificationWhatsAppUrl(org)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(dashButtonClass({ variant: "dark", size: "sm" }), "mt-3")}
          >
            <HugeiconsIcon icon={WhatsappIcon} size={16} strokeWidth={1.6} aria-hidden />
            Verificar por WhatsApp
          </a>
        </Reveal>
      ) : null}

      {closed ? (
        <Reveal className={cn(dashSurfaceClass, "border-red-300/70 p-5 dark:border-red-500/30")}>
          <p className="font-semibold text-dash-ink">
            {org.status === RESCUE_ORG_STATUS.SUSPENDED ? "Tu espacio está suspendido" : "No pudimos verificar tu espacio"}
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-dash-muted">
            {org.statusNote?.trim() || "Escríbenos por WhatsApp para revisar tu caso."} Mientras tanto no se puede
            publicar a nombre del espacio.
          </p>
        </Reveal>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Reveal index={0}>
          <DashStatTile
            variant="dark"
            icon={Megaphone01Icon}
            label="Animales publicados"
            value={org.publishedCount ?? 0}
            onClick={() => onGoTo("animales")}
          />
        </Reveal>
        <Reveal index={1}>
          <DashStatTile
            variant="tint"
            icon={FavouriteIcon}
            label="En adopción"
            value={org.inAdoptionCount ?? 0}
            onClick={() => onGoTo("animales")}
          />
        </Reveal>
        <Reveal index={2}>
          <DashStatTile icon={Home09Icon} label="Con hogar" value={org.adoptedCount ?? 0} tone="success" />
        </Reveal>
        <Reveal index={3}>
          <DashStatTile
            icon={UserGroupIcon}
            label="Equipo"
            value={org.membersCount ?? 1}
            onClick={() => onGoTo("equipo")}
          />
        </Reveal>
      </div>

      <DashSectionCard
        index={1}
        title="Acciones rápidas"
        description="Lo que más se hace en un espacio de rescate."
      >
        <div className="flex flex-wrap gap-2">
          {canPublish ? (
            <Link href={Routes.animals.newForRescue(org.id)} className={dashButtonClass({ variant: "primary", size: "sm" })}>
              <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} aria-hidden />
              Publicar un rescate
            </Link>
          ) : null}
          {canPublish ? (
            <Link
              href={Routes.animals.newForRescue(org.id, "in_adoption")}
              className={dashButtonClass({ variant: "outline", size: "sm" })}
            >
              Dar en adopción
            </Link>
          ) : null}
          <button type="button" onClick={() => onGoTo("animales")} className={dashButtonClass({ variant: "outline", size: "sm" })}>
            Ver animales
          </button>
          {canManageRescueTeam(role) ? (
            <button type="button" onClick={() => onGoTo("equipo")} className={dashButtonClass({ variant: "outline", size: "sm" })}>
              Agregar al equipo
            </button>
          ) : null}
        </div>
      </DashSectionCard>

      {tasks.length ? (
        <DashSectionCard
          index={2}
          title={pendingTasks.length ? "Completa tu perfil" : "Tu perfil está completo"}
          description={
            pendingTasks.length
              ? "Un perfil completo da confianza a quien quiere adoptar o ayudar."
              : "Gracias. Así la gente sabe quiénes son y cómo apoyarlos."
          }
        >
          <ul className="divide-y divide-dash-line">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    task.done ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300" : "bg-dash-surface-2 text-dash-muted",
                  )}
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} strokeWidth={1.6} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-semibold", task.done ? "text-dash-muted line-through" : "text-dash-ink")}>
                    {task.label}
                    <span className="sr-only">{task.done ? " (listo)" : " (pendiente)"}</span>
                  </p>
                  {!task.done ? <p className="text-[13px] text-dash-muted">{task.detail}</p> : null}
                </div>
                {!task.done ? (
                  <button
                    type="button"
                    onClick={() => onGoTo(task.view)}
                    className={dashButtonClass({ variant: "ghost", size: "icon-sm" })}
                    aria-label={task.label}
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} aria-hidden />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </DashSectionCard>
      ) : null}
    </div>
  );
}
