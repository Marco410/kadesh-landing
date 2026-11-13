"use client";

import Link from 'next/link';
import { sileo } from 'sileo';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  BubbleChatIcon,
  CheckmarkCircle02Icon,
  CreditCardIcon,
  Home01Icon,
  InjectionIcon,
  Megaphone01Icon,
  RadarIcon,
  SearchVisualIcon,
  Stethoscope02Icon,
  UserSearch01Icon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons';
import { DashSwitch, dashButtonClass, dashSurfaceClass } from 'kadesh/components/app-shell';
import { Bone } from 'kadesh/components/ui/skeleton';
import { Role } from 'kadesh/constants/constans';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { useUser } from 'kadesh/utils/UserContext';
import { WHATSAPP_CATEGORIES, type WhatsappCategory } from './constants';
import { useAlertSettings } from './hooks/useAlertSettings';
import { isCategoryOn, useWhatsappNotifications } from './hooks/useWhatsappNotifications';
import { friendlyErrorText } from 'kadesh/utils/errorText';

/** Lo que llega por WhatsApp (los avisos de Pet con plantilla en kadesh-back). */
export const WHATSAPP_NOTIFICATION_KINDS =
  'animales perdidos o encontrados cerca de ti, recordatorios de la cartilla, posibles coincidencias, comentarios y solicitudes de tus reportes';

const CATEGORY_ICON: Record<WhatsappCategory['id'], IconSvgElement> = {
  nearby: RadarIcon,
  reminders: InjectionIcon,
  matches: SearchVisualIcon,
  'follow-ups': Home01Icon,
  comments: BubbleChatIcon,
  claims: UserSearch01Icon,
  'claim-answers': CheckmarkCircle02Icon,
  'admin-animals': Megaphone01Icon,
  'admin-services': Stethoscope02Icon,
  'admin-bank': CreditCardIcon,
};

const isAdminCategory = (category: WhatsappCategory) => 'admin' in category && Boolean(category.admin);

const inlineLink =
  'font-semibold text-kadesh-700 underline-offset-2 hover:underline focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-kadesh-400 dark:text-kadesh-300';

/**
 * Avisos por WhatsApp en `/notificaciones`: el interruptor general (`User.whatsappNotifications`) y
 * uno por cada tipo de aviso (lo apagado va a `User.whatsappMutedTypes`). Se guarda al tocar.
 * - Sin teléfono válido no se puede encender: manda a Datos del perfil.
 * - Con el general apagado, la lista se ve atenuada (se entiende qué se podrá elegir).
 * - La fila de Alertas de zona dice si las alertas están activas y lleva a configurarlas.
 */
