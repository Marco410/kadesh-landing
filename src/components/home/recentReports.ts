import { sortMultimediaByOrder } from 'kadesh/components/animals/sortMultimedia';

/**
 * Reportes recientes de la portada. Sin `'use client'`: lo usan el servidor (`server.ts`, para los
 * del país) y el navegador (`hooks/useRecentReports.ts`, para los de la zona y los filtros).
 */

export const RECENT_REPORTS_LIMIT = 6;

export type RecentReportStatus = 'lost' | 'found' | 'in_adoption';

export type RecentReport = {
  id: string;
  slug?: string | null;
  name: string;
  typeName: string;
  status: string;
  place: string;
  createdAt: string;
  imageUrl?: string;
  distance: number | null;
};

export type NearbyAnimalNode = {
  id: string;
  slug?: string | null;
  name: string;
  distance: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  status: string;
  animal_type: { name: string } | null;
  createdAt: string;
  multimedia: Array<{ url: string; order?: number | null }>;
};

export function toRecentReport(animal: NearbyAnimalNode): RecentReport {
  return {
    id: animal.id,
    slug: animal.slug,
    name: animal.name,
    typeName: animal.animal_type?.name?.toLowerCase() ?? '',
    status: animal.status,
    place: [animal.city, animal.state].filter(Boolean).join(', ') || animal.address || '',
    createdAt: animal.createdAt,
    imageUrl: sortMultimediaByOrder(animal.multimedia)[0]?.url,
    distance: animal.distance,
  };
}
