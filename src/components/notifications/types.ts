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
}

export type NotificationTone = 'found' | 'lost' | 'brand';

export interface NotificationGroup {
  label: string;
  items: AppNotification[];
}
