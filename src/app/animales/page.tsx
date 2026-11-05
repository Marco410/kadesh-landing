import type { Metadata } from 'next';
import AnimalsDirectory from 'kadesh/components/animals/AnimalsDirectory';
import JsonLd from 'kadesh/components/blog/JsonLd';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';

const TITLE = 'Mascotas perdidas y en adopción en México';
const DESCRIPTION =
  'Mapa de mascotas perdidas, encontradas y en adopción en México. Busca cerca de ti, reporta gratis y avisa a quien la reportó.';

// El directorio es de cliente (mapa, filtros, ubicación): los metadatos van aquí, en servidor.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: Routes.animals.index },
  openGraph: {
    title: `${TITLE} | KADESH`,
    description: DESCRIPTION,
    url: Routes.animals.index,
    siteName: 'KADESH',
    locale: 'es_MX',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} | KADESH`, description: DESCRIPTION, images: ['/og-image.png'] },
};

const url = `${SITE_URL}${Routes.animals.index}`;

export default function AnimalsPage() {
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
                { '@type': 'ListItem', position: 2, name: 'Animales', item: url },
              ],
            },
          ],
        }}
      />
      <AnimalsDirectory />
    </>
  );
}
