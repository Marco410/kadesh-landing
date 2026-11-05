import {
  Calendar03Icon,
  GiftIcon,
  Home01Icon,
  MedicalMaskIcon,
  MedicineBottle01Icon,
  Stethoscope02Icon,
  TeacherIcon,
  UserGroupIcon,
  VaccineIcon,
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';

/**
 * Eventos de Kadesh Pet. Mismos valores que kadesh-back (`models/Pet/PetEvent/constants.ts`):
 * si cambias uno, cambia el otro.
 */

export const EVENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];

export const EVENT_STATUS_LABEL: Record<string, string> = {
  pending: 'En revisión',
  approved: 'Publicado',
  rejected: 'Necesita cambios',
  cancelled: 'Cancelado',
};

export type EventCategory =
  | 'esterilizacion'
  | 'vacunacion'
  | 'adopcion'
  | 'desparasitacion'
  | 'consulta'
  | 'colecta'
  | 'voluntariado'
  | 'taller'
  | 'otro';

type CategoryConfig = {
  value: EventCategory;
  /** Para chips y filtros. */
  label: string;
  /** Para títulos: «Campaña de esterilización». */
  title: string;
  icon: IconSvgElement;
  /** Fondo de la etiqueta (pasa AA con texto blanco). */
  color: string;
};

export const EVENT_CATEGORIES: readonly CategoryConfig[] = [
  { value: 'esterilizacion', label: 'Esterilización', title: 'Campaña de esterilización', icon: MedicalMaskIcon, color: '#7c3aed' },
  { value: 'vacunacion', label: 'Vacunación', title: 'Jornada de vacunación', icon: VaccineIcon, color: '#0369a1' },
  { value: 'adopcion', label: 'Adopción', title: 'Feria de adopción', icon: Home01Icon, color: '#e11d48' },
  { value: 'desparasitacion', label: 'Desparasitación', title: 'Jornada de desparasitación', icon: MedicineBottle01Icon, color: '#0f766e' },
  { value: 'consulta', label: 'Consulta médica', title: 'Jornada médica', icon: Stethoscope02Icon, color: '#4f46e5' },
  { value: 'colecta', label: 'Colecta', title: 'Colecta', icon: GiftIcon, color: '#b45309' },
  { value: 'voluntariado', label: 'Voluntariado', title: 'Voluntariado', icon: UserGroupIcon, color: '#15803d' },
  { value: 'taller', label: 'Taller o plática', title: 'Taller', icon: TeacherIcon, color: '#a21caf' },
  { value: 'otro', label: 'Otro', title: 'Evento', icon: Calendar03Icon, color: '#475569' },
];

const CATEGORY_BY_VALUE = new Map(EVENT_CATEGORIES.map((category) => [category.value, category]));

export function eventCategory(value: string | null | undefined): CategoryConfig {
  return CATEGORY_BY_VALUE.get(value as EventCategory) ?? EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1];
}

export function isEventCategory(value: string | null | undefined): value is EventCategory {
  return CATEGORY_BY_VALUE.has(value as EventCategory);
}

export const EVENT_SPECIES = [
  { value: 'dog', label: 'Perros' },
  { value: 'cat', label: 'Gatos' },
  { value: 'other', label: 'Otros' },
] as const;

export type EventScope = 'zone' | 'city' | 'state' | 'national';

export const EVENT_SCOPES: ReadonlyArray<{ value: EventScope; label: string; hint: string; adminOnly?: boolean }> = [
  { value: 'zone', label: 'Una zona', hint: 'Le avisamos a quien vive a unos kilómetros del lugar.' },
  { value: 'city', label: 'El municipio', hint: 'Le avisamos a todo el municipio donde es el evento.' },
  { value: 'state', label: 'El estado', hint: 'Le avisamos a todo el estado donde es el evento.' },
  { value: 'national', label: 'Todo México', hint: 'Le avisamos a todo el país. Solo para el equipo de Kadesh.', adminOnly: true },
];

export const EVENT_REACH_KM_OPTIONS = [5, 10, 20, 50] as const;
export const DEFAULT_EVENT_REACH_KM = 10;

export const EVENT_INTEREST = {
  INTERESTED: 'interested',
  GOING: 'going',
} as const;

export type EventInterestKind = (typeof EVENT_INTEREST)[keyof typeof EVENT_INTEREST];

export const EVENT_LIMITS = {
  TITLE_MIN: 5,
  TITLE_MAX: 120,
  DESCRIPTION_MIN: 20,
  DESCRIPTION_MAX: 5000,
  REQUIREMENTS_MAX: 1000,
  ORGANIZER_MAX: 120,
  PLACE_LABEL_MAX: 160,
  PRICE_NOTE_MAX: 120,
  MAX_SESSIONS: 30,
  MAX_SESSION_DAYS: 7,
  MAX_MONTHS_AHEAD: 12,
  MAX_PHOTOS: 6,
} as const;

/** Lo aplica el backend (`PET_EVENT_ALERTS`); aquí solo se explica. */
export const EVENT_ALERTS = {
  MAX_PER_DAY: 3,
  LEAD_DAYS: 14,
} as const;

export const EVENTS_PAGE_SIZE = 12;
/** «Cerca de mí»: eventos a esta distancia (los nacionales siempre salen). */
export const EVENTS_NEAR_RADIUS_KM = 100;

export type EventWhen = 'proximos' | 'semana' | 'mes';

export const EVENT_WHEN_OPTIONS: ReadonlyArray<{ value: EventWhen; label: string }> = [
  { value: 'proximos', label: 'Próximos' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
];

export const DEFAULT_EVENT_TIME_ZONE = 'America/Mexico_City';
