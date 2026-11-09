import { SITE_URL } from 'kadesh/core/site';
import { Routes } from 'kadesh/core/routes';
import { formatCurrency } from 'kadesh/utils/format-currency';
import { PROMOTION_MAX, PROMOTION_MIN } from './constants';

/** Monto válido: pesos enteros entre el mínimo y el máximo. */
export function isValidPromotionBudget(amount: number): boolean {
  return Number.isInteger(amount) && amount >= PROMOTION_MIN && amount <= PROMOTION_MAX;
}

/** Monto libre escrito por la persona: solo dígitos; `NaN` si está vacío. */
export function parsePromotionBudget(input: string): number {
  const digits = input.replace(/\D/g, '');
  return digits ? Number(digits) : Number.NaN;
}

const FOLIO_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Folio para el concepto de la transferencia y para ubicar el chat: `KP-` + los últimos 6
 * caracteres del reporte + 4 al azar (sin 0/O ni 1/I, que se confunden al dictarlo).
 */
export function promotionFolio(animal: { id: string; slug?: string | null }, random = Math.random): string {
  const key = (animal.slug || animal.id).replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase();
  const suffix = Array.from({ length: 4 }, () => FOLIO_ALPHABET[Math.floor(random() * FOLIO_ALPHABET.length)]).join('');
  return `KP-${key}-${suffix}`;
}

interface PromotionMessageInput {
  /** Nombre del animal o «este animal» si no tiene. */
  subject: string;
  folio: string;
  animal: { id: string; slug?: string | null };
  place?: string | null;
  durationDays: number;
  budget: number;
}

/** Mensaje prellenado para el WhatsApp de KADESH: la persona solo lo envía. */
export function promotionWhatsAppText({ subject, folio, animal, place, durationDays, budget }: PromotionMessageInput): string {
  return [
    `Hola, quiero impulsar el reporte de ${subject} en Facebook e Instagram.`,
    `Folio: ${folio}`,
    `Reporte: ${SITE_URL}${Routes.animals.detail(animal.slug || animal.id)}`,
    place ? `Zona: ${place}` : null,
    `Duración: ${durationDays} días`,
    `Presupuesto del anuncio: ${formatCurrency(budget)}`,
  ]
    .filter(Boolean)
    .join('\n');
}
