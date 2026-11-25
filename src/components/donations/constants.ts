/**
 * Old payment link. Used only while «Dame una patita» is off (`DONATIONS_ENABLED` false), so
 * nothing breaks before the backend is deployed.
 */
export const STRIPE_DONATE_URL =
  'https://donate.stripe.com/6oU7sL6467dtdrY9FZgUM00';

// ─── «Dame una patita» ───────────────────────────────────────────────────────────────────────
// A patita is the donation unit. Not to be confused with huellitas (`components/paws`, points).

/** `true` once kadesh-back has `DONATIONS_ENABLED=true`. Off: every button opens the old link. */
export const DONATIONS_ENABLED = process.env.NEXT_PUBLIC_DONATIONS_ENABLED === 'true';

/** Same values as `models/Pet/Donation/constants.ts` in kadesh-back. */
export const DONATION_UNIT_PRICE_CENTS = 2500;
export const DONATION_UNIT_PRESETS = [1, 3, 5] as const;
export const MAX_DONATION_UNITS = 400;
export const DONATION_NAME_MAX = 60;
export const DONATION_MESSAGE_MAX = 280;

/** Wall of messages and donor top: server fetch every 10 min (the backend caches the same). */
export const DONATIONS_REVALIDATE_SECONDS = 600;
export const DONATION_WALL_PAGE = 20;
export const DONATION_WALL_HOME = 3;
export const DONOR_RANKING_TAKE = 10;

/**
 * An empty wall says «nobody donates». The wall page and its links show from this many paid
 * donations with a visible message (`donationSummary.wallMessages`); before that, only the button.
 */
export const WALL_MIN_MESSAGES = 5;
/** The podium shows from this many donors with a name in the period; below it, a plain list. */
export const PODIUM_MIN_NAMED = 3;
/** Name the back gives anonymous donors (never counted as «with a name»). */
export const ANONYMOUS_DONOR_NAME = 'Alguien anónimo';

export function isWallReady(summary: { wallMessages?: number | null } | null | undefined): boolean {
  return DONATIONS_ENABLED && (summary?.wallMessages ?? 0) >= WALL_MIN_MESSAGES;
}

export function namedDonors(rows: Array<{ displayName: string }>): number {
  return rows.filter((row) => row.displayName !== ANONYMOUS_DONOR_NAME).length;
}

/** A dismissed in-page strip stays hidden this long (per browser). */
export const DONATION_STRIP_DISMISS_MS = 30 * 24 * 60 * 60 * 1000;
export const DONATION_STRIP_DISMISS_KEY = 'kadesh-donation-strip-dismissed';

export const DONATION_CTA_LABEL = 'Dame una patita';

const MXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

/** «$75 MXN»: always with the currency, so nobody reads dollars. */
export function formatDonationAmount(units: number): string {
  return `${MXN.format((units * DONATION_UNIT_PRICE_CENTS) / 100)} MXN`;
}

export function patitasLabel(units: number): string {
  return `${units} ${units === 1 ? 'patita' : 'patitas'}`;
}

export const DONATIONS_UPDATED_LABEL = 'Actualizado en septiembre de 2026.';

export const DONATIONS_LEAD =
  'Las donaciones cubren los gastos de este proyecto: personas que lo operan, servidores, dominios y las herramientas para que reportes y el directorio funcionen. También van a difusión, para que más gente vea un animal perdido, y a apoyo de casos urgentes. Donar es opcional y no es requisito para usar KADESH.';

export const DONATION_DESTINATIONS = [
  {
    title: 'Personas que operan KADESH',
    body: 'Quienes mantienen la plataforma, responden, moderan reportes y sostienen el día a día. Sin ese trabajo, el santuario digital no se actualiza ni atiende a quien busca un animal o una veterinaria.',
  },
  {
    title: 'Servidores, dominios y herramientas',
    body: 'Hosting, dominio, correo, mapas y el resto de la infraestructura para que KADESH esté en línea. Cada donación ayuda a pagar esas cuentas, no a un albergue ajeno al proyecto.',
  },
  {
    title: 'Difusión',
    body: 'Para que un reporte perdido, una adopción o el directorio lleguen a más personas en México. La difusión es parte de la misión: una ficha que nadie ve no reúne a nadie.',
  },
  {
    title: 'Apoyo a casos urgentes',
    body: 'Cuando un rescate necesita ayuda ya —alimento, consulta o traslado— una parte de lo recaudado puede destinarse a ese caso. No prometemos un monto fijo por donación; sí que ese apoyo existe como destino.',
  },
] as const;

export const DONATIONS_FAQS = [
  {
    question: '¿A qué se destina una donación a KADESH?',
    answer: DONATIONS_LEAD,
  },
  {
    question: '¿Las donaciones van a un albergue o a un animal en concreto?',
    answer:
      'Van a KADESH como proyecto: operación, difusión y, cuando aplica, apoyo a un caso urgente. No son un pago a un refugio nombrado ni un padrón de un animal, salvo que en un caso puntual lo indiquemos así. El recuento de destinos está en esta página.',
  },
  {
    question: '¿Hay que donar para reportar o buscar animales?',
    answer:
      'No. Reportar, consultar el directorio y leer el blog forman parte de la plataforma pública. La donación es voluntaria y no desbloquea funciones comunitarias.',
  },
  {
    question: '¿Puedo apoyar sin donar dinero?',
    answer:
      'Sí. Marcas y tiendas de mascotas pueden aportar en especie: alimento, consulta, espacio o difusión. Quien quiera acompañar a largo plazo puede sumarse como fundador. En ambos casos, escríbenos desde Contacto con el asunto Patrocinio o Fundador.',
  },
  {
    question: '¿Cuándo veré un recuento en pesos?',
    answer:
      'Hoy publicamos a qué se destina cada aportación, no un estado financiero. No inventamos cifras. Cuando cerremos un periodo con números verificables, los pondremos en esta misma página.',
  },
] as const;
