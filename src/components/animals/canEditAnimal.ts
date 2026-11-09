import { Role } from "kadesh/constants/constans";

type UserLike = { id?: string | null; roles?: Array<{ name?: string | null }> | null } | null | undefined;
type AnimalLike = {
  user?: { id?: string | null } | null;
  /** Lo calcula kadesh-back con la sesión: incluye al equipo del espacio de rescate. */
  viewerCanEdit?: boolean | null;
} | null | undefined;

/**
 * Quién puede editar un animal (ficha, fotos y etapas): su autor, el equipo del espacio de rescate
 * a cuyo nombre se publicó (admin, coordinador o voluntario) o un admin de plataforma. Es la misma
 * regla que aplica kadesh-back (`models/Pet/Animal/Animal.access.ts`); aquí solo decide qué se
 * muestra. El equipo llega por `viewerCanEdit` (el front no conoce a los miembros). El admin llega
 * desde Operaciones → Kadesh Pet → Animales → Editar.
 */
export function canEditAnimal(user: UserLike, animal: AnimalLike): boolean {
  if (!user?.id) return false;
  if (user.roles?.some((role) => role.name === Role.ADMIN)) return true;
  if (animal?.user?.id && animal.user.id === user.id) return true;
  return Boolean(animal?.viewerCanEdit);
}
