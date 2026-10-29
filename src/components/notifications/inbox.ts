import { SITE_URL } from 'kadesh/core/site';
import { ANIMAL_REPORT_NOTIFICATION_TYPE, NEARBY_ANIMAL_TYPE } from './constants';
import type { AppNotification, NotificationGroup, NotificationTone } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;
/** El backend arma links absolutos a la web de producción; en local también se abren aquí. */
const INTERNAL_HOSTS = new Set([new URL(SITE_URL).hostname, 'pet.kadesh.com.mx']);

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Hoy / Ayer / Esta semana / Antes, conservando el orden (más reciente primero). */
export function groupNotifications(
  notifications: AppNotification[],
  now: Date = new Date()
): NotificationGroup[] {
  const today = startOfDay(now);
  const buckets: NotificationGroup[] = [
    { label: 'Hoy', items: [] },
    { label: 'Ayer', items: [] },
    { label: 'Esta semana', items: [] },
    { label: 'Antes', items: [] },
  ];

  for (const notification of notifications) {
    const day = startOfDay(new Date(notification.createdAt));
    if (day >= today) buckets[0].items.push(notification);
    else if (day >= today - DAY_MS) buckets[1].items.push(notification);
    else if (day >= today - 6 * DAY_MS) buckets[2].items.push(notification);
    else buckets[3].items.push(notification);
  }

  return buckets.filter((group) => group.items.length > 0);
}

/**
 * Verde si es una alerta de zona de un animal encontrado o una posible coincidencia (perdido ↔
 * encontrado), rojo si es otra alerta de zona, azul el resto.
 */
export function notificationTone(notification: AppNotification): NotificationTone {
  if (notification.type === ANIMAL_REPORT_NOTIFICATION_TYPE.POSSIBLE_MATCH) return 'found';
  if (notification.type !== NEARBY_ANIMAL_TYPE) return 'brand';
  return /encontrad/i.test(notification.title) ? 'found' : 'lost';
}

/**
 * Ruta interna para una `url` de notificación. Los links absolutos a este sitio se
 * convierten en ruta; los externos se devuelven tal cual. `null` si no lleva a ningún lado.
 */
export function appPathFromUrl(url: string | null | undefined): string | null {
  const value = url?.trim();
  if (!value) return null;
  if (value.startsWith('/')) return value;
  try {
    const parsed = new URL(value);
    if (INTERNAL_HOSTS.has(parsed.hostname)) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/';
    }
    return value;
  } catch {
    return null;
  }
}

export function isExternalPath(path: string): boolean {
  return !path.startsWith('/');
}

export function formatNotificationTime(createdAt: string, now: Date = new Date()): string {
  const date = new Date(createdAt);
  const diffMinutes = Math.round((now.getTime() - date.getTime()) / 60_000);
  if (diffMinutes < 1) return 'Ahora';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (startOfDay(date) === startOfDay(now)) {
    return date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export function unreadBadgeLabel(count: number): string {
  return count > 9 ? '9+' : String(count);
}
