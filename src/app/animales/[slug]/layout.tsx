import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import {
  animalSummary,
  buildAnimalJsonLd,
  buildAnimalMetadata,
  buildMissingAnimalMetadata,
} from 'kadesh/components/animals/animal-seo';
import JsonLd from 'kadesh/components/blog/JsonLd';
import PageSummary from 'kadesh/components/shared/PageSummary';
import { fetchAnimalForShare } from 'kadesh/components/animals/server';
import { Routes } from 'kadesh/core/routes';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const animal = await fetchAnimalForShare(slug);

  if (!animal) {
    return buildMissingAnimalMetadata();
  }

  return buildAnimalMetadata(animal);
}

/**
 * Un reporte repetido que un admin unió con otro manda (308) a la ficha principal. Si no, agrega el
 * JSON-LD y el resumen del reporte que llegan en el HTML.
 */
export default async function AnimalDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const animal = await fetchAnimalForShare(slug);
  const main = animal?.duplicateOf;
  if (main) {
    permanentRedirect(Routes.animals.detail(main.slug || main.id));
  }

  if (!animal) return children;

  // JSON-LD y un resumen del servidor: la ficha se pinta en el navegador y sin esto el HTML
  // llegaba vacío para buscadores e IA.
  return (
    <>
      <JsonLd data={buildAnimalJsonLd(animal)} />
      {children}
      <PageSummary id="resumen-reporte" title="Resumen del reporte" text={animalSummary(animal)} />
    </>
  );
}
