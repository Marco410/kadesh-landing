import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kadesh.com.mx'),
  title: {
    default: 'KADESH - Conectando vidas, rescatando almas',
    template: '%s | KADESH',
  },
  description: 'KADESH es una plataforma digital diseñada para transformar el bienestar animal en México. Conectamos personas que buscan adoptar, rescatar, o reunirse con sus mascotas perdidas, con refugios, veterinarias y tiendas especializadas en su zona.',
  openGraph: {
    title: 'KADESH - Conectando vidas, rescatando almas',
    description: 'KADESH es la plataforma para conectar adoptantes, rescatistas, veterinarias y tiendas para el bienestar animal real en México.',
    url: 'https://www.kadesh.com.mx/',
    siteName: 'KADESH',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KADESH - Conectando vidas, rescatando almas',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KADESH - Conectando vidas, rescatando almas',
    description: 'KADESH es la plataforma para conectar adoptantes, rescatistas, veterinarias y tiendas para el bienestar animal real en México.',
    images: ['/og-image.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};
