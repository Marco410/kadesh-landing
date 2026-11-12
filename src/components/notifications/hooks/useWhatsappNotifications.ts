"use client";

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { normalizeMxPhone } from 'kadesh/utils/phone';
import { WHATSAPP_CATEGORIES, type WhatsappCategory } from '../constants';

/** Tipo de las alertas de zona (`animal.nearby`). */
const NEARBY_TYPE = 'animal.nearby';

/**
 * Avisos sobre los reportes propios: los que se encienden con «Avísame por WhatsApp» al publicar
 * (seguimiento, coincidencias, comentarios y solicitudes).
 */
export const OWN_REPORT_TYPES = [
  'animal.follow_up',
  'animal.possible_match',
  'animal.commented',
  'animal.claim_requested',
];

/** Tipos de Pet que no son alertas de zona (los de admin no se tocan desde Alertas de zona). */
const OTHER_PET_TYPES: string[] = WHATSAPP_CATEGORIES.filter(
  (category) => !('admin' in category && category.admin) && category.id !== 'nearby'
).flatMap((category) => [...category.types]);
import {
  UPDATE_WHATSAPP_NOTIFICATIONS_MUTATION,
  WHATSAPP_NOTIFICATIONS_QUERY,
  type UpdateWhatsappNotificationsResponse,
  type UpdateWhatsappNotificationsVariables,
  type WhatsappNotificationsResponse,
} from '../queries';

/**
 * Teléfono al que puede llegar el WhatsApp, en el formato que se muestra ("55 1234 5678"), o null.
 * Misma regla que el backend: 10 dígitos de México, o 11+ con lada de otro país.
 */
export function whatsappPhoneLabel(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const mx = normalizeMxPhone(raw);
  if (mx.ok) return `${mx.digits.slice(0, 2)} ${mx.digits.slice(2, 6)} ${mx.digits.slice(6)}`;
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 11 ? `+${digits}` : null;
}

/** ¿La categoría está encendida? Lo está si ninguno de sus tipos está silenciado. */
export function isCategoryOn(category: WhatsappCategory, muted: readonly string[]): boolean {
  return !category.types.some((type) => muted.includes(type));
}

/** Lista silenciada después de encender o apagar una categoría (sin duplicados, orden estable). */
export function mutedAfter(category: WhatsappCategory, muted: readonly string[], on: boolean): string[] {
  const types: readonly string[] = category.types;
  const rest = muted.filter((type) => !types.includes(type));
  return on ? rest : [...rest, ...types];
}

/**
 * Lee y cambia los avisos por WhatsApp de la persona con sesión: el interruptor general
 * (`whatsappNotifications`) y los tipos silenciados (`whatsappMutedTypes`).
 */
