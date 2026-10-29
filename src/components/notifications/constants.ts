export const NOTIFICATIONS_PAGE_SIZE = 20;

/** Cada cuánto se refresca el contador de la campana. */
export const UNREAD_POLL_MS = 60_000;

export const ALERT_RADIUS_OPTIONS = [1, 3, 5, 10, 20, 50] as const;
export const DEFAULT_ALERT_RADIUS_KM = 5;

/** Tope de avisos de zona por persona en 24 h (lo aplica el backend). */
export const MAX_DAILY_ALERTS = 5;

export const NEARBY_ANIMAL_TYPE = 'animal.nearby';

/** Avisos de un reporte (kadesh-back `models/Notification/constants.ts`). */
export const ANIMAL_REPORT_NOTIFICATION_TYPE = {
  COMMENTED: 'animal.commented',
  DUPLICATE_REPORTED: 'animal.duplicate_reported',
  POSSIBLE_MATCH: 'animal.possible_match',
  CLAIM_REQUESTED: 'animal.claim_requested',
  CLAIM_APPROVED: 'animal.claim_approved',
  CLAIM_REJECTED: 'animal.claim_rejected',
  MERGED: 'animal.merged',
} as const;

export const NOTIFICATION_TONE_COLOR = {
  found: '#10b981',
  lost: '#dc2626',
  brand: 'var(--color-kadesh)',
} as const;
