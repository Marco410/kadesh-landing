"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon, Notification03Icon, Tick02Icon, WhatsappIcon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import { DashFilterChips, DashSwitch, dashButtonClass, dashSurfaceClass } from 'kadesh/components/app-shell';
import { Routes } from 'kadesh/core/routes';
import { MORELIA_CENTER } from 'kadesh/components/animals/nuevo/nominatimPlace';
import { Bone, SkeletonRegion } from 'kadesh/components/ui/skeleton';
import {
  GEO_OPTIONS_FRESH,
  geolocationErrorMessage,
  readGrantedLocation,
  requestCurrentPosition,
} from 'kadesh/utils/geolocation';
import { useUser } from 'kadesh/utils/UserContext';
import { cn } from 'kadesh/utils/cn';
import { useAlertSettings } from './hooks';
import { useWhatsappNotifications } from './hooks/useWhatsappNotifications';
import { ALERT_RADIUS_OPTIONS, DEFAULT_ALERT_RADIUS_KM, MAX_DAILY_ALERTS } from './constants';
import AlertZoneMap from './AlertZoneMap';
import type { AlertSettings } from './types';

const EMPTY_SETTINGS: AlertSettings = {
  enabled: false,
  center: null,
  radiusKm: DEFAULT_ALERT_RADIUS_KM,
};

function AlertSettingsSkeleton() {
  return (
    <SkeletonRegion label="Cargando tus alertas" className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-dash-line p-4">
        <div className="flex-1">
          <Bone kind="line" slot={24} width={140} />
          <Bone kind="line" slot={20} width="70%" />
        </div>
        <Bone kind="box" width={52} height={32} radius={9999} />
      </div>
      <Bone kind="box" height={320} radius={16} />
      <div className="flex gap-1.5">
        {[56, 56, 56, 64, 64, 64].map((width, index) => (
          <Bone key={index} kind="box" width={width} height={44} radius={9999} />
        ))}
      </div>
    </SkeletonRegion>
  );
}

