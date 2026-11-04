"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowRight01Icon,
  Bone01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  HospitalLocationIcon,
  Megaphone01Icon,
  Notification03Icon,
  RadarIcon,
} from "@hugeicons/core-free-icons";
import {
  AnimatedNumber,
  ColumnBars,
  DashButton,
  DashErrorState,
  DashSectionCard,
  DashStatTile,
  Reveal,
  dashButtonClass,
  dashSurfaceClass,
  greetingFor,
} from "kadesh/components/app-shell";
// Directo (no el barrel): el barrel de notificaciones exporta NotificationsShell.
import { useUnreadNotifications } from "kadesh/components/notifications/hooks";
import { Bone, SkeletonRegion } from "kadesh/components/ui/skeleton";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import type { User } from "kadesh/utils/types";
import { appointmentWhen, pendingCount, type AttentionItem, type AttentionSeverity } from "./homeModel";
import { useProfileHome, type ProfileHomeModel } from "./useProfileHome";

/** Filas visibles de "Requiere atención" antes de "Ver N más". */
const ATTENTION_PREVIEW = 5;

const plural = (n: number, one: string, many: string) => `${n.toLocaleString("es-MX")} ${n === 1 ? one : many}`;

function joinEs(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`;
}

/**
 * Inicio del perfil: saludo con el resumen en una frase, "Requiere atención" y KPIs (oscuro =
 * mascotas, tintado = próximas citas). Con una clínica verificada suma la fila "Mi veterinaria".
 * Las reglas viven en `homeModel.ts`.
 */
export default function ProfileHome({ user }: { user: User }) {
  const unread = useUnreadNotifications({ skip: !user.id });
  const { loading, hasData, error, refetch, model } = useProfileHome({
    userId: user.id,
    hasPhone: Boolean(user.phone?.trim()),
    unread,
  });

  if (error && !hasData) {
    return (
      <DashErrorState
        message="No pudimos cargar tu resumen. Revisa tu conexión e intenta de nuevo."
        action={
          <DashButton variant="outline" size="sm" onClick={refetch}>
            Reintentar
          </DashButton>
        }
      />
    );
  }
  if (loading) return <HomeSkeleton />;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <GreetingCard firstName={user.name?.trim() || "hola"} model={model} />
        <AttentionCard items={model.attention} />
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Reveal index={2} className="h-full">
          <DashStatTile
            variant="dark"
            label="Mascotas"
            icon={Bone01Icon}
            value={model.petsCount}
            href={Routes.profileTab("pets")}
            hint={
              model.remindersCount
                ? plural(model.remindersCount, "recordatorio por atender", "recordatorios por atender")
                : model.petsCount
                  ? "Sin recordatorios esta semana"
                  : "Registra a la primera"
            }
          />
        </Reveal>
        <Reveal index={3} className="h-full">
          <DashStatTile
            variant="tint"
            label="Próximas citas"
            icon={Calendar03Icon}
            value={model.upcomingCount}
            href={Routes.profileTab("appointments")}
            hint={
              model.nextAppointment
                ? `La próxima ${appointmentWhen(model.nextAppointment.startsAt, model.now)}`
                : "Sin citas por ahora"
            }
          />
        </Reveal>
        <Reveal index={4} className="h-full">
          <DashStatTile
            label="Reportes activos"
            icon={Megaphone01Icon}
            value={model.reportsActive}
            href={Routes.profileTab("animals")}
            hint={model.reportsTotal ? `De ${plural(model.reportsTotal, "publicado", "publicados")}` : "Aún no publicas reportes"}
          />
        </Reveal>
        <Reveal index={5} className="h-full">
          <DashStatTile
            label="Sin leer"
            icon={Notification03Icon}
            value={model.unread}
            href={Routes.notifications.index}
            delta={model.notificationDelta}
            hint={plural(model.notificationsThisWeek, "recibida en 7 días", "recibidas en 7 días")}
            sparkline={model.notificationSeries.some((value) => value > 0) ? model.notificationSeries : null}
          />
        </Reveal>
      </div>

      {model.clinic ? <ClinicRow model={model} /> : null}
    </div>
  );
}

function GreetingCard({ firstName, model }: { firstName: string; model: ProfileHomeModel }) {
  const parts: string[] = [];
  if (model.petsCount) parts.push(plural(model.petsCount, "mascota", "mascotas"));
  if (model.upcomingCount) parts.push(plural(model.upcomingCount, "cita próxima", "citas próximas"));
  if (model.reportsActive) parts.push(plural(model.reportsActive, "reporte activo", "reportes activos"));
  const pending = pendingCount(model.attention);
  const shortcuts = [
    {
      id: "pets",
      href: Routes.profileTab("pets"),
      icon: model.petsCount ? Bone01Icon : Add01Icon,
      label: model.petsCount ? "Mis mascotas" : "Registrar mascota",
      detail: "Cartilla y recordatorios",
    },
    {
      id: "vets",
      href: Routes.veterinaries.index,
      icon: HospitalLocationIcon,
      label: "Buscar veterinaria",
      detail: "Y agendar una cita",
    },
    {
      id: "alerts",
      href: Routes.notifications.alerts,
      icon: RadarIcon,
      label: "Alertas de zona",
      detail: model.alertsEnabled ? "Activas" : "Apagadas",
    },
    {
      id: "report",
      href: Routes.animals.new,
      icon: Megaphone01Icon,
      label: "Reportar animal",
      detail: "Perdido o encontrado",
    },
  ];

  return (
    <Reveal as="section" index={0} className={cn(dashSurfaceClass, "dash-glow flex flex-col p-6 xl:p-8")}>
      <h2 className="text-[clamp(1.6rem,1.2rem+1.6vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.04em] text-dash-ink [overflow-wrap:anywhere]">
        {greetingFor(model.now)}, {firstName}.
      </h2>
      <p className="mt-3 max-w-[58ch] text-[17px] leading-relaxed text-dash-soft">
        {parts.length ? `Tienes ${joinEs(parts)}. ` : "Aquí verás a tus mascotas, tus citas y tus reportes. "}
        {pending ? (
          <strong className="font-semibold text-red-700 dark:text-red-400">
            {pending === 1 ? "1 cosa necesita atención." : `${pending} cosas necesitan atención.`}
          </strong>
        ) : (
          <strong className="font-semibold text-green-700 dark:text-green-300">Todo en orden.</strong>
        )}
      </p>
      <nav aria-label="Atajos" className="mt-6 xl:mt-auto xl:pt-8">
        <p className="mb-2 text-[13px] font-semibold text-dash-muted">Atajos</p>
        <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {shortcuts.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex h-full flex-col gap-2.5 rounded-[18px] bg-dash-surface-2 p-3.5 transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-0.5 hover:shadow-dash focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-dash-surface text-kadesh-600 shadow-[0_1px_2px_rgba(20,20,20,0.06)] dark:text-kadesh-300">
                  <HugeiconsIcon icon={item.icon} size={18} aria-hidden />
                </span>
                <span className="min-w-0 leading-tight">
                  <strong className="block text-sm font-semibold text-dash-ink">{item.label}</strong>
                  <span className="mt-0.5 block text-[12.5px] text-dash-muted">{item.detail}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Reveal>
  );
}

const SEVERITY_ICON: Record<AttentionSeverity, string> = {
  danger: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  info: "bg-kadesh-50 text-kadesh-700 dark:bg-kadesh-500/15 dark:text-kadesh-300",
  tip: "bg-dash-surface text-dash-muted",
};

const SEVERITY_LABEL: Record<AttentionSeverity, string> = {
  danger: "Urgente",
  warning: "Pronto",
  info: "Aviso",
  tip: "Sugerencia",
};

function AttentionCard({ items }: { items: AttentionItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, ATTENTION_PREVIEW);
  const hidden = items.length - visible.length;

  return (
    <DashSectionCard index={1} title="Requiere atención">
      {items.length === 0 ? (
        <div className="flex items-start gap-3 rounded-[18px] bg-dash-surface-2 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} aria-hidden />
          </span>
          <span className="min-w-0">
            <strong className="block text-sm font-semibold text-dash-ink">Todo en orden</strong>
            <span className="mt-0.5 block text-[13px] leading-snug text-dash-muted">
              Cuando algo necesite tu atención (un recordatorio, una cita) aparece aquí.
            </span>
          </span>
        </div>
      ) : (
        <>
          <ul className="space-y-1.5">
            {visible.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-3 rounded-[14px] bg-dash-surface-2 p-3 transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400"
                >
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", SEVERITY_ICON[item.severity])}>
                    <HugeiconsIcon icon={item.icon} size={18} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="sr-only">{SEVERITY_LABEL[item.severity]}: </span>
                    <strong className="block text-sm font-semibold leading-snug text-dash-ink [overflow-wrap:anywhere]">
                      {item.title}
                    </strong>
                    {item.detail ? (
                      <span className="mt-0.5 block text-[13px] leading-snug text-dash-muted">{item.detail}</span>
                    ) : null}
                  </span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={16}
                    className="mt-2.5 shrink-0 text-dash-muted transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
          {hidden > 0 || expanded ? (
            <div className="mt-2">
              <DashButton variant="ghost" size="sm" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
                {expanded ? "Ver menos" : `Ver ${hidden} más`}
              </DashButton>
            </div>
          ) : null}
        </>
      )}
    </DashSectionCard>
  );
}

function ClinicRow({ model }: { model: ProfileHomeModel }) {
  const clinic = model.clinic;
  if (!clinic) return null;
  const places = model.manageablePlaces;
  const single = places.length === 1 ? places[0] : null;
  const cells = [
    { id: "today", label: "Citas de hoy", value: clinic.today, warn: false },
    { id: "pending", label: "Por confirmar", value: clinic.pending, warn: clinic.pending > 0 },
    { id: "patients", label: "Pacientes", value: clinic.patients, warn: false },
  ];

  return (
    <DashSectionCard
      index={6}
      title={places.length > 1 ? "Mis veterinarias" : "Mi veterinaria"}
      description={places.map((place) => place.name).join(" · ")}
      action={
        <Link
          href={single ? Routes.profileClinic(single.id) : Routes.profileTab("clinics")}
          className={dashButtonClass({ variant: "outline", size: "sm" })}
        >
          Administrar
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
          {cells.map((cell) => (
            <div key={cell.id} className="rounded-[18px] bg-dash-surface-2 p-3 sm:p-4">
              <span className="flex items-center gap-1.5 text-[13px] font-medium leading-tight text-dash-muted">
                {cell.warn ? <span className="size-2 shrink-0 rounded-full bg-amber-500" aria-hidden /> : null}
                {cell.label}
              </span>
              <span
                className={cn(
                  "mt-1.5 block text-[1.5rem] font-bold leading-none tracking-[-0.045em] tabular-nums sm:text-[1.75rem]",
                  cell.warn ? "text-amber-700 dark:text-amber-400" : "text-dash-ink",
                )}
              >
                {clinic.loading ? "—" : <AnimatedNumber value={cell.value} />}
              </span>
            </div>
          ))}
        </div>
        <div className="min-w-0">
          <p className="mb-3 text-[13px] font-semibold text-dash-soft">Citas por semana</p>
          <ColumnBars
            points={clinic.weeks}
            ariaLabel="Citas por semana en tus clínicas, últimas 8 semanas"
            unitLabel="citas"
            heightClass="h-44"
          />
        </div>
      </div>
    </DashSectionCard>
  );
}

function HomeSkeleton() {
  return (
    <SkeletonRegion label="Cargando tu resumen" className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Bone kind="box" height={236} radius={24} />
        <Bone kind="box" height={236} radius={24} />
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Bone kind="box" height={148} radius={24} />
        <Bone kind="box" height={148} radius={24} />
        <Bone kind="box" height={148} radius={24} />
        <Bone kind="box" height={148} radius={24} />
      </div>
    </SkeletonRegion>
  );
}
