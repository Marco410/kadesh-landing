import { HOME_DEFINITION, HOME_FAQS, SITE_URL } from 'kadesh/components/home/constants';

const graph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'KADESH',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
      description: HOME_DEFINITION,
      founder: {
        '@type': 'Person',
        '@id': `${SITE_URL}/#founder`,
        name: 'Marco Castañeda',
        jobTitle: 'Ingeniero',
      },
      areaServed: {
        '@type': 'Country',
        name: 'México',
      },
      knowsAbout: [
        'Bienestar animal',
        'Adopción de mascotas',
        'Rescate de animales',
        'Veterinarias',
        'Donaciones para animales',
      ],
      sameAs: [
        'https://www.facebook.com/profile.php?id=61576878181992',
        'https://www.instagram.com/kadesh.pet/',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Soporte al cliente',
        url: `${SITE_URL}/contacto`,
        areaServed: 'MX',
        availableLanguage: 'Spanish',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'KADESH',
      url: SITE_URL,
      description: HOME_DEFINITION,
      inLanguage: 'es-MX',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: 'KADESH — Conectando vidas, rescatando almas',
      description: HOME_DEFINITION,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'es-MX',
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: HOME_FAQS.map((item) => ({
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

export default function HomeJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
