"use client";

import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import DirectoryRadiusChips from 'kadesh/components/shared/DirectoryRadiusChips';
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
      await save(form);
      setDirty(false);
      sileo.success({
        title: form.enabled ? 'Alertas activadas' : 'Alertas guardadas',
        description: form.enabled
          ? `Te avisaremos de mascotas perdidas o encontradas a ${form.radiusKm} km.`
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
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-dash-line bg-dash-surface p-4 shadow-dash">
        <div>
          <p id="alerts-switch-label" className="text-base font-bold text-dash-ink">
            Recibir alertas
          </p>
          <p className="mt-0.5 text-sm text-dash-muted">
            Te avisamos cuando alguien reporte una mascota perdida o encontrada dentro de tu zona.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.enabled}
          aria-labelledby="alerts-switch-label"
          onClick={() => update({ enabled: !form.enabled })}
          className={cn(
            'relative inline-flex h-8 w-[52px] flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh',
            form.enabled ? 'bg-kadesh' : 'bg-dash-faint'
          )}
        >
          <span
            className={cn(
              'inline-block h-6 w-6 rounded-full bg-white shadow transition-transform',
              form.enabled ? 'translate-x-[24px]' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      <section aria-labelledby="alerts-zone-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="alerts-zone-heading" className="text-base font-bold text-dash-ink">
              Tu zona
            </h2>
            <p className="mt-0.5 text-sm text-dash-muted">
              Mueve el mapa para poner el centro, o usa tu ubicación.
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

        <DirectoryRadiusChips
          options={ALERT_RADIUS_OPTIONS}
          value={form.radiusKm}
          onChange={(radiusKm) => update({ radiusKm })}
          label="Radio de la zona"
        />
        <p className="text-sm text-dash-muted">
          Recibirás como máximo {MAX_DAILY_ALERTS} avisos al día, de reportes de los últimos 3 días.
        </p>
      </section>

      {needsCenter ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          Elige el centro de tu zona: mueve el mapa o usa «Mi ubicación».
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving || needsCenter || !dirty}
        className="inline-flex min-h-12 w-full items-center justify-center px-6 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh sm:w-auto rounded-full dash-grad-accent shadow-dash-accent transition-[transform,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash-accent-lift"
      >
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </div>
  );
}
