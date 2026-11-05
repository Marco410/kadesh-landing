export interface AppNotification {
  id: string;
  /** "animal.nearby" | "animal.created" | … */
  type: string;
  title: string;
  body: string;
  url: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface AlertSettings {
  enabled: boolean;
  center: { lat: number; lng: number } | null;
  /** 1–50 */
  radiusKm: number;
  /** Avisos de eventos (campañas, jornadas) con la misma zona. */
  eventsEnabled: boolean;
  /** Municipio y estado del centro (los calcula el backend al guardar; solo lectura). */
  region: { city: string | null; stateCode: string | null } | null;
}

export type NotificationTone = 'found' | 'lost' | 'brand';

export interface NotificationGroup {
  label: string;
  items: AppNotification[];
}
