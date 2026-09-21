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
import { SITE_URL } from 'kadesh/core/site';
import {
  FONT_SCALE_DEFAULT,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STORAGE_KEY,
} from 'kadesh/components/layout/font-scale';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
      <head>
        <script
          id="kadesh-font-scale"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var n=parseFloat(localStorage.getItem("${FONT_SCALE_STORAGE_KEY}")||"");if(isNaN(n))n=${FONT_SCALE_DEFAULT};if(n<${FONT_SCALE_MIN})n=${FONT_SCALE_MIN};if(n>${FONT_SCALE_MAX})n=${FONT_SCALE_MAX};document.documentElement.style.setProperty("--kadesh-font-scale",String(n));}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans bg-white dark:bg-night text-[#212121] dark:text-[#eef1f6] transition-colors duration-200">
        {/*
          THESIS: KADESH is a digital sanctuary for lost animals and local vets in Mexico; refuse a generic pet-SaaS card stack.
          OWN-WORLD: Committed #216BFA field (--color-kadesh in globals.css), Poppins black display, photographic animals, K mark.
          STORY: Visitor understands the platform, sees real reports/vets, reports or donates.
          FIRST VIEWPORT: Brand field, lema + two jobs left (nearby vets, then lost/found/adopt actions), animated map card with paw-status pins and vet pins on the right.
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
