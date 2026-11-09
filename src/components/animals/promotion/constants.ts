/**
 * Difusión pagada de un reporte en Facebook e Instagram. Se coordina toda por WhatsApp: la app
 * no guarda la solicitud, ni comprobantes, ni datos bancarios (ver README.md).
 */

/** Montos sugeridos en pesos; también se acepta un monto libre entre el mínimo y el máximo. */
export const PROMOTION_PRESETS = [150, 300, 500] as const;
export const PROMOTION_MIN = 100;
export const PROMOTION_MAX = 5000;
export const PROMOTION_DEFAULT_BUDGET = 300;

/** Días que corre el anuncio. */
export const PROMOTION_DURATIONS = [3, 5, 7] as const;
export const PROMOTION_DEFAULT_DURATION = 5;

/** Solo reportes que siguen buscando: una mascota perdida o un animal que busca a su familia. */
export const PROMOTABLE_STATUSES = ['lost', 'found'] as const;

export type PromotableStatus = (typeof PROMOTABLE_STATUSES)[number];

export function isPromotableStatus(status: string): status is PromotableStatus {
  return (PROMOTABLE_STATUSES as readonly string[]).includes(status);
}

/**
 * Promesa de la difusión: va antes de pedir dinero. Que no parezca negocio (todo va a Meta, no es
 * donación, comprobantes y devolución) ni estafa (solo el WhatsApp oficial, nunca escribimos
 * primero para cobrar, nunca datos de tarjeta). Sin urgencias ni cifras de alcance inventadas.
 */
export const PROMOTION_PROMISES = (subject: string, foundBy: boolean) => [
  'KADESH no cobra nada por esto: el 100 % de lo que transfieras se le paga a Meta para mostrar el anuncio.',
  `No es una donación: este dinero no financia a KADESH, solo el anuncio de ${subject}.`,
  'Te mandamos por WhatsApp los comprobantes de Meta de lo gastado y cómo va la campaña: cuántas personas lo vieron y cuántas abrieron el reporte.',
  foundBy
    ? 'Si su familia aparece antes de que termine, pausamos el anuncio y te devolvemos lo que no se haya gastado.'
    : `Si ${subject} aparece antes de que termine, pausamos el anuncio y te devolvemos lo que no se haya gastado.`,
  'Un anuncio ayuda a que más gente lo vea, pero no garantiza encontrarlo.',
];

/** Lo que sigue después de enviar la solicitud por WhatsApp. */
export const PROMOTION_NEXT_STEPS = (foundBy: boolean) => [
  'Te respondemos por WhatsApp con los datos para transferir.',
  'Mándanos ahí tu comprobante de la transferencia.',
  'Publicamos el anuncio y te enviamos los comprobantes de Meta y cómo va.',
  foundBy
    ? 'Si su familia aparece, avísanos y te devolvemos lo que no se haya gastado.'
    : 'Si aparece, avísanos y te devolvemos lo que no se haya gastado.',
];
