import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conócenos',
  description: 'Conoce KADESH, la plataforma digital que conecta adoptantes, rescatistas, veterinarias y tiendas para transformar el bienestar animal en México. Descubre nuestra misión, visión, valores y cómo trabajamos por el bienestar animal.',
  keywords: [
    'KADESH',
    'bienestar animal',
    'adopción de mascotas',
    'rescate de animales',
    'veterinarias México',
    'plataforma animal',
    'comunidad animal',
    'donaciones animales',
  ],
  openGraph: {
    title: 'Conócenos | KADESH',
    description: 'Conoce KADESH, la plataforma digital que conecta adoptantes, rescatistas, veterinarias y tiendas para transformar el bienestar animal en México.',
    url: 'https://www.kadesh.com.mx/conocenos',
    siteName: 'KADESH',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conócenos | KADESH',
    description: 'Conoce KADESH, la plataforma digital que conecta adoptantes, rescatistas, veterinarias y tiendas para transformar el bienestar animal en México.',
  },
  alternates: {
    canonical: 'https://www.kadesh.com.mx/conocenos',
  },
};

export default function ConocenosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
