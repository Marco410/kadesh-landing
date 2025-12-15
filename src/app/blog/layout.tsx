import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Blog KADESH - Historias, consejos y recursos para el bienestar animal. Descubre artículos sobre adopción, rescate, cuidado de mascotas, veterinarias y más en nuestra plataforma.',
  keywords: [
    'blog bienestar animal',
    'consejos mascotas',
    'adopción de animales',
    'rescate de mascotas',
    'cuidado de animales',
    'veterinarias',
    'salud animal',
    'historias de rescate',
    'bienestar animal México',
  ],
  openGraph: {
    title: 'Blog | KADESH',
    description: 'Blog KADESH - Historias, consejos y recursos para el bienestar animal. Descubre artículos sobre adopción, rescate, cuidado de mascotas y más.',
    url: 'https://www.kadesh.com.mx/blog',
    siteName: 'KADESH',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | KADESH',
    description: 'Blog KADESH - Historias, consejos y recursos para el bienestar animal. Descubre artículos sobre adopción, rescate, cuidado de mascotas y más.',
  },
  alternates: {
    canonical: 'https://www.kadesh.com.mx/blog',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
