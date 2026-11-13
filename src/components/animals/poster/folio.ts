import { SITE_URL } from 'kadesh/core/site';
import { Routes } from 'kadesh/core/routes';

/**
 * Folio del cartel (`Animal.folio` en kadesh-back, un entero que asigna Postgres). Se muestra como
 * KP-01234 y el QR apunta a `/f/{folio}`: una URL corta (QR más simple, se escanea mejor impreso) que
 * no cambia aunque cambie el slug.
 */
export function formatFolio(folio: number | null | undefined): string | null {
  if (!folio || !Number.isInteger(folio) || folio < 1) return null;
  return `KP-${String(folio).padStart(5, '0')}`;
}

/** Acepta «1234», «KP-01234» o «kp01234». */
export function parseFolio(raw: string | null | undefined): number | null {
  const match = /^(?:kp-?)?0*(\d{1,9})$/i.exec((raw ?? '').trim());
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

export function folioUrl(folio: number): string {
  return `${SITE_URL}${Routes.animals.folio(folio)}`;
}

/** Lo que se imprime bajo el QR, sin `https://`. */
export function folioDisplayUrl(folio: number): string {
  return folioUrl(folio).replace(/^https?:\/\//, '');
}

/**
 * URL del cartel con sus opciones. Solo lleva parámetros lo que no es el valor por defecto
 * (teléfono visible y formato vertical), así la URL base sigue siendo la del botón de la ficha.
 */
export function posterHref(key: string, options: { phone: boolean; landscape: boolean }): string {
  const params = new URLSearchParams();
  if (!options.phone) params.set('telefono', '0');
  if (options.landscape) params.set('formato', 'horizontal');
  const search = params.toString();
  return `${Routes.animals.poster(key)}${search ? `?${search}` : ''}`;
}

/** Titular del cartel según el estatus. */
export function posterHeadline(status: string): string {
  switch (status) {
    case 'lost':
      return 'SE BUSCA';
    case 'found':
      return '¿ES TUYO?';
    case 'rescued':
      return 'RESCATADO';
    case 'abandoned':
      return '¿LO CONOCES?';
    case 'in_adoption':
      return 'EN ADOPCIÓN';
    default:
      return 'AYÚDANOS';
  }
}

/** Qué se le pide a quien ve el cartel. */
export function posterCallToAction(status: string): string {
  switch (status) {
    case 'lost':
      return 'Si lo viste, escanea el código y avisa. Cualquier dato ayuda.';
    case 'found':
      return 'Si es tu mascota o sabes de quién es, escanea el código.';
    case 'in_adoption':
      return 'Busca hogar. Escanea el código para conocerlo.';
    default:
      return 'Escanea el código para ver el reporte y ayudar.';
  }
}

/** Estatus en los que tiene sentido un cartel (casos abiertos). */
export const POSTER_STATUSES = ['lost', 'found', 'rescued', 'abandoned', 'in_adoption'];
