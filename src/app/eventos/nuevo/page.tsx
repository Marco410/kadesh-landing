import type { Metadata } from 'next';
import { NewEventPage } from 'kadesh/components/events/form/EventFormPage';

export const metadata: Metadata = {
  title: 'Publica un evento',
  description: 'Publica gratis una campaña de esterilización, jornada de vacunación, feria de adopción u otro evento para mascotas.',
  robots: { index: false, follow: true },
};

export default function Page() {
  return <NewEventPage />;
}
