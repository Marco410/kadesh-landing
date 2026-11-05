/**
 * Eventos de Kadesh Pet (campañas, jornadas, ferias de adopción). Lo del servidor (`server.ts`,
 * `events-seo.ts`) se importa por archivo desde las rutas de `app/eventos`.
 */
export { default as EventCard, EventCardSkeleton } from './EventCard';
export { default as EventCategoryChip } from './EventCategoryChip';
export { default as EventDetail } from './EventDetail';
export { default as EventsIndexClient } from './EventsIndexClient';
export { default as MyEventsSection } from './MyEventsSection';
export * from './constants';
export * from './types';
