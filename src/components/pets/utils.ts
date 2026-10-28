import { ANIMAL_SEX_OPTIONS, ANIMAL_TYPE_LABELS } from 'kadesh/components/animals/constants';
import type { PetSummary } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Mensaje para la persona. Keystone manda las validaciones como
 * "You provided invalid data…\n  - Pet: <mensaje>"; se queda solo el mensaje.
 */
export function petErrorMessage(error: unknown, fallback = 'No se pudo guardar. Intenta de nuevo.'): string {
  let raw = '';
  if (error && typeof error === 'object' && 'graphQLErrors' in error) {
    raw = (error as { graphQLErrors?: { message?: string }[] }).graphQLErrors?.[0]?.message ?? '';
  }
  if (!raw && error instanceof Error) raw = error.message;
  const bullet = raw.split('\n').find((line) => /^\s*-\s/.test(line));
  const message = (bullet ? bullet.replace(/^\s*-\s*[^:]+:\s*/, '') : raw.split('\n')[0]).trim();
  if (!message || /prisma|graphql|keystone|access denied|you provided|you cannot|failed to fetch|variable "\$/i.test(message)) {
    return fallback;
  }
  return message;
}

/** `extensions.code` del primer error de GraphQL, si viene. */
export function graphqlErrorCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'graphQLErrors' in error) {
    const code = (error as { graphQLErrors?: { extensions?: { code?: unknown } }[] }).graphQLErrors?.[0]
      ?.extensions?.code;
    return typeof code === 'string' ? code : null;
  }
  return null;
}

/** Hoy en la zona del navegador como "AAAA-MM-DD" (para inputs de fecha). */
export function todayYmd(): string {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

function ymdToUtc(ymd: string): number {
  return Date.parse(`${ymd.slice(0, 10)}T00:00:00Z`);
}

/** Días de hoy a la fecha: 0 hoy, negativo si ya pasó. */
export function daysUntil(ymd: string): number {
  return Math.round((ymdToUtc(ymd) - ymdToUtc(todayYmd())) / DAY_MS);
}

/** "23 oct 2026" (o sin año si es este año). */
export function formatDay(ymd: string | null | undefined): string {
  if (!ymd) return '';
  const date = new Date(ymdToUtc(ymd));
  if (Number.isNaN(date.getTime())) return '';
  const sameYear = date.getUTCFullYear() === new Date().getFullYear();
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
    timeZone: 'UTC',
  });
}

/** "Hoy", "Mañana", "En 5 días", "Hace 2 días". */
export function relativeDueLabel(ymd: string): string {
  const days = daysUntil(ymd);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days === -1) return 'Ayer';
  if (days > 1) return `En ${days} días`;
  return `Hace ${Math.abs(days)} días`;
}

export type DueTone = 'overdue' | 'soon' | 'later';

/** Rojo si ya pasó, ámbar si es en 7 días o menos. */
export function dueTone(ymd: string): DueTone {
  const days = daysUntil(ymd);
  if (days < 0) return 'overdue';
  if (days <= 7) return 'soon';
  return 'later';
}

export const DUE_TONE_CLASS: Record<DueTone, string> = {
  overdue: 'text-red-600 dark:text-red-400',
  soon: 'text-amber-700 dark:text-amber-300',
  later: 'text-[#5a5a5a] dark:text-[#9aa3b2]',
};

export function speciesLabel(name: string | null | undefined): string {
  if (!name) return '';
  return ANIMAL_TYPE_LABELS[name] || name;
}

export function sexLabel(value: string | null | undefined): string {
  return ANIMAL_SEX_OPTIONS.find((option) => option.value === value)?.label ?? '';
}

/** Edad para mostrar: la calculada si hay fecha, si no la aproximada. */
export function petAgeText(pet: Pick<PetSummary, 'birthday' | 'approximateAge' | 'age'>): string {
  if (pet.birthday && pet.age !== null && pet.age !== undefined && pet.age !== '') {
    const years = Number(pet.age);
    if (years >= 1) return `${years} ${years === 1 ? 'año' : 'años'}`;
    const days = -daysUntil(pet.birthday);
    const months = Math.floor(days / 30.44);
    if (months >= 1) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    return 'Menos de 1 mes';
  }
  return pet.approximateAge?.trim() || '';
}

export function petSubtitle(pet: PetSummary): string {
  return [speciesLabel(pet.animal_type?.name), pet.animal_breed?.breed, petAgeText(pet)]
    .filter(Boolean)
    .join(' · ');
}
