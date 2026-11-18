/**
 * Recompensa de un reporte (kadesh-back `Animal.rewardOffered` / `rewardAmount`). Solo cuenta en
 * perdidos: si el caso cambió de estado, ya no se muestra aunque siga guardada.
 */
export type RewardSource = { rewardOffered?: boolean | null; rewardAmount?: number | null };

/** 2000 → «$2,000». */
export function formatPesos(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

/** «Se ofrece recompensa: $2,000», «Se ofrece recompensa» o null. */
export function rewardText(animal: RewardSource, status: string | null | undefined): string | null {
  if (status !== 'lost' || !animal.rewardOffered) return null;
  return animal.rewardAmount && animal.rewardAmount > 0
    ? `Se ofrece recompensa: ${formatPesos(animal.rewardAmount)}`
    : 'Se ofrece recompensa';
}

/** Para el cartel: «RECOMPENSA $2,000» o «SE OFRECE RECOMPENSA» (en mayúsculas por CSS). */
export function rewardPosterText(animal: RewardSource, status: string | null | undefined): string | null {
  if (status !== 'lost' || !animal.rewardOffered) return null;
  return animal.rewardAmount && animal.rewardAmount > 0
    ? `Recompensa ${formatPesos(animal.rewardAmount)}`
    : 'Se ofrece recompensa';
}
