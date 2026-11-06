/**
 * Solicitudes de adopción. Mismos valores que el backend (`AdoptionApplication` de kadesh-back).
 */

import type { DashTone } from 'kadesh/components/app-shell/ui';
import type { AdoptionHousing, AdoptionHousingOwnership } from './types';

export const ADOPTION_STATUS = {
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
  COMPLETED: 'completed',
  CLOSED: 'closed',
} as const;

/** Abiertas: una persona solo puede tener una abierta por animal. */
export const ADOPTION_OPEN_STATUSES: string[] = [
  ADOPTION_STATUS.SUBMITTED,
  ADOPTION_STATUS.IN_REVIEW,
  ADOPTION_STATUS.APPROVED,
];

export function isOpenAdoptionStatus(status: string | null | undefined): boolean {
  return Boolean(status && ADOPTION_OPEN_STATUSES.includes(status));
}

/** Etiqueta y tono de cada estado. «No aprobada» va en neutro: no es un error de nadie. */
const ADOPTION_STATUS_META: Record<string, { label: string; tone: DashTone }> = {
  submitted: { label: 'Enviada', tone: 'accent' },
  in_review: { label: 'En revisión', tone: 'warning' },
  approved: { label: 'Aprobada', tone: 'ok' },
  rejected: { label: 'No aprobada', tone: 'neutral' },
  withdrawn: { label: 'Retirada', tone: 'neutral' },
  completed: { label: 'Adoptó', tone: 'ok' },
  closed: { label: 'Cerrada', tone: 'neutral' },
};

export function adoptionStatusMeta(status: string | null | undefined): { label: string; tone: DashTone } {
  return ADOPTION_STATUS_META[status ?? ''] ?? { label: 'Enviada', tone: 'neutral' };
}

export const ADOPTION_HOUSING_OPTIONS: Array<{ value: AdoptionHousing; label: string }> = [
  { value: 'house', label: 'Casa' },
  { value: 'apartment', label: 'Departamento' },
  { value: 'other', label: 'Otro' },
];

/** `label` para quien llena el formulario; `review` para quien la revisa. */
export const ADOPTION_OWNERSHIP_OPTIONS: Array<{ value: AdoptionHousingOwnership; label: string; review: string }> = [
  { value: 'own', label: 'Propia', review: 'propia' },
  { value: 'rent', label: 'Rentada', review: 'rentada' },
  { value: 'family', label: 'De mi familia', review: 'de su familia' },
];

export const ADOPTION_LIMITS = {
  PHONE_DIGITS: 10,
  MESSAGE_MIN: 20,
  MESSAGE_MAX: 1000,
  /** Otros animales y experiencia. */
  TEXT_MAX: 500,
  HOURS_MIN: 0,
  HOURS_MAX: 24,
  /** Mensaje al aprobar o no aprobar. */
  NOTE_MAX: 500,
};

/** Al volver del inicio de sesión (`?adoptar=1`) se abre el formulario solo. */
export const ADOPT_PARAM = 'adoptar';
/** El enlace de la notificación trae `?solicitud=<id>`: esa solicitud se abre y se resalta. */
export const ADOPTION_APPLICATION_PARAM = 'solicitud';

/** Páginas del panel de un espacio de rescate y del panel de la ficha. */
export const ADOPTION_PAGE_SIZE = 30;
