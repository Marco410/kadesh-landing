import { sortMultimediaByOrder } from 'kadesh/components/animals/sortMultimedia';
import { toIsoDate } from './zoneAlerts';

/**
 * Reportes recientes de la portada. Sin `'use client'`: lo usan el servidor (`server.ts`, para los
 * del país) y el navegador (`hooks/useRecentReports.ts`, para los de la zona y los filtros).
 */

/**
 * Cuántos reportes pide la portada. La cuadrícula es de 12 cuadros (3 × 4 en celular, 4 × 3 en
 * escritorio): el primero es «Reportar tu caso» y los otros 11, reportes.
 */
export const RECENT_REPORTS_LIMIT = 11;

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
  /** Para el mini mapa de debajo de la cuadrícula. */
  lat: number | null;
  lng: number | null;
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
  lat?: string | null;
  lng?: string | null;
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
    lat: coordinate(animal.lat),
    lng: coordinate(animal.lng),
  };
}

function coordinate(value: string | null | undefined): number | null {
  const num = Number.parseFloat(value ?? '');
  return Number.isFinite(num) ? num : null;
}

function dayNumber(date: Date): number {
  return Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86_400_000);
}

/**
 * Badge de fecha del cuadro: «Hoy», «Ayer», «Antier», «Esta semana», «Este mes», «Hace 2 meses» o
 * «Hace más de un año», por días de calendario en la hora de quien ve. Solo en el navegador (depende
 * del reloj y la zona): el HTML de la portada sale de caché.
 */
export function reportDateBadge(createdAt: string, now = new Date()): string | null {
  const iso = toIsoDate(createdAt);
  if (!iso) return null;
  const days = dayNumber(now) - dayNumber(new Date(iso));
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days === 2) return 'Antier';
  if (days < 7) return 'Esta semana';
  if (days < 31) return 'Este mes';
  const months = Math.round(days / 30.4);
  if (months >= 12) return 'Hace más de un año';
  return months <= 1 ? 'Hace un mes' : `Hace ${months} meses`;
}
