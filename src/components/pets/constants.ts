/**
 * Cartilla digital de la mascota. Los valores son los del backend (`kadesh-back`,
 * `models/Pet/constants.ts`); aquí solo van etiquetas y colores.
 */

export const PET_STATUS = {
  ACTIVE: 'active',
  LOST: 'lost',
  DECEASED: 'deceased',
  TRANSFERRED: 'transferred',
} as const;

export const PET_STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  lost: 'Perdida',
  deceased: 'Fallecida',
  transferred: 'Transferida',
};

/** Estados que la persona puede poner a mano (`lost` solo con Marcar como perdida). */
export const PET_MANUAL_STATUS_OPTIONS = [
  { label: 'Activa', value: PET_STATUS.ACTIVE },
  { label: 'Fallecida', value: PET_STATUS.DECEASED },
  { label: 'Transferida', value: PET_STATUS.TRANSFERRED },
] as const;

export const PET_STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  lost: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  deceased: 'bg-[#eceff3] text-[#3a3a3a] dark:bg-white/10 dark:text-[#d0d0d0]',
  transferred: 'bg-[#eceff3] text-[#3a3a3a] dark:bg-white/10 dark:text-[#d0d0d0]',
};

export const PET_STERILIZED_OPTIONS = [
  { label: 'Sí', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'No lo sé', value: 'unknown' },
] as const;

export const PET_STERILIZED_LABELS: Record<string, string> = {
  yes: 'Sí',
  no: 'No',
  unknown: 'No lo sé',
};

export const PET_OWNER_ROLE = {
  PRINCIPAL: 'principal',
  FAMILY: 'family',
} as const;

export const PET_OWNER_ROLE_LABELS: Record<string, string> = {
  principal: 'Principal',
  family: 'Familiar',
};

export const HEALTH_RECORD_TYPE_OPTIONS = [
  { label: 'Vacuna', value: 'vaccine' },
  { label: 'Desparasitación interna', value: 'internal_deworming' },
  { label: 'Desparasitación externa', value: 'external_deworming' },
  { label: 'Consulta', value: 'consultation' },
  { label: 'Cirugía', value: 'surgery' },
  { label: 'Medicamento', value: 'medication' },
  { label: 'Otro', value: 'other' },
] as const;

export function healthRecordTypeLabel(value: string | null | undefined): string {
  return HEALTH_RECORD_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? 'Registro';
}

/** Sugerencias del campo nombre según el tipo (se puede escribir cualquier otro). */
export const HEALTH_RECORD_NAME_SUGGESTIONS: Record<string, string[]> = {
  vaccine: ['Rabia', 'Séxtuple', 'Parvovirus', 'Moquillo', 'Bordetella', 'Triple felina', 'Leucemia felina'],
  internal_deworming: ['Desparasitante interno'],
  external_deworming: ['Pipeta antipulgas', 'Collar antipulgas', 'Tableta antipulgas'],
  consultation: ['Revisión general', 'Revisión dental'],
};

export const REMINDER_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const REMINDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  sent: 'Avisado',
  completed: 'Hecho',
  cancelled: 'Cancelado',
};

/**
 * Canales que ofrece la web. WhatsApp existe en el backend pero todavía no manda nada (falta la
 * plantilla de Meta), así que no se ofrece; si un recordatorio ya lo trae, se conserva al guardar.
 */
export const REMINDER_CHANNEL_OPTIONS = [
  { label: 'Notificación', value: 'push' },
  { label: 'Correo', value: 'email' },
] as const;

export const REMINDER_CHANNEL_LABELS: Record<string, string> = {
  push: 'notificación',
  email: 'correo',
  whatsapp: 'WhatsApp',
};

export const REMINDER_DEFAULT_CHANNELS = ['push', 'email'];
export const REMINDER_DEFAULT_DAYS_BEFORE = 3;

export const REMINDER_DAYS_BEFORE_OPTIONS = [
  { label: 'El mismo día', value: 0 },
  { label: '1 día antes', value: 1 },
  { label: '3 días antes', value: 3 },
  { label: '1 semana antes', value: 7 },
  { label: '2 semanas antes', value: 14 },
] as const;

/** Igual que los reportes: el backend copia hasta 3 fotos al reporte de perdida. */
export const MAX_PET_PHOTOS = 3;
export const MAX_ATTACHMENTS = 3;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
