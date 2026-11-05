import { permanentRedirect } from 'next/navigation';
import { Routes } from 'kadesh/core/routes';

/** `/eventos/en` sin estado: al listado de todo México. */
export default function EventsPlaceRoot() {
  permanentRedirect(Routes.events.index);
}
