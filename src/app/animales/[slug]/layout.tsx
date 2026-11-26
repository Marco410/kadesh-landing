import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  animalShareFacts,
  animalSummary,
  buildAnimalJsonLd,
  buildAnimalMetadata,
  buildMissingAnimalMetadata,
} from 'kadesh/components/animals/animal-seo';
import JsonLd from 'kadesh/components/blog/JsonLd';
import PageSummary from 'kadesh/components/shared/PageSummary';
import { AnimalServerTitle } from 'kadesh/components/animals/detail/ServerTitle';
import { fetchAnimalForShare } from 'kadesh/components/animals/server';
import { Routes } from 'kadesh/core/routes';
import WithAds from 'kadesh/components/ads/WithAds';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // If the backend fails this throws: the page answers 5xx (Google retries later) instead of a
  // 200 «Animal no encontrado» with noindex, which dropped live reports from the index.
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

  // Only a report that really does not exist gets the 404 (with noindex from the metadata).
  if (!animal) notFound();

  // JSON-LD y un resumen del servidor: la ficha se pinta en el navegador y sin esto el HTML
  // llegaba vacío para buscadores e IA.
  return (
    <WithAds>
      <JsonLd data={buildAnimalJsonLd(animal)} />
      <AnimalServerTitle title={animalShareFacts(animal).name}>{children}</AnimalServerTitle>
      <PageSummary id="resumen-reporte" title="Resumen del reporte" text={animalSummary(animal)} />
    </WithAds>
  );
}
