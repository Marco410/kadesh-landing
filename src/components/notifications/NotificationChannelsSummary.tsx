"use client";

import Link from 'next/link';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  Notification03Icon,
  RadarIcon,
  Settings02Icon,
  Tick02Icon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons';
import { dashButtonClass, dashSurfaceClass } from 'kadesh/components/app-shell';
import { Role } from 'kadesh/constants/constans';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { useUser } from 'kadesh/utils/UserContext';
import { WHATSAPP_CATEGORIES } from './constants';
import { useAlertSettings } from './hooks/useAlertSettings';
import { isCategoryOn, useWhatsappNotifications } from './hooks/useWhatsappNotifications';

/** Estado de los tres canales, en palabras cortas (lo comparten la columna y la franja). */
function useChannelsStatus() {
  const { user } = useUser();
  const whatsapp = useWhatsappNotifications(user?.id);
  const { settings: zone, loading: zoneLoading } = useAlertSettings(user?.id);
  const isAdmin = Boolean(user?.roles?.some((role) => role.name === Role.ADMIN));
  const categories = WHATSAPP_CATEGORIES.filter((category) => isAdmin || !('admin' in category && category.admin));
  const on = categories.filter((category) => isCategoryOn(category, whatsapp.muted)).length;
  const whatsappActive = whatsapp.enabled && Boolean(whatsapp.phoneLabel);

  return {
    loading: whatsapp.loading || zoneLoading,
    whatsapp: whatsappActive
      ? { tone: 'on' as const, text: on === categories.length ? 'Encendido, todos los avisos' : `Encendido, ${on} de ${categories.length} avisos` }
      : whatsapp.phoneLabel
        ? { tone: 'off' as const, text: 'Apagado' }
        : { tone: 'pending' as const, text: 'Falta tu teléfono' },
    zone: zone?.enabled
      ? {
          tone: 'on' as const,
          text: `A ${zone.radiusKm} km de tu zona${zone.eventsEnabled ? ', también eventos' : ''}`,
          action: 'Cambiar zona',
        }
      : zone?.center && zone.eventsEnabled
        ? { tone: 'on' as const, text: 'Solo eventos de tu zona', action: 'Cambiar zona' }
        : { tone: 'pending' as const, text: 'Te falta configurar tu zona', action: 'Configurar zona' },
  };
}

const TONE_DOT = {
  on: 'bg-green-500',
  off: 'bg-dash-faint',
  pending: 'bg-amber-500',
} as const;

function ChannelRow({
  icon,
  iconClass,
  title,
  status,
  tone,
  action,
}: {
  icon: IconSvgElement;
  iconClass: string;
  title: string;
  status: string;
  tone: keyof typeof TONE_DOT | 'always';
  action?: { href: string; label: string };
}) {
  return (
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', iconClass)}>
        <HugeiconsIcon icon={icon} size={18} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-sm font-semibold text-dash-ink">{title}</span>
        <span className="mt-1 flex items-center gap-1.5 text-[13px] text-dash-muted">
          {tone === 'always' ? (
            <HugeiconsIcon icon={Tick02Icon} size={14} className="shrink-0 text-dash-soft" aria-hidden />
          ) : (
            <span className={cn('size-2 shrink-0 rounded-full', TONE_DOT[tone])} aria-hidden />
          )}
          {status}
        </span>
        {action ? (
          <Link
            href={action.href}
            className="mt-1 inline-block text-[13px] font-semibold text-kadesh-700 underline-offset-2 hover:underline focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-kadesh-400 dark:text-kadesh-300"
          >
            {action.label}
          </Link>
        ) : null}
      </span>
    </li>
  );
}

function StripLine({ tone, label, text }: { tone: keyof typeof TONE_DOT; label: string; text: string }) {
  return (
    <span className="mt-1 flex items-center gap-1.5 text-[13px] text-dash-muted">
      <span className={cn('size-2 shrink-0 rounded-full', TONE_DOT[tone])} aria-hidden />
      <span className="min-w-0">
        {label}: {text.charAt(0).toLowerCase() + text.slice(1)}
      </span>
    </span>
  );
}

/**
 * "Cómo te avisamos": resumen de los canales (campana, WhatsApp y alertas de zona) con acceso a
 * los ajustes. La configuración vive en `/notificaciones/ajustes`; aquí solo se ve el estado.
 * - `rail`: tarjeta de la columna lateral (escritorio).
 * - `strip`: franja que lleva a los ajustes, con WhatsApp y zona en una línea cada uno (teléfono y tableta).
 */
export default function NotificationChannelsSummary({ variant }: { variant: 'rail' | 'strip' }) {
  const status = useChannelsStatus();

  if (variant === 'strip') {
    return (
      <Link
        href={Routes.notifications.settings}
        className="flex items-center gap-3 rounded-[20px] border border-dash-line bg-dash-surface px-4 py-3 shadow-dash transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-dash-surface-2 text-dash-soft">
          <HugeiconsIcon icon={Settings02Icon} size={18} aria-hidden />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-sm font-semibold text-dash-ink">Ajustes de avisos</span>
          {status.loading ? (
            <span className="mt-1 block text-[13px] text-dash-muted">Cargando…</span>
          ) : (
            <>
              <StripLine tone={status.whatsapp.tone} label="WhatsApp" text={status.whatsapp.text} />
              <StripLine tone={status.zone.tone} label="Zona" text={status.zone.text} />
            </>
          )}
        </span>
        <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="shrink-0 text-dash-muted" aria-hidden />
      </Link>
    );
  }

  return (
    <section aria-labelledby="channels-summary-title" className={cn(dashSurfaceClass, 'p-5')}>
      <h2 id="channels-summary-title" className="text-[17px] font-semibold tracking-[-0.02em] text-dash-ink">
        Cómo te avisamos
      </h2>
      <ul className="mt-4 divide-y divide-dash-line">
        <ChannelRow
          icon={Notification03Icon}
          iconClass="bg-dash-surface-2 text-dash-soft"
          title="Campana y celular"
          status="Siempre"
          tone="always"
        />
        <ChannelRow
          icon={WhatsappIcon}
          iconClass="bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300"
          title="WhatsApp"
          status={status.loading ? 'Cargando…' : status.whatsapp.text}
          tone={status.whatsapp.tone}
        />
        <ChannelRow
          icon={RadarIcon}
          iconClass="bg-dash-surface-2 text-dash-soft"
          title="Alertas de zona"
          status={status.loading ? 'Cargando…' : status.zone.text}
          tone={status.zone.tone}
          action={status.loading ? undefined : { href: Routes.notifications.alerts, label: status.zone.action }}
        />
      </ul>
      <Link
        href={Routes.notifications.settings}
        className={cn(dashButtonClass({ variant: 'outline', size: 'sm', fullWidth: true }), 'mt-5')}
      >
        <HugeiconsIcon icon={Settings02Icon} size={16} aria-hidden />
        Ajustes de avisos
      </Link>
    </section>
  );
}
