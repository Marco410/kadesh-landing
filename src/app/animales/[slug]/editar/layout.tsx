import type { ReactNode } from 'react';
import type { Metadata } from 'next';

// Only the owner edits a report: the form stays out of search results.
export const metadata: Metadata = {
  title: 'Editar reporte',
  robots: { index: false, follow: false },
};

export default function EditAnimalLayout({ children }: { children: ReactNode }) {
  return children;
}
