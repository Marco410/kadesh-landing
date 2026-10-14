import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import { kadeshWhatsAppUrl } from 'kadesh/utils/kadeshWhatsApp';

/** Poner en false cuando ya haya 5 negocios fundadores: oculta el banner, el paquete Fundador y la mención en la portada. */
export const SHOW_FOUNDER_OFFER = true;

/** Lugares de fundador disponibles. Se actualiza a mano; en null no se muestra «Quedan N lugares». */
export const FOUNDER_SPOTS_LEFT: number | null = 10;

export const ADVERTISE_PAGE_TITLE = 'Anúnciate en Kadesh Pet';
export const ADVERTISE_META_DESCRIPTION =
  'Que los dueños de mascotas de tu colonia te conozcan. Aparece en las fichas de mascotas y veterinarias de Kadesh Pet desde $99 al mes, sin contratos.';

const SOURCE = `${SITE_URL.replace(/^https?:\/\//, '')}${Routes.advertise}`;

/** Cada botón dice qué paquete eligieron y de dónde vienen, para saberlo desde el primer mensaje. */
export function advertiseWhatsAppUrl(message: string) {
  return kadeshWhatsAppUrl(`${message} ¿Me pueden dar información?\nLo vi en: ${SOURCE}`);
}

export const ADVERTISE_GENERAL_MESSAGE = 'Hola, me gustaría anunciar mi negocio en KADESH Pet.';

export const BENEFITS = [
  {
    title: 'Donde está la comunidad.',
    body: 'Dueños de mascotas de tu ciudad leen y comparten nuestras publicaciones de reportes y reencuentros en Facebook.',
  },
  {
    title: 'Sin competir por espacio.',
    body: 'Un solo anuncio por vista: cuando apareces, eres el único negocio en esa página.',
  },
  {
    title: 'Nunca junto a tu competencia.',
    body: 'En la ficha de una veterinaria nunca mostramos anuncios de otra veterinaria.',
  },
  {
    title: 'Publicidad con propósito.',
    body: 'Tu marca aparece como negocio que apoya el rescate animal, no como un anuncio más.',
  },
] as const;

export const PLANS = [
  {
    name: 'Mi ficha destacada',
    audience: 'Veterinarias registradas en Kadesh Pet',
    price: '$99',
    priceNote: 'MXN / mes',
    features: [
      'Tu promoción en tu propia ficha',
      'Sin anuncios de terceros en tu página',
      'Cambias la promoción cada mes',
    ],
    message: 'Hola, tengo una veterinaria y me interesa Mi ficha destacada en KADESH Pet.',
    cta: 'Quiero mi ficha destacada',
    featured: false,
    founder: false,
  },
  {
    name: 'Comunidad',
    audience: 'Negocios que quieren que su ciudad los conozca',
    price: '$199',
    priceNote: 'MXN / mes',
    features: [
      '3 menciones al mes en nuestras publicaciones de Facebook',
      'Tu anuncio en las fichas de la web',
      'Reporte mensual de vistas y clics',
      'Te ayudamos a diseñar tu anuncio',
    ],
    message: 'Hola, me interesa el paquete Comunidad para anunciar mi negocio en KADESH Pet.',
    cta: 'Quiero aparecer en mi ciudad',
    featured: true,
    founder: false,
  },
  {
    name: 'Fundador',
    audience: 'Los primeros 5 negocios que nos apoyan',
    price: 'Gratis',
    priceNote: 'mientras crecemos',
    features: [
      'Tu anuncio en las fichas de animales y veterinarias',
      'Botón a tu WhatsApp, web o llamada',
      'Apareces como «Negocio que apoya KADESH Pet»',
    ],
    message: 'Hola, me interesa ser negocio Fundador en KADESH Pet.',
    cta: 'Quiero ser fundador',
    featured: false,
    founder: true,
  },
] as const;

export const STEPS = [
  { title: 'Escríbenos.', body: 'Cuéntanos por WhatsApp de tu negocio, tu zona y qué quieres promover.' },
  { title: 'Envía tu material.', body: 'Tu logo o una foto, un título corto y a dónde quieres que te contacten.' },
  { title: 'Revisa tu anuncio.', body: 'Lo diseñamos con el estilo de Kadesh Pet y te lo mostramos antes de publicar.' },
  { title: 'Publicamos y medimos.', body: 'Te mandamos una captura en vivo y, cada mes, tus vistas y clics.' },
] as const;

export const ACCEPTED = [
  'Veterinarias y clínicas',
  'Tiendas de mascotas y alimento',
  'Estéticas, pensiones y guarderías',
  'Adiestradores y paseadores',
  'Collares GPS, placas y seguros para mascotas',
  'Otros negocios locales',
] as const;

export const REJECTED = [
  'Venta o cría de animales',
  'Rifas o regalos de mascotas',
  'Productos milagro o medicamentos sin receta',
  'Contenido que vaya contra el rescate y la adopción',
] as const;

export const ADVERTISE_FAQS = [
  {
    question: '¿Por qué hay anuncios en Kadesh Pet?',
    answer:
      'Reportar y buscar mascotas es gratis. Mantener la plataforma cuesta: servidores, mapas, fotos y avisos. Los anuncios cubren parte de ese costo.',
  },
  {
    question: '¿Hay contrato?',
    answer: 'No. Pagas mes a mes y cancelas cuando quieras.',
  },
  {
    question: '¿Necesito tener diseño listo?',
    answer: 'No. Con tu logo o una foto y un título corto, nosotros lo armamos.',
  },
  {
    question: '¿Cómo sé si funciona?',
    answer: 'Cada mes te mandamos tus vistas y clics.',
  },
] as const;
