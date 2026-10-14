import { Role } from "kadesh/constants/constans";

type UserLike = { id?: string | null; roles?: Array<{ name?: string | null }> | null } | null | undefined;
type AnimalLike = { user?: { id?: string | null } | null } | null | undefined;

/**
 * Quién puede editar un animal (ficha, fotos y etapas): su dueño o un admin de plataforma.
 * Es la misma regla que aplica kadesh-back (`models/Pet/Animal/Animal.access.ts`); aquí solo
 * decide qué se muestra. El admin llega desde Operaciones → Kadesh Pet → Animales → Editar.
 */
export function canEditAnimal(user: UserLike, animal: AnimalLike): boolean {
  if (!user?.id) return false;
  if (user.roles?.some((role) => role.name === Role.ADMIN)) return true;
  return Boolean(animal?.user?.id && animal.user.id === user.id);
}
