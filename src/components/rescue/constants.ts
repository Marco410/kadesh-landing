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
  { value: 'volunteer', label: 'Voluntario', hint: 'Publica y actualiza animales y sus fichas; no los borra.' },
  { value: 'foster', label: 'Hogar temporal', hint: 'Ve y actualiza la ficha de los animales que tiene en casa.' },
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

/** Borran fichas, asignan hogar temporal y completan adopciones (igual que el backend). */
export const RESCUE_ANIMAL_MANAGER_ROLES: string[] = ['admin', 'coordinator'];

export function canManageRescueAnimals(role: string | null | undefined): boolean {
  return Boolean(role && RESCUE_ANIMAL_MANAGER_ROLES.includes(role));
}

/** Etapa de un animal en la ficha interna del espacio. Mismos valores que el backend (`Pet.stage`). */
export const PET_RESCUE_STAGE = {
  INTAKE: 'intake',
  TREATMENT: 'treatment',
  FOSTER: 'foster',
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  SANCTUARY: 'sanctuary',
} as const;

export const PET_RESCUE_STAGE_OPTIONS: Array<{ value: string; label: string; tone: string }> = [
  { value: 'intake', label: 'Recién llegado', tone: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200' },
  { value: 'treatment', label: 'En tratamiento', tone: 'bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200' },
  { value: 'foster', label: 'En hogar temporal', tone: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200' },
  { value: 'available', label: 'Listo para adopción', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200' },
  { value: 'reserved', label: 'Apartado', tone: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200' },
  { value: 'sanctuary', label: 'Se queda en el espacio', tone: 'bg-dash-surface-2 text-dash-soft' },
];

export function rescueStage(value: string | null | undefined) {
  return PET_RESCUE_STAGE_OPTIONS.find((option) => option.value === value) ?? null;
}

/** Con qué estado se publica una ficha (`publishRescuePet`). */
export const RESCUE_PUBLISH_STATUS_OPTIONS = [
  { value: 'in_adoption', label: 'En adopción', hint: 'Busca familia: aparece en adopciones y en tu perfil.' },
  { value: 'rescued', label: 'Rescatado', hint: 'Avisa que lo rescataron; aún no está listo para adopción.' },
] as const;

export type RescuePublishStatus = (typeof RESCUE_PUBLISH_STATUS_OPTIONS)[number]['value'];

/** `code` de `completeRescueAdoption` cuando el correo no tiene cuenta. */
export const RESCUE_ADOPTER_NOT_FOUND = 'RESCUE_ADOPTER_NOT_FOUND';

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
    key: 'fichas',
    label: 'Fichas',
    title: 'Fichas de los animales',
    hint: 'La cartilla de cada animal que tienen a su cargo: vacunas, recordatorios, etapa y hogar temporal. Solo la ve tu equipo.',
  },
  {
    key: 'animales',
    label: 'Publicados',
    title: 'Animales publicados',
    hint: 'Los reportes públicos a nombre de tu organización. Tu equipo puede actualizarlos.',
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
