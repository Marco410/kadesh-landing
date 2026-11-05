import type { Metadata } from 'next';
import { EditEventPage } from 'kadesh/components/events/form/EventFormPage';

export const metadata: Metadata = {
  title: 'Editar evento',
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EditEventPage slug={slug} />;
}
