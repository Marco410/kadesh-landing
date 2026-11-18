"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { useUiMotion } from 'kadesh/components/shared/motion';

/** Mismo tope que kadesh-back (`REWARD_MAX_MXN` en `models/Pet/Animal/Animal.ts`). */
export const REWARD_MAX_MXN = 1_000_000;

/** «2,000» o «$2 000» → 2000. Vacío → null. Inválido → NaN. */
export function parseRewardAmount(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return raw.trim() ? Number.NaN : null;
  return Number.parseInt(digits, 10);
}

/** Error del monto, o null si está bien (vacío también está bien: el monto es opcional). */
export function rewardAmountError(raw: string): string | null {
  const amount = parseRewardAmount(raw);
  if (amount === null) return null;
  if (!Number.isFinite(amount) || amount < 1) return 'Escribe el monto en pesos, o déjalo vacío.';
  if (amount > REWARD_MAX_MXN) return 'El monto es demasiado alto.';
  return null;
}

interface RewardFieldProps {
  offered: boolean;
  amount: string;
  onOfferedChange: (offered: boolean) => void;
  onAmountChange: (amount: string) => void;
  error?: string | null;
}

/**
 * «Ofrezco recompensa» en el reporte de una mascota perdida. El monto es opcional: sin él, el
 * cartel y la ficha dicen «Se ofrece recompensa». Lleva el aviso antiestafa: la recompensa se
 * entrega al recuperar a la mascota, nunca por adelantado.
 */
export default function RewardField({ offered, amount, onOfferedChange, onAmountChange, error }: RewardFieldProps) {
  const motionPrefs = useUiMotion();
  return (
    <div className="mt-4 rounded-xl bg-[#f3f5f8] p-3 dark:bg-night">
      <label className="flex items-start gap-3 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
        <input
          type="checkbox"
          checked={offered}
          onChange={(e) => onOfferedChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[#d8dee8] text-kadesh focus:ring-kadesh"
        />
        <span>
          Ofrezco recompensa
          <span className="block text-xs font-normal text-[#5a5a5a] dark:text-[#9aa3b2]">
            Sale en la ficha y en el cartel. Opcional.
          </span>
        </span>
      </label>
      <AnimatePresence initial={false}>
        {offered ? (
          <motion.div
            variants={motionPrefs.expand}
            initial={motionPrefs.expand ? 'hidden' : false}
            animate="show"
            exit="hidden"
            className="mt-3 pl-7"
          >
            <label htmlFor="rewardAmount" className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
              Monto en pesos, si quieres publicarlo
            </label>
            <div className="relative max-w-[12rem]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#5a5a5a]">$</span>
              <input
                id="rewardAmount"
                type="text"
                inputMode="numeric"
                maxLength={9}
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="2,000"
                className={`w-full rounded-xl border border-[#d8dee8] bg-white py-2.5 pl-7 pr-3 text-sm text-[#121212] focus:border-kadesh focus:outline-none focus:ring-2 focus:ring-kadesh/30 dark:border-white/15 dark:bg-night-raised dark:text-[#eef1f6] ${
                  error ? 'ring-1 ring-red-500' : ''
                }`}
              />
            </div>
            {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
            <p className="mt-2 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
              Entrégala solo cuando tengas a tu mascota contigo. Nunca pagues por adelantado: es la estafa más común.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
