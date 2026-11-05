import type { Metadata } from 'next';
import JsonLd from 'kadesh/components/blog/JsonLd';
import VeterinariesDirectory from 'kadesh/components/veterinaries/VeterinariesDirectory';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';

const TITLE = 'Veterinarias cerca de ti en México';
const DESCRIPTION =
  'Directorio de veterinarias en México: urgencias 24/7, horarios, teléfono, reseñas y cómo llegar. Encuentra la más cercana y agenda una cita.';

// El directorio es de cliente (mapa, filtros, ubicación): los metadatos van aquí, en servidor.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: Routes.veterinaries.index },
  openGraph: {
    title: `${TITLE} | KADESH`,
    description: DESCRIPTION,
    url: Routes.veterinaries.index,
    siteName: 'KADESH',
    locale: 'es_MX',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} | KADESH`, description: DESCRIPTION, images: ['/og-image.png'] },
};

const url = `${SITE_URL}${Routes.veterinaries.index}`;

export default function VeterinariesPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              '@id': `${url}#page`,
              name: TITLE,
              description: DESCRIPTION,
              url,
              inLanguage: 'es-MX',
              isPartOf: { '@id': `${SITE_URL}/#website` },
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${url}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
                { '@type': 'ListItem', position: 2, name: 'Veterinarias', item: url },
              ],
            },
          ],
        }}
      />
      <VeterinariesDirectory />
    </>
  );
}
