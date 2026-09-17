import type { Metadata } from 'next';
import {
  NOVEDADES_CANONICAL,
  NOVEDADES_META_DESCRIPTION,
  NOVEDADES_OG_DESCRIPTION,
  NOVEDADES_PAGE_TITLE,
  buildNovedadesJsonLd,
} from 'kadesh/components/changelog/novedades-seo';

export const metadata: Metadata = {
  title: NOVEDADES_PAGE_TITLE,
  description: NOVEDADES_META_DESCRIPTION,
  openGraph: {
    title: `${NOVEDADES_PAGE_TITLE} | KADESH`,
    description: NOVEDADES_OG_DESCRIPTION,
    url: NOVEDADES_CANONICAL,
    siteName: 'KADESH',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KADESH — Novedades y changelog de la plataforma de bienestar animal en México',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${NOVEDADES_PAGE_TITLE} | KADESH`,
    description: NOVEDADES_OG_DESCRIPTION,
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: NOVEDADES_CANONICAL,
  },
};

export default function NovedadesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildNovedadesJsonLd()),
        }}
      />
      {children}
    </>
  );
}
