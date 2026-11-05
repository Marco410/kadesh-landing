import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Routes } from 'kadesh/core/routes';

const TITLE = 'Reporta gratis una mascota perdida o encontrada';
const DESCRIPTION =
  'Sube su foto y el último lugar donde la viste. La ponemos en el mapa de tu zona, avisamos a quienes tienen alertas cerca y la compartimos en Facebook. Gratis.';

// El formulario es de cliente: sus metadatos van aquí (no afecta a otras rutas).
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: Routes.animals.new },
  openGraph: {
    title: `${TITLE} | KADESH`,
    description: DESCRIPTION,
    url: Routes.animals.new,
    siteName: 'KADESH',
    locale: 'es_MX',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: TITLE }],
  },
};

export default function NewAnimalLayout({ children }: { children: ReactNode }) {
  return children;
}
