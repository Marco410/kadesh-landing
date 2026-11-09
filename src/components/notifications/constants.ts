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

/** Avisos de eventos (kadesh-back `models/Notification/constants.ts`). */
export const EVENT_NOTIFICATION_TYPE = {
  NEARBY: 'event.nearby',
  REMINDER: 'event.reminder',
  SUBMITTED: 'event.submitted',
  APPROVED: 'event.approved',
  REJECTED: 'event.rejected',
  CANCELLED: 'event.cancelled',
  UPDATED: 'event.updated',
} as const;

/** Avisos de espacios de rescate (kadesh-back `models/Notification/constants.ts`). */
export const RESCUE_NOTIFICATION_TYPE = {
  SUBMITTED: 'rescue.submitted',
  VERIFIED: 'rescue.verified',
  REJECTED: 'rescue.rejected',
  MEMBER_ADDED: 'rescue.member_added',
  /** Un espacio completó tu adopción: la mascota ya está en tu cartilla. */
  ADOPTION_COMPLETED: 'pet.adoption_completed',
  /** Alguien pidió adoptar un animal que publicaste (o de tu espacio). */
  APPLICATION_RECEIVED: 'adoption.application_received',
  /** Cambió tu solicitud de adopción (en revisión, aprobada, no aprobada o cerrada). */
  APPLICATION_UPDATED: 'adoption.application_updated',
  /** Alguien recibió con el código la mascota que traspasaste. */
  TRANSFER_REDEEMED: 'pet.transfer_redeemed',
} as const;

export const NOTIFICATION_TONE_COLOR = {
  found: '#10b981',
  lost: '#dc2626',
  brand: 'var(--color-kadesh)',
} as const;

/**
 * Avisos que pueden llegar por WhatsApp (los que tienen plantilla en kadesh-back,
 * `utils/notifications/whatsapp.ts`), agrupados como los ve la persona. Cada uno es un interruptor
 * en "Avisos por WhatsApp"; apagarlo agrega sus `types` a `User.whatsappMutedTypes`. Las respuestas
 * a una solicitud (aceptada / rechazada) van juntas. `admin`: solo se muestran a admins.
 */
export const WHATSAPP_CATEGORIES = [
  {
    id: 'nearby',
    label: 'Alertas de zona',
    description: 'Un animal perdido o encontrado cerca de ti.',
    types: ['animal.nearby'],
  },
  {
    id: 'reminders',
    label: 'Recordatorios de la cartilla',
    description: 'Vacunas, desparasitaciones y otros pendientes de tus mascotas.',
    types: ['pet.reminder_due'],
  },
  {
    id: 'matches',
    label: 'Posibles coincidencias',
    description: 'Un reporte nuevo se parece a uno tuyo.',
    types: ['animal.possible_match'],
  },
  {
    id: 'comments',
    label: 'Comentarios en tus reportes',
    description: 'Alguien comenta en un reporte que publicaste.',
    types: ['animal.commented'],
  },
  {
    id: 'claims',
    label: 'Solicitudes de tus reportes',
    description: 'Alguien dice que el animal de tu reporte es su mascota.',
    types: ['animal.claim_requested'],
  },
  {
    id: 'claim-answers',
    label: 'Respuestas a tus solicitudes',
    description: 'Aceptaron o rechazaron tu solicitud para quedarte con un reporte.',
    types: ['animal.claim_approved', 'animal.claim_rejected'],
  },
  {
    id: 'admin-animals',
    label: 'Animales nuevos',
    description: 'Alguien registró un animal.',
    types: ['animal.created'],
    admin: true,
  },
  {
    id: 'admin-services',
    label: 'Servicios solicitados',
    description: 'Una clínica pidió un servicio nuevo para el catálogo.',
    types: ['petplace.service_requested'],
    admin: true,
  },
  {
    id: 'admin-bank',
    label: 'Datos bancarios',
    description: 'Un usuario actualizó sus datos bancarios.',
    types: ['user.bank_details_updated'],
    admin: true,
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  description: string;
  types: readonly string[];
  admin?: boolean;
}>;

export type WhatsappCategory = (typeof WHATSAPP_CATEGORIES)[number];
