import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';

/** Caracteres del código sin guion (igual que el backend, `PET_TRANSFER_CODE_LENGTH`). */
export const TRANSFER_CODE_LENGTH = 8;

/** «7kq2 m9xa», «7KQ2-M9XA» → «7KQ2M9XA». */
export function normalizeTransferCode(raw: string): string {
  return raw.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, TRANSFER_CODE_LENGTH);
}

/** «7KQ2M9XA» → «7KQ2-M9XA», para leerlo y dictarlo. */
export function formatTransferCode(code: string): string {
  const clean = normalizeTransferCode(code);
  return clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
}

/** Enlace que abre «Recibir con código» con el código ya escrito (pide iniciar sesión si hace falta). */
export function transferShareUrl(code: string): string {
  return `${SITE_URL}${Routes.profilePetsReceive(formatTransferCode(code))}`;
}

export function transferWhatsAppUrl(code: string, petName: string): string {
  const text = `Te paso a ${petName} en KADESH con su cartilla. Entra aquí y acepta: ${transferShareUrl(code)} (código ${formatTransferCode(code)}).`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