/** Interruptor, zona en el mapa y radio de las alertas de mascotas cerca. */
export default function AlertSettingsForm() {
  const { user } = useUser();
  const { settings, loading, error, save, saving } = useAlertSettings(user?.id);
  const whatsapp = useWhatsappNotifications(user?.id);
  // `null` = no se ha tocado: se muestra lo guardado. Se guarda con el resto, en "Guardar".
  const [whatsappDraft, setWhatsappDraft] = useState<boolean | null>(null);
  const [form, setForm] = useState<AlertSettings>(EMPTY_SETTINGS);
  const [dirty, setDirty] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [fallbackCenter] = useState(() => readGrantedLocation() ?? MORELIA_CENTER);

  useEffect(() => {
    if (settings && !dirty) setForm(settings);
  }, [settings, dirty]);

  const update = (patch: Partial<AlertSettings>) => {
    setDirty(true);
    setForm((current) => ({ ...current, ...patch }));
  };

  const needsCenter = form.enabled && !form.center;
  const whatsappOn = whatsappDraft ?? whatsapp.zoneOn;
  const whatsappChanged = whatsappDraft !== null && whatsappDraft !== whatsapp.zoneOn;
  const canWhatsapp = Boolean(whatsapp.phoneLabel);

  const handleUseLocation = async () => {
    setLocating(true);
    setLocationError(null);
    try {
      const coords = await requestCurrentPosition(GEO_OPTIONS_FRESH);
      update({ center: coords });
    } catch (err) {
      setLocationError(
        err instanceof GeolocationPositionError
          ? geolocationErrorMessage(err)
          : 'No pudimos obtener tu ubicación.'
      );
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    if (needsCenter) return;
    try {
      if (dirty) await save(form);
      const { onlyZone } = whatsappChanged ? await whatsapp.setZoneWhatsapp(whatsappOn) : { onlyZone: false };
      setDirty(false);
      setWhatsappDraft(null);
      const channels = whatsappOn ? 'en la campana y por WhatsApp' : 'en la campana';
      sileo.success({
        title: form.enabled ? 'Alertas activadas' : 'Alertas guardadas',
        description: form.enabled
          ? `Te avisaremos ${channels} de mascotas perdidas o encontradas a ${form.radiusKm} km.${
              onlyZone ? ' Los demás avisos por WhatsApp los eliges en Ajustes de avisos.' : ''
            }`
          : 'No te enviaremos alertas de zona.',
      });
    } catch (err) {
      sileo.error({
        title: 'No pudimos guardar',
        description: err instanceof Error ? err.message : 'Intenta de nuevo en un momento.',
      });
    }
  };

  if (loading) return <AlertSettingsSkeleton />;

  if (error && !settings) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
        No pudimos cargar tus alertas. Recarga la página para intentarlo de nuevo.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className={cn(dashSurfaceClass, 'flex items-center justify-between gap-4 p-4 sm:p-5')}>
        <div>
          <p id="alerts-switch-label" className="text-[17px] font-semibold tracking-[-0.02em] text-dash-ink">
            Recibir alertas
          </p>
          <p id="alerts-switch-hint" className="mt-0.5 text-sm text-dash-muted">
            Te avisamos cuando alguien reporte una mascota perdida o encontrada dentro de tu zona.
          </p>
        </div>
        <DashSwitch
          checked={form.enabled}
          onChange={(enabled) => update({ enabled })}
          labelledBy="alerts-switch-label"
          describedBy="alerts-switch-hint"
        />
      </div>

      <section aria-labelledby="alerts-zone-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="alerts-zone-heading" className="text-base font-bold text-dash-ink">
              Tu zona
            </h2>
            <p className="mt-0.5 text-sm text-dash-muted">
              Toca un punto del mapa o arrástralo para poner el centro, o usa tu ubicación.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleUseLocation()}
            disabled={locating}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 px-4 text-sm font-semibold disabled:opacity-50 rounded-full border border-dash-line-strong bg-dash-surface text-dash-ink transition-colors hover:border-kadesh-400"
          >
            <HugeiconsIcon icon={Location01Icon} size={16} strokeWidth={1.5} aria-hidden="true" />
            {locating ? 'Obteniendo ubicación…' : 'Mi ubicación'}
          </button>
        </div>
        {locationError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{locationError}</p>
        ) : null}

        <AlertZoneMap
          center={form.center}
          fallbackCenter={form.center ?? fallbackCenter}
          radiusKm={form.radiusKm}
          onCenterChange={(center) => update({ center })}
        />

        <DashFilterChips
          label="Radio"
          options={ALERT_RADIUS_OPTIONS.map((km) => ({ value: String(km), label: `${km} km` }))}
          value={String(form.radiusKm)}
          onChange={(km) => update({ radiusKm: Number(km) })}
        />
        <p className="text-sm text-dash-muted">
          Recibirás como máximo {MAX_DAILY_ALERTS} avisos al día, de reportes de los últimos 3 días.
        </p>
      </section>

      <section aria-labelledby="alerts-channels-heading" className="space-y-3">
        <div>
          <h2 id="alerts-channels-heading" className="text-base font-bold text-dash-ink">
            Cómo te avisamos
          </h2>
          <p className="mt-0.5 text-sm text-dash-muted">
            {form.enabled
              ? 'Siempre en la campana. Si quieres, también por WhatsApp.'
              : 'Activa «Recibir alertas» para elegir cómo te avisamos.'}
          </p>
        </div>
        <ul
          className={cn(
            dashSurfaceClass,
            'divide-y divide-dash-line overflow-hidden transition-opacity duration-200',
            !form.enabled && 'opacity-60'
          )}
        >
          <li className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-dash-surface-2 text-dash-soft">
              <HugeiconsIcon icon={Notification03Icon} size={18} aria-hidden />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-sm font-semibold text-dash-ink">Campana y celular</span>
              <span className="mt-0.5 block text-[13px] leading-snug text-dash-muted">
                En Notificaciones y en la app de Kadesh Pet, si la tienes.
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-dash-soft">
              <HugeiconsIcon icon={Tick02Icon} size={16} aria-hidden />
              Siempre
            </span>
          </li>
          <li className="flex flex-wrap items-center gap-3 px-4 py-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300">
              <HugeiconsIcon icon={WhatsappIcon} size={18} aria-hidden />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span id="alerts-whatsapp-label" className="block text-sm font-semibold text-dash-ink">
                WhatsApp
              </span>
              <span id="alerts-whatsapp-hint" className="mt-0.5 block text-[13px] leading-snug text-dash-muted">
                {whatsapp.loading
                  ? 'Cargando…'
                  : canWhatsapp
                    ? `También al ${whatsapp.phoneLabel}.`
                    : 'Agrega tu teléfono para recibirlas por WhatsApp.'}
              </span>
            </span>
            {canWhatsapp || whatsapp.loading ? (
              <DashSwitch
                checked={whatsappOn}
                onChange={(next) => setWhatsappDraft(next)}
                disabled={!form.enabled || whatsapp.loading || Boolean(whatsapp.error)}
                labelledBy="alerts-whatsapp-label"
                describedBy="alerts-whatsapp-hint"
              />
            ) : (
              <Link href={Routes.profileTab('profile')} className={dashButtonClass({ variant: 'outline', size: 'sm' })}>
                Agregar teléfono
              </Link>
            )}
          </li>
        </ul>
        <p className="text-[13px] text-dash-muted">
          Los demás avisos por WhatsApp (cartilla, comentarios, solicitudes de tus reportes) los eliges en{' '}
          <Link
            href={Routes.notifications.settings}
            className="font-semibold text-kadesh-700 underline-offset-2 hover:underline dark:text-kadesh-300"
          >
            Ajustes de avisos
          </Link>
          .
        </p>
      </section>

      {needsCenter ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          Elige el centro de tu zona: toca un punto del mapa, arrástralo o usa «Mi ubicación».
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving || whatsapp.saving || needsCenter || (!dirty && !whatsappChanged)}
        className="inline-flex min-h-12 w-full items-center justify-center px-6 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh sm:w-auto rounded-full dash-grad-accent shadow-dash-accent transition-[transform,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash-accent-lift"
      >
        {saving || whatsapp.saving ? 'Guardando…' : 'Guardar'}
      </button>
    </div>
  );
}
