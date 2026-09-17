/**
 * SEO y bloques extraíbles para /novedades — metadatos y JSON-LD (layout + página).
 */

export const NOVEDADES_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kadesh.com.mx';
export const NOVEDADES_PATH = '/novedades';
export const NOVEDADES_CANONICAL = `${NOVEDADES_BASE_URL}${NOVEDADES_PATH}`;

export const NOVEDADES_PAGE_TITLE = 'Novedades y versiones de la plataforma';

export const NOVEDADES_META_DESCRIPTION =
  'Historial oficial de versiones de KADESH en México: reportes de animales, directorio veterinario, citas y las notas de cada actualización ya publicada.';

export const NOVEDADES_OG_DESCRIPTION =
  'Changelog de KADESH (México): versiones publicadas, mejoras en reportes, directorio veterinario, adopciones y citas.';

export const NOVEDADES_FAQ = [
  {
    question: '¿Dónde veo las actualizaciones de KADESH?',
    answer:
      'En Novedades publicamos el historial de versiones de la plataforma de bienestar animal: cada una incluye número de versión, fecha y notas de cambio en reportes, directorio veterinario, adopciones y citas. La lista va de la más reciente a la anterior.',
  },
  {
    question: '¿Qué tipo de cambios se publican en el changelog?',
    answer:
      'Notas de versión sobre reportes de animales perdidos o en adopción, el directorio de veterinarias, reserva de citas, bitácora de rescates, perfil y mejoras de uso o seguridad. No listamos el stack interno; describimos lo que puedes hacer en la plataforma.',
  },
  {
    question: '¿Con qué frecuencia actualizan KADESH?',
    answer:
      'Publicamos una versión cuando hay funciones o correcciones relevantes para quienes reportan, adoptan o buscan una veterinaria en México. Novedades se actualiza con cada entrega publicada, de la más nueva a la anterior.',
  },
  {
    question: '¿El roadmap y las novedades son lo mismo?',
    answer:
      'No. El roadmap de la portada muestra qué ya opera, qué se construye y qué sigue. Novedades es el historial de versiones ya publicadas, con fecha y notas. El roadmap apunta aquí para quien quiere el detalle de cada entrega.',
  },
] as const;

export function buildNovedadesJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${NOVEDADES_CANONICAL}#webpage`,
        url: NOVEDADES_CANONICAL,
        name: NOVEDADES_PAGE_TITLE,
        description: NOVEDADES_META_DESCRIPTION,
        inLanguage: 'es-MX',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${NOVEDADES_BASE_URL}/#website`,
          name: 'KADESH',
          url: NOVEDADES_BASE_URL,
          inLanguage: 'es-MX',
        },
        about: {
          '@type': 'SoftwareApplication',
          name: 'KADESH',
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Web',
          url: NOVEDADES_BASE_URL,
          releaseNotes: NOVEDADES_CANONICAL,
          description:
            'Plataforma digital de bienestar animal en México: reportes, directorio veterinario, adopciones y citas.',
          areaServed: {
            '@type': 'Country',
            name: 'México',
          },
        },
        breadcrumb: {
          '@id': `${NOVEDADES_CANONICAL}#breadcrumb`,
        },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: `${NOVEDADES_BASE_URL}/og-image.png`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${NOVEDADES_CANONICAL}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: NOVEDADES_BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Novedades',
            item: NOVEDADES_CANONICAL,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${NOVEDADES_CANONICAL}#collection`,
        url: NOVEDADES_CANONICAL,
        name: 'Changelog de KADESH',
        description: NOVEDADES_META_DESCRIPTION,
        inLanguage: 'es-MX',
        isPartOf: { '@id': `${NOVEDADES_BASE_URL}/#website` },
        about: { '@id': `${NOVEDADES_CANONICAL}#webpage` },
      },
    ],
  };
}
