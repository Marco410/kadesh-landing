import { Routes } from 'kadesh/core/routes';

/** Keystone `@default(cuid())` ids have no hyphens; slugs always do. */
export function isAnimalKeystoneId(value: string): boolean {
  return /^c[a-z0-9]{20,}$/i.test(value);
}

export function animalDetailHref(animal: {
  id: string;
  slug?: string | null;
}): string {
  return Routes.animals.detail(animal.slug || animal.id);
}
