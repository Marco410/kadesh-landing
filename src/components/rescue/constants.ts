/**
 * Espacios de rescate (rescatistas, refugios, hogares temporales, colectivos y asociaciones).
 * Mismos valores que el backend (`kadesh-back/models/Pet/RescueOrganization/constants.ts`). Las especies
 * que rescata son los tipos de animal de siempre (`ANIMAL_TYPE_OPTIONS`).
 */

import { ANIMAL_TYPE_OPTIONS, animalTypePlural } from 'kadesh/components/animals/constants';

export const RESCUE_ORG_TYPE = {
  INDEPENDENT: 'independent',
  SHELTER: 'shelter',
  FOSTER_HOME: 'foster_home',
  COLLECTIVE: 'collective',
  CIVIL_ASSOCIATION: 'civil_association',
} as const;

export type RescueOrgType = (typeof RESCUE_ORG_TYPE)[keyof typeof RESCUE_ORG_TYPE];

export const RESCUE_ORG_TYPE_OPTIONS: Array<{ value: RescueOrgType; label: string; hint: string }> = [
  { value: 'independent', label: 'Rescatista independiente', hint: 'Rescatas por tu cuenta o con apoyo de amigos.' },
  { value: 'shelter', label: 'Refugio o santuario', hint: 'Tienes un lugar donde viven los animales.' },
  { value: 'foster_home', label: 'Hogar temporal', hint: 'Recibes animales en casa mientras encuentran familia.' },
  { value: 'collective', label: 'Colectivo', hint: 'Un grupo de personas que rescata en equipo.' },
  { value: 'civil_association', label: 'Asociación civil o fundación', hint: 'Organización constituida legalmente.' },
];

export function rescueTypeLabel(value: string | null | undefined): string {
  return RESCUE_ORG_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? 'Espacio de rescate';
}

export const RESCUE_ORG_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;

/** Estados en los que el equipo puede publicar a nombre de la organización. */
export const RESCUE_ORG_ACTIVE_STATUSES: string[] = [RESCUE_ORG_STATUS.PENDING, RESCUE_ORG_STATUS.VERIFIED];

export function rescueStatusBadge(status: string | null | undefined): {
  label: string;
  tone: 'ok' | 'warning' | 'danger' | 'neutral';
} {
  switch (status) {
    case RESCUE_ORG_STATUS.VERIFIED:
      return { label: 'Verificado', tone: 'ok' };
    case RESCUE_ORG_STATUS.REJECTED:
      return { label: 'Rechazado', tone: 'danger' };
    case RESCUE_ORG_STATUS.SUSPENDED:
      return { label: 'Suspendido', tone: 'danger' };
    default:
      return { label: 'En revisión', tone: 'warning' };
  }
}

export const RESCUE_MEMBER_ROLE = {
  ADMIN: 'admin',
  COORDINATOR: 'coordinator',
  VOLUNTEER: 'volunteer',
  FOSTER: 'foster',
} as const;

export type RescueMemberRole = (typeof RESCUE_MEMBER_ROLE)[keyof typeof RESCUE_MEMBER_ROLE];

export const RESCUE_MEMBER_ROLE_OPTIONS: Array<{ value: RescueMemberRole; label: string; hint: string }> = [
  { value: 'admin', label: 'Administrador', hint: 'Todo: perfil, equipo y animales.' },
  { value: 'coordinator', label: 'Coordinador', hint: 'Perfil y animales. No cambia el equipo.' },
  { value: 'volunteer', label: 'Voluntario', hint: 'Publica y actualiza animales; no los borra.' },
  { value: 'foster', label: 'Hogar temporal', hint: 'Forma parte del equipo y ve el espacio.' },
];

export function rescueRoleLabel(value: string | null | undefined): string {
  return RESCUE_MEMBER_ROLE_OPTIONS.find((option) => option.value === value)?.label ?? 'Miembro';
}

/** Editan el perfil público. */
export const RESCUE_PROFILE_EDITOR_ROLES: string[] = ['admin', 'coordinator'];
/** Publican y actualizan animales de la organización. */
export const RESCUE_ANIMAL_EDITOR_ROLES: string[] = ['admin', 'coordinator', 'volunteer'];

export function canEditRescueProfile(role: string | null | undefined): boolean {
  return Boolean(role && RESCUE_PROFILE_EDITOR_ROLES.includes(role));
}

export function canPublishForRescue(role: string | null | undefined): boolean {
  return Boolean(role && RESCUE_ANIMAL_EDITOR_ROLES.includes(role));
}

export function canManageRescueTeam(role: string | null | undefined): boolean {
  return role === RESCUE_MEMBER_ROLE.ADMIN;
}

/**
 * Qué animales rescata, en minúsculas y en el orden de `ANIMAL_TYPE_OPTIONS` (los mismos tipos que un
 * reporte): «perros, gatos y aves». Vacío si no eligió ninguno (rescata de todo).
 */
export function rescueSpeciesPhrase(values: string[] | null | undefined): string {
  const chosen = new Set(values ?? []);
  const labels = ANIMAL_TYPE_OPTIONS.filter((option) => chosen.has(option.value))
    .map((option) => animalTypePlural(option.value))
    .filter((label): label is string => Boolean(label));
  if (labels.length <= 1) return labels[0] ?? '';
  return `${labels.slice(0, -1).join(', ')} y ${labels[labels.length - 1]}`;
}

export const RESCUE_LIMITS = {
  NAME_MIN: 3,
  NAME_MAX: 120,
  DESCRIPTION_MAX: 2000,
  NEEDS_MAX: 1000,
  DONATION_INFO_MAX: 500,
  /** Peso máximo del logo y de la portada. */
  IMAGE_MAX_BYTES: 5 * 1024 * 1024,
};

/** Vistas del espacio en el panel: `/perfil?tab=rescate&org=<id>&vista=<clave>`. */
export const RESCUE_VIEWS = [
  {
    key: 'resumen',
    label: 'Resumen',
    title: 'Resumen del espacio',
    hint: 'Cómo va tu espacio y lo que necesita tu atención.',
  },
  {
    key: 'animales',
    label: 'Animales',
    title: 'Animales del espacio',
    hint: 'Los animales que publicaste a nombre de tu organización. Tu equipo puede actualizarlos.',
  },
  {
    key: 'equipo',
    label: 'Equipo',
    title: 'Equipo',
    hint: 'Quiénes te ayudan a administrar el espacio y qué puede hacer cada quien.',
  },
  {
    key: 'perfil',
    label: 'Perfil público',
    title: 'Perfil público',
    hint: 'Lo que ve la gente en tu página de KADESH una vez que verificamos tu espacio.',
  },
] as const;

export type RescueViewKey = (typeof RESCUE_VIEWS)[number]['key'];

export function isRescueViewKey(value: string | null | undefined): value is RescueViewKey {
  return RESCUE_VIEWS.some((view) => view.key === value);
}

export const RESCUE_MEMBER_USER_NOT_FOUND = 'RESCUE_MEMBER_USER_NOT_FOUND';