export function useWhatsappNotifications(userId: string | undefined) {
  const { data, loading, error } = useQuery<WhatsappNotificationsResponse>(WHATSAPP_NOTIFICATIONS_QUERY, {
    variables: { id: userId },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });
  const [updateMutation, { loading: saving }] = useMutation<
    UpdateWhatsappNotificationsResponse,
    UpdateWhatsappNotificationsVariables
  >(UPDATE_WHATSAPP_NOTIFICATIONS_MUTATION);

  const user = data?.user ?? null;
  const enabled = Boolean(user?.whatsappNotifications);
  const muted = useMemo(
    () => (Array.isArray(user?.whatsappMutedTypes) ? user.whatsappMutedTypes : []),
    [user?.whatsappMutedTypes]
  );

  // El interruptor cambia al instante; si falla, Apollo regresa el valor anterior.
  const save = useCallback(
    async (
      next: { whatsappNotifications: boolean; whatsappMutedTypes: string[] },
      changed: Partial<typeof next> & { phone?: string }
    ) => {
      if (!userId) throw new Error('Inicia sesión para cambiar tus avisos.');
      await updateMutation({
        variables: { id: userId, data: changed },
        optimisticResponse: {
          updateUser: { __typename: 'User', id: userId, phone: changed.phone ?? user?.phone ?? null, ...next },
        },
      });
    },
    [updateMutation, userId, user?.phone]
  );

  const setEnabled = useCallback(
    (on: boolean) => save({ whatsappNotifications: on, whatsappMutedTypes: muted }, { whatsappNotifications: on }),
    [save, muted]
  );

  const setCategory = useCallback(
    (category: WhatsappCategory, on: boolean) => {
      const nextMuted = mutedAfter(category, muted, on);
      return save({ whatsappNotifications: enabled, whatsappMutedTypes: nextMuted }, { whatsappMutedTypes: nextMuted });
    },
    [save, muted, enabled]
  );

  /** Las alertas de zona llegan por WhatsApp: interruptor general encendido y `animal.nearby` sin silenciar. */
  const zoneOn = enabled && !muted.includes(NEARBY_TYPE);

  /**
   * WhatsApp de las alertas de zona (desde Alertas de zona). Si WhatsApp estaba apagado del todo,
   * encenderlo aquí activa SOLO las alertas de zona: los demás avisos de Pet quedan silenciados
   * hasta que la persona los elija en Notificaciones (no se le prende de golpe todo lo demás).
   * Devuelve `onlyZone: true` en ese caso, para decírselo.
   */
  const setZoneWhatsapp = useCallback(
    async (on: boolean): Promise<{ onlyZone: boolean }> => {
      if (!on) {
        const nextMuted = [...new Set([...muted, NEARBY_TYPE])];
        await save({ whatsappNotifications: enabled, whatsappMutedTypes: nextMuted }, { whatsappMutedTypes: nextMuted });
        return { onlyZone: false };
      }
      const withoutZone = muted.filter((type) => type !== NEARBY_TYPE);
      if (enabled) {
        await save({ whatsappNotifications: true, whatsappMutedTypes: withoutZone }, { whatsappMutedTypes: withoutZone });
        return { onlyZone: false };
      }
      const nextMuted = [...new Set([...withoutZone, ...OTHER_PET_TYPES])];
      await save(
        { whatsappNotifications: true, whatsappMutedTypes: nextMuted },
        { whatsappNotifications: true, whatsappMutedTypes: nextMuted }
      );
      return { onlyZone: true };
    },
    [save, muted, enabled]
  );

  /**
   * «Avísame por WhatsApp sobre este reporte» (formulario de reporte). Enciende los avisos de los
   * reportes propios (`OWN_REPORT_TYPES`). Si WhatsApp estaba apagado del todo, el resto de los avisos
   * de Pet quedan silenciados (no se le prende todo de golpe). Sin teléfono en el perfil, guarda el
   * del reporte (`phoneDigits`), que la persona vio en la casilla.
   */
  const enableForReports = useCallback(
    async (phoneDigits?: string | null) => {
      const ownTypes = new Set(OWN_REPORT_TYPES);
      const withoutOwn = muted.filter((type) => !ownTypes.has(type));
      const nextMuted = enabled
        ? withoutOwn
        : [...new Set([...withoutOwn, NEARBY_TYPE, ...OTHER_PET_TYPES.filter((type) => !ownTypes.has(type))])];
      const phone = !whatsappPhoneLabel(user?.phone) && phoneDigits ? phoneDigits : undefined;
      await save(
        { whatsappNotifications: true, whatsappMutedTypes: nextMuted },
        { whatsappNotifications: true, whatsappMutedTypes: nextMuted, ...(phone ? { phone } : {}) }
      );
    },
    [save, muted, enabled, user?.phone]
  );

  /** ¿Ya le llegan por WhatsApp los avisos de sus reportes? (entonces no se ofrece la casilla). */
  const ownReportsOn = enabled && OWN_REPORT_TYPES.every((type) => !muted.includes(type));

  return {
    enabled,
    muted,
    zoneOn,
    ownReportsOn,
    enableForReports,
    loaded: Boolean(data),
    setZoneWhatsapp,
    phoneLabel: whatsappPhoneLabel(user?.phone),
    loading: loading && !data,
    error: error && !data ? error : null,
    saving,
    setEnabled,
    setCategory,
  };
}
