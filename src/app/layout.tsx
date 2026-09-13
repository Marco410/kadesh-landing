import "./globals.css";
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/900.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import ClientProviders from './ClientProviders';
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kadesh.com.mx'),
  title: {
    default: 'KADESH - Conectando vidas, rescatando almas',
    template: '%s | KADESH',
  },
  description: 'KADESH es una plataforma digital diseñada para transformar el bienestar animal en México. Conectamos personas que buscan adoptar, rescatar, o reunirse con sus mascotas perdidas, con refugios, veterinarias y tiendas especializadas en su zona.',
  keywords: [
    'KADESH',
    'bienestar animal',
    'adopción de mascotas',
    'rescate de animales',
    'mascotas perdidas',
    'veterinarias México',
    'plataforma animal',
    'comunidad animal',
    'donaciones animales',
    'refugios animales',
    'adopción responsable',
    'bienestar animal México',
  ],
  authors: [{ name: 'Marco Castañeda' }, { name: 'KADESH' }],
  creator: 'Marco Castañeda',
  publisher: 'KADESH',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
  alternates: {
    canonical: 'https://www.kadesh.com.mx/',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#216BFA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans bg-[#ffffff] dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] transition-colors duration-200">
        {/*
          THESIS: KADESH is a digital sanctuary for lost animals and local vets in Mexico; refuse a generic pet-SaaS card stack.
          OWN-WORLD: Committed #216BFA field (--color-kadesh in globals.css), Poppins black display, photographic animals, K mark.
          STORY: Visitor understands the platform, sees real reports/vets, reports or donates.
          FIRST VIEWPORT: Full-bleed brand wash, stacked lema left, K mark right, two CTAs (vets / lost animals).
          FORM: Established homepage composition, color rebrand; seed skipped — user pinned the incumbent world and #216BFA.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
        */}
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
