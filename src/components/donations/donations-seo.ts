import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import {
  DONATIONS_FAQS,
  DONATIONS_LEAD,
  STRIPE_DONATE_URL,
} from './constants';

export const DONATIONS_BASE_URL = SITE_URL;
export const DONATIONS_PATH = Routes.donations;
export const DONATIONS_CANONICAL = `${DONATIONS_BASE_URL}${DONATIONS_PATH}`;

export const DONATIONS_PAGE_TITLE = 'Donaciones y transparencia';

export const DONATIONS_META_DESCRIPTION =
  'Las donaciones a KADESH cubren personas, servidores, dominios, difusión y casos urgentes. Recuento claro, sin cifras inventadas. Donar es opcional.';

export const DONATIONS_OG_DESCRIPTION =
  'A qué se destina una donación a KADESH en México: operación del proyecto, difusión y apoyo a casos urgentes. También recibimos patrocinios en especie.';

export function buildDonationsJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${DONATIONS_CANONICAL}#webpage`,
        url: DONATIONS_CANONICAL,
        name: DONATIONS_PAGE_TITLE,
        description: DONATIONS_META_DESCRIPTION,
        inLanguage: 'es-MX',
        dateModified: '2026-09-21',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${DONATIONS_BASE_URL}/#website`,
          name: 'KADESH',
          url: DONATIONS_BASE_URL,
          inLanguage: 'es-MX',
        },
        about: {
          '@id': `${DONATIONS_BASE_URL}/#organization`,
        },
        breadcrumb: {
          '@id': `${DONATIONS_CANONICAL}#breadcrumb`,
        },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: `${DONATIONS_BASE_URL}/og-image.png`,
        },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '#destino-respuesta'],
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${DONATIONS_CANONICAL}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: DONATIONS_BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Donaciones',
            item: DONATIONS_CANONICAL,
          },
        ],
      },
      {
        '@type': 'DonateAction',
        '@id': `${DONATIONS_CANONICAL}#donate`,
        name: 'Donar a KADESH',
        description: DONATIONS_LEAD,
        target: STRIPE_DONATE_URL,
        recipient: {
          '@type': 'Organization',
          '@id': `${DONATIONS_BASE_URL}/#organization`,
          name: 'KADESH',
          url: DONATIONS_BASE_URL,
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${DONATIONS_CANONICAL}#faq`,
        mainEntity: DONATIONS_FAQS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };
}
