const MONEY = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const MONEY_WHOLE = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

/** MXN cents → "$1,250" (or "$1,250.50" when it has cents). */
export function formatPrice(cents: number | null | undefined): string {
  if (cents == null) return '';
  return cents % 100 === 0 ? MONEY_WHOLE.format(cents / 100) : MONEY.format(cents / 100);
}

/** Whole percent off, or `null` when there is no real discount. */
export function discountPercent(priceCents: number, compareAtPriceCents: number | null): number | null {
  if (!compareAtPriceCents || compareAtPriceCents <= priceCents) return null;
  const percent = Math.round(((compareAtPriceCents - priceCents) / compareAtPriceCents) * 100);
  return percent > 0 ? percent : null;
}

/** "4.5" with one decimal, es-MX. */
export function formatRating(average: number): string {
  return average.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function reviewsCountText(count: number): string {
  if (count === 0) return 'Sin reseñas todavía';
  return `${count.toLocaleString('es-MX')} ${count === 1 ? 'reseña' : 'reseñas'}`;
}

/** "12 de noviembre de 2026", in Mexico City time. */
export function formatStoreDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Mexico_City',
  });
}
