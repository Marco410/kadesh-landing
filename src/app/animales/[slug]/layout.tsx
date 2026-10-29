import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import {
  buildAnimalMetadata,
  buildMissingAnimalMetadata,
} from 'kadesh/components/animals/animal-seo';
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

/** Un reporte repetido que un admin unió con otro manda (308) a la ficha principal. */
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

  return children;
}