export default function WhatsappNotificationsCard() {
  const { user } = useUser();
  const { enabled, muted, phoneLabel, loading, error, saving, setEnabled, setCategory } =
    useWhatsappNotifications(user?.id);
  const { settings: zone } = useAlertSettings(user?.id);
  const canEnable = Boolean(phoneLabel);
  const active = enabled && canEnable;
  const isAdmin = Boolean(user?.roles?.some((role) => role.name === Role.ADMIN));
  const categories = WHATSAPP_CATEGORIES.filter((category) => isAdmin || !isAdminCategory(category));
  const groups = [
    { id: 'pet', title: 'Qué te llega por WhatsApp', items: categories.filter((category) => !isAdminCategory(category)) },
    { id: 'admin', title: 'Administración', items: categories.filter(isAdminCategory) },
  ].filter((group) => group.items.length > 0);
  const onCount = categories.filter((category) => isCategoryOn(category, muted)).length;

  const toggleAll = async (next: boolean) => {
    try {
      await setEnabled(next);
      sileo.success({
        title: next ? 'Avisos por WhatsApp activados' : 'Avisos por WhatsApp desactivados',
        description: next ? `Te escribiremos al ${phoneLabel}.` : 'Seguirás viéndolos aquí, en la campana.',
      });
    } catch (err) {
      sileo.error({
        title: 'No pudimos guardar',
        description: friendlyErrorText(err, 'Intenta de nuevo en un momento.'),
      });
    }
  };

  // Un aviso por tipo: sin toast al guardar (serían muchos); solo si falla.
  const toggleCategory = async (category: WhatsappCategory, next: boolean) => {
    try {
      await setCategory(category, next);
    } catch (err) {
      sileo.error({
        title: 'No pudimos guardar',
        description: friendlyErrorText(err, 'Intenta de nuevo en un momento.'),
      });
    }
  };

  if (loading) return <Bone kind="box" height={112} radius={24} />;
  if (error) return null;

  /**
   * Texto de la fila. La de Alertas de zona, si está encendida pero las alertas no están listas
   * (sin zona, o con "Recibir alertas" apagado), dice que falta configurar la zona. Nada de
   * "apagadas" ni "activar": junto a un interruptor encendido se leía como contradicción.
   * Con la fila apagada no hay nada pendiente: va la descripción normal.
   */
  const categoryHint = (category: WhatsappCategory, on: boolean) => {
    if (category.id !== 'nearby' || !zone) return <>{category.description}</>;
    if (on && active && !zone.enabled) {
      return (
        <span className="inline-flex items-start gap-1.5">
          <span className="mt-[5px] size-2 shrink-0 rounded-full bg-amber-500" aria-hidden />
          <span>
            <span className="sr-only">Pendiente: </span>
            Te falta configurar tu zona para que te lleguen.{' '}
            <Link href={Routes.notifications.alerts} className={inlineLink}>
              Configurar zona
            </Link>
          </span>
        </span>
      );
    }
    if (!zone.enabled) return <>{category.description}</>;
    return (
      <>
        Un animal perdido o encontrado a menos de {zone.radiusKm} km de tu zona.{' '}
        <Link href={Routes.notifications.alerts} className={inlineLink}>
          Cambiar zona
        </Link>
      </>
    );
  };

  return (
    <section aria-labelledby="whatsapp-notifications-title" className={cn(dashSurfaceClass, 'p-4 sm:p-5')}>
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300">
          <HugeiconsIcon icon={WhatsappIcon} size={22} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="whatsapp-notifications-title" className="text-[17px] font-semibold tracking-[-0.02em] text-dash-ink">
            Avisos por WhatsApp
          </h2>
          <p className="text-[13px] text-dash-muted">
            {active ? 'Encendidos' : canEnable ? 'Apagados' : 'Falta tu teléfono'}
          </p>
        </div>
        <DashSwitch
          checked={enabled}
          // Apagarlo siempre se puede; encenderlo pide un teléfono válido.
          disabled={saving || (!enabled && !canEnable)}
          onChange={(next) => void toggleAll(next)}
          labelledBy="whatsapp-notifications-title"
          describedBy="whatsapp-notifications-description"
        />
      </div>

      {/* Desde `sm` el texto queda alineado bajo el título (ícono de 44 px + 12 px de separación). */}
      <div className="mt-3 sm:pl-14">
        <p id="whatsapp-notifications-description" className="text-sm leading-relaxed text-dash-muted">
          Además de aquí, te mandamos por WhatsApp los avisos que elijas. Puedes cambiarlos o apagarlos cuando quieras.
        </p>
        {canEnable ? (
          <p className="mt-1.5 text-sm text-dash-soft">
            Al <strong className="font-semibold tabular-nums text-dash-ink">{phoneLabel}</strong>
            {' · '}
            <Link href={Routes.profileTab('profile')} className={inlineLink}>
              Cambiar número
            </Link>
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-[18px] bg-dash-surface-2 p-3">
            <p className="min-w-0 flex-1 text-sm text-dash-soft">Para activarlos, agrega tu teléfono a tu perfil.</p>
            <Link href={Routes.profileTab('profile')} className={dashButtonClass({ variant: 'outline', size: 'sm' })}>
              Agregar teléfono
            </Link>
          </div>
        )}

        <div className={cn('mt-5 space-y-5 transition-opacity duration-200', !active && 'opacity-60')}>
          {groups.map((group) => (
            <div key={group.id}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h3 className="text-[13px] font-semibold text-dash-soft">{group.title}</h3>
                {active ? (
                  <span className="text-xs font-semibold tabular-nums text-dash-muted">
                    {group.items.filter((category) => isCategoryOn(category, muted)).length} de {group.items.length}
                  </span>
                ) : null}
              </div>
              <ul className="divide-y divide-dash-line overflow-hidden rounded-[18px] bg-dash-surface-2">
                {group.items.map((category) => {
                  const on = isCategoryOn(category, muted);
                  const labelId = `whatsapp-type-${category.id}`;
                  return (
                    <li key={category.id} className="flex items-center gap-3 px-3.5 py-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-dash-surface text-dash-soft">
                        <HugeiconsIcon icon={CATEGORY_ICON[category.id]} size={16} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span id={labelId} className="block text-sm font-semibold text-dash-ink">
                          {category.label}
                        </span>
                        <span id={`${labelId}-hint`} className="mt-0.5 block text-[13px] leading-snug text-dash-muted">
                          {categoryHint(category, on)}
                        </span>
                      </span>
                      <DashSwitch
                        size="sm"
                        checked={active && on}
                        disabled={saving || !active}
                        onChange={(next) => void toggleCategory(category, next)}
                        labelledBy={labelId}
                        describedBy={`${labelId}-hint`}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {!active ? (
            <p className="text-[13px] text-dash-muted">
              {canEnable
                ? 'Enciende «Avisos por WhatsApp» para elegir cuáles te llegan.'
                : 'Cuando agregues tu teléfono podrás elegir cuáles te llegan.'}
            </p>
          ) : onCount === 0 ? (
            <p role="status" className="text-[13px] text-amber-800 dark:text-amber-300">
              Apagaste todos: no te llegará ningún aviso por WhatsApp.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
