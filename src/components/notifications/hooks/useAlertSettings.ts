"use client";

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  PET_ALERT_SETTINGS_QUERY,
  UPDATE_PET_ALERT_SETTINGS_MUTATION,
  type PetAlertSettingsResponse,
  type UpdatePetAlertSettingsResponse,
  type UpdatePetAlertSettingsVariables,
} from '../queries';
import { DEFAULT_ALERT_RADIUS_KM } from '../constants';
import type { AlertSettings } from '../types';

/** Lee y guarda las alertas de zona de la persona con sesión (`userId`). */
export function useAlertSettings(userId: string | undefined) {
  const { data, loading, error } = useQuery<PetAlertSettingsResponse>(PET_ALERT_SETTINGS_QUERY, {
    variables: { id: userId },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const settings = useMemo<AlertSettings | null>(() => {
    const user = data?.user;
    if (!user) return null;
    const hasCenter = user.alertLat != null && user.alertLng != null;
    return {
      enabled: Boolean(user.petAlertsEnabled) && hasCenter,
      center: hasCenter ? { lat: user.alertLat as number, lng: user.alertLng as number } : null,
      radiusKm: user.alertRadiusKm ?? DEFAULT_ALERT_RADIUS_KM,
    };
  }, [data]);

  const [updateMutation, { loading: saving }] = useMutation<
    UpdatePetAlertSettingsResponse,
    UpdatePetAlertSettingsVariables
  >(UPDATE_PET_ALERT_SETTINGS_MUTATION);

  const save = useCallback(
    async (next: AlertSettings) => {
      if (!userId) throw new Error('Inicia sesión para configurar tus alertas.');
      // Sin centro no se puede avisar de nada: se guarda apagado.
      const enabled = next.enabled && next.center != null;
      await updateMutation({
        variables: {
          id: userId,
          data: {
            petAlertsEnabled: enabled,
            alertLat: next.center?.lat ?? null,
            alertLng: next.center?.lng ?? null,
            alertRadiusKm: next.radiusKm,
          },
        },
      });
    },
    [updateMutation, userId]
  );

  return { settings, loading: loading && !data, error, save, saving };
}
