import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Routes } from 'kadesh/core/routes';

const TITLE = 'Registra tu veterinaria gratis';
const DESCRIPTION =
  'Aparece en el directorio de veterinarias de KADESH: horarios, servicios, urgencias, reseñas y citas en línea. Registro gratis para clínicas de México.';

// El formulario es de cliente: sus metadatos van aquí (no afecta a otras rutas).
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: Routes.veterinaries.register },
  openGraph: {
    title: `${TITLE} | KADESH`,
    description: DESCRIPTION,
    url: Routes.veterinaries.register,
    siteName: 'KADESH',
    locale: 'es_MX',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: TITLE }],
  },
};

export default function RegisterVeterinaryLayout({ children }: { children: ReactNode }) {
  return children;
}
