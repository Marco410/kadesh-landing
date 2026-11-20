import {
  Bone01Icon,
  Compass01Icon,
  Crown02Icon,
  LifebuoyIcon,
  Medal01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

/**
 * Huellitas (puntos por ayudar en Kadesh Pet). Las reglas viven en kadesh-back
 * (`models/Pet/Paws/constants.ts`): aquí solo hay una copia para mostrarlas. Si allá cambian los
 * puntos o los niveles, cambia esto también. El nivel actual y el progreso los manda `myPaws`;
 * la lista completa de niveles solo sirve para pintar el camino.
 */

/** Huella con el trazo de Hugeicons (1.5), para el menú y los encabezados. */
export const PAW_ICON: IconSvgElement = [
  ["circle", { cx: "5.5", cy: "10", r: "2", stroke: "currentColor", strokeWidth: "1.5", key: "0" }],
  ["circle", { cx: "9.25", cy: "5.75", r: "2", stroke: "currentColor", strokeWidth: "1.5", key: "1" }],
  ["circle", { cx: "14.75", cy: "5.75", r: "2", stroke: "currentColor", strokeWidth: "1.5", key: "2" }],
  ["circle", { cx: "18.5", cy: "10", r: "2", stroke: "currentColor", strokeWidth: "1.5", key: "3" }],
  [
    "path",
    {
      d: "M12 12.5c-2.6 0-5.5 3.2-5.5 5.6 0 1.6 1.2 2.4 2.6 2.4 1.2 0 1.9-.6 2.9-.6s1.7.6 2.9.6c1.4 0 2.6-.8 2.6-2.4 0-2.4-2.9-5.6-5.5-5.6Z",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinejoin: "round",
      key: "4",
    },
  ],
];

export type PawLevelStep = { level: number; key: string; label: string; from: number; icon: IconSvgElement };

export const PAW_LEVELS: PawLevelStep[] = [
  { level: 1, key: "puppy", label: "Cachorro", from: 0, icon: Bone01Icon },
  { level: 2, key: "explorer", label: "Explorador", from: 30, icon: Compass01Icon },
  { level: 3, key: "guardian", label: "Guardián", from: 120, icon: Shield01Icon },
  { level: 4, key: "rescuer", label: "Rescatista", from: 350, icon: LifebuoyIcon },
  { level: 5, key: "hero", label: "Héroe", from: 900, icon: Medal01Icon },
  { level: 6, key: "legend", label: "Leyenda", from: 2000, icon: Crown02Icon },
];

/** Ícono del nivel por su `key` (la que manda el back). Uno desconocido usa la huella. */
export function pawLevelIcon(key: string): IconSvgElement {
  return PAW_LEVELS.find((step) => step.key === key)?.icon ?? PAW_ICON;
}

/** Cómo se ganan, en el orden en que se muestran. `limit` es el tope o la regla en palabras. */
export const PAW_WAYS_TO_EARN: Array<{ action: string; label: string; points: number; limit: string }> = [
  { action: "report_published", label: "Publicar un reporte", points: 15, limit: "Hasta 2 al día" },
  { action: "sighting", label: "Avisar que viste a un animal («Lo vi»)", points: 10, limit: "Hasta 3 al día, en reportes de otras personas" },
  { action: "case_closed", label: "Cerrar tu caso", points: 10, limit: "Con al menos 6 h abierto" },
  { action: "reunion_helped", label: "Su familia lo reclamó y aceptaste", points: 40, limit: "Reencuentro confirmado" },
  { action: "adoption_completed", label: "Adoptar en Kadesh", points: 30, limit: "Al completar la adopción" },
  { action: "event_approved", label: "Publicar un evento", points: 20, limit: "Cuando se aprueba" },
  { action: "comment", label: "Comentar un reporte", points: 3, limit: "Uno por reporte, 20+ caracteres" },
  { action: "review", label: "Reseñar una veterinaria", points: 5, limit: "Una por veterinaria" },
  { action: "first_pet", label: "Registrar tu primera mascota", points: 10, limit: "Una vez" },
  { action: "purchase", label: "Comprar en la tienda de Kadesh", points: 10, limit: "Por producto distinto de $100 o más, al recibirlo. Hasta 3 al día" },
  { action: "product_review", label: "Reseñar un producto que compraste", points: 5, limit: "Una por producto, con la calificación que sea. Hasta 3 al día" },
  { action: "referral", label: "Alguien que invitaste empieza a ayudar", points: 20, limit: "Una vez por persona" },
];

/** Hasta cuánto se gana al día entre reportes, avisos, cierres, comentarios y reseñas. */
export const PAW_GLOBAL_DAILY_CAP = 60;

const ACTION_LABELS: Record<string, string> = {
  report_published: "Publicaste un reporte",
  sighting: "Avisaste que viste a un animal",
  case_closed: "Cerraste un caso",
  reunion_helped: "Ayudaste a un reencuentro",
  adoption_completed: "Adoptaste en Kadesh",
  event_approved: "Se publicó tu evento",
  comment: "Comentaste un reporte",
  review: "Reseñaste una veterinaria",
  first_pet: "Registraste tu primera mascota",
  first_health_record: "Primer registro en la cartilla",
  rescue_verified: "Verificamos tu espacio de rescate",
  place_verified: "Verificamos tu veterinaria",
  referral: "Alguien que invitaste empezó a ayudar",
  purchase: "Recibiste tu compra de la tienda",
  product_review: "Reseñaste un producto que compraste",
  streak_bonus: "Bono por tu racha",
  admin_adjust: "Ajuste de Kadesh",
};

/** Texto de un movimiento del historial. Una reversa dice qué se quitó. */
export function pawActionLabel(action: string, kind: string): string {
  const label = ACTION_LABELS[action] ?? "Movimiento";
  if (kind === "reversal") return `Se quitó: ${label.charAt(0).toLowerCase()}${label.slice(1)}`;
  if (kind === "spend") return "Canjeaste huellitas";
  return label;
}

/** Cuántos movimientos trae cada página del historial (`myPaws` ya trae los primeros 20). */
export const PAW_HISTORY_PAGE = 20;

/** Avance (0–100) dentro del nivel actual. En el último nivel, 100. */
export function pawLevelProgress(
  level: { from: number; nextAt: number | null },
  lifetimeEarned: number,
): number {
  if (level.nextAt === null) return 100;
  const span = level.nextAt - level.from;
  if (span <= 0) return 0;
  return Math.min(100, Math.max(0, ((lifetimeEarned - level.from) / span) * 100));
}

/** «Te faltan 90 huellitas para Guardián.» o el mensaje del último nivel. */
export function pawProgressText(level: { level: number; nextAt: number | null }, toNextLevel: number | null): string {
  if (level.nextAt === null) return "Llegaste al nivel más alto. ¡Gracias por tanto!";
  const next = PAW_LEVELS.find((step) => step.level === level.level + 1);
  const missing = toNextLevel ?? 0;
  const amount = missing === 1 ? "falta 1 huellita" : `faltan ${missing.toLocaleString("es-MX")} huellitas`;
  return `Te ${amount} para ${next?.label ?? "el siguiente nivel"}.`;
}
