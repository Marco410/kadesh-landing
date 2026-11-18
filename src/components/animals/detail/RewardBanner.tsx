import { HugeiconsIcon } from '@hugeicons/react';
import { Award01Icon } from '@hugeicons/core-free-icons';
import { rewardText } from 'kadesh/components/animals/reward';
import type { AnimalDetail } from './hooks/useAnimalDetail';

/**
 * «Se ofrece recompensa» en la ficha de un perdido, con el aviso antiestafa: quien busca a su
 * mascota recibe muchos mensajes falsos («la tengo, deposítame y te la regreso»).
 */
export default function RewardBanner({ animal, status }: { animal: AnimalDetail; status: string }) {
  const text = rewardText(animal, status);
  if (!text) return null;
  return (
    <div className="flex shrink-0 items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-400/30 dark:bg-amber-400/10">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[#3d2800]">
        <HugeiconsIcon icon={Award01Icon} size={18} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-[#3d2800] dark:text-amber-200 sm:text-base">{text}</p>
        <p className="mt-0.5 text-xs text-[#5c4300] dark:text-amber-100/80 sm:text-sm">
          Se entrega cuando la mascota está de vuelta con su familia. Si alguien te pide dinero por adelantado, es una
          estafa.
        </p>
      </div>
    </div>
  );
}
