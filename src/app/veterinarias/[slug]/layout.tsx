import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import {
  buildMissingPetPlaceMetadata,
  buildPetPlaceMetadata,
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

export default function VeterinaryDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
