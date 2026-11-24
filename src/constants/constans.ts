export const DEFAULT_ANIMALS_PER_PAGE = 12;
export const DEFAULT_RADIUS = 30;
export const RADIUS_OPTIONS_ANIMALS = [10, 20, 30, 50] as const;

export const DEFAULT_RADIUS_VETERINARIES = 5;
export const RADIUS_OPTIONS_VETERINARIES = [5, 10, 15, 20, 30] as const;

export function parseRadiusOption(
  value: string | null | undefined,
  options: readonly number[],
  fallback: number,
): number {
  const parsed = Number(value);
  return options.includes(parsed) ? parsed : fallback;
}

export const VETERINARIES_PER_PAGE = 10;
export const FETCH_LIMIT_VETERINARIES = 100;

export const KADESH_WHATSAPP = "524439382330";

export enum Role {
  ADMIN = "admin",
  USER = "user",
  AUTHOR = "author",
  ADMIN_COMPANY = "admin_company",
  VENDEDOR = "vendedor",
}
