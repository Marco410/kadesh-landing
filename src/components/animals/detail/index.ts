export { useAnimalDetail } from './hooks/useAnimalDetail';
export type { AnimalDetail } from './hooks/useAnimalDetail';
export { useAnimalComments } from './hooks/useAnimalComments';
export { useAnimalView } from './hooks/useAnimalView';
export { useDetailAction } from './hooks/useDetailAction';
export { default as AnimalImageGrid } from './AnimalImageGrid';
export { default as FullscreenCarousel } from './FullscreenCarousel';
export type { FullscreenCarouselProps } from './FullscreenCarousel';
export { default as AnimalInfoSection } from './AnimalInfoSection';
export { default as LogTimeline } from './LogTimeline';
// El mapa va por `AnimalLocationMap` (carga solo en el navegador, con respaldo si falla).
// `LogMap` no se exporta: importarlo directo lo metería al bundle de la página y al render del servidor.
export { default as AnimalLocationMap } from './AnimalLocationMap';
export { default as MapModal } from './MapModal';
export { default as AnimalCommentsSection } from './AnimalCommentsSection';
export { default as AnimalClaimsPanel } from './AnimalClaimsPanel';
export { default as ClaimReportButton } from './ClaimReportButton';
export { default as KeepAnimalButton } from './KeepAnimalButton';
export { default as CloseCaseBanner } from './CloseCaseBanner';



export { default as ShareAnimalButton } from './ShareAnimalButton';
export { default as NearbyVeterinariesRow } from './NearbyVeterinariesRow';
