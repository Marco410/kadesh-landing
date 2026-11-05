import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import JsonLd from 'kadesh/components/blog/JsonLd';
import PageSummary from 'kadesh/components/shared/PageSummary';
import {
  buildMissingPetPlaceMetadata,
  buildPetPlaceJsonLd,
  buildPetPlaceMetadata,
  petPlaceSummary,
} from 'kadesh/components/veterinaries/pet-place-seo';
import { fetchPetPlaceForShare } from 'kadesh/components/veterinaries/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const place = await fetchPetPlaceForShare(slug);

  if (!place) {
    return buildMissingPetPlaceMetadata();
  }

  return buildPetPlaceMetadata(place);
}

/**
 * La ficha se pinta en el navegador: aquí van el JSON-LD (`VeterinaryCare`) y un resumen visible que
 * llegan en el HTML para buscadores e IA.
 */
export default async function VeterinaryDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await fetchPetPlaceForShare(slug);
  if (!place) return children;

  return (
    <>
      <JsonLd data={buildPetPlaceJsonLd(place)} />
      {children}
      <PageSummary id="resumen-veterinaria" title="Datos de la veterinaria" text={petPlaceSummary(place)} />
    </>
  );
}
