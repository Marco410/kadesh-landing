import { Routes } from "kadesh/core/routes";

/** Keystone `@default(cuid())` ids have no hyphens; slugs always do. */
export function isPetPlaceKeystoneId(value: string): boolean {
  return /^c[a-z0-9]{20,}$/i.test(value);
}

export function veterinaryDetailHref(place: {
  id: string;
  slug?: string | null;
}): string {
  return Routes.veterinaries.detail(place.slug || place.id);
}

export function veterinaryBookHref(place: {
  id: string;
  slug?: string | null;
}): string {
  return Routes.veterinaries.book(place.slug || place.id);
}
