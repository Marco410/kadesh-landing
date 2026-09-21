import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import {
  buildAnimalMetadata,
  buildMissingAnimalMetadata,
} from 'kadesh/components/animals/animal-seo';
import { fetchAnimalForShare } from 'kadesh/components/animals/server';

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

export default function AnimalDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
