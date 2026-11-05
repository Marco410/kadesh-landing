import type { Metadata } from 'next';
import JsonLd from 'kadesh/components/blog/JsonLd';
import EventDetail from 'kadesh/components/events/EventDetail';
import EventPrivatePreview from 'kadesh/components/events/EventPrivatePreview';
import { buildEventJsonLd, buildEventMetadata, buildMissingEventMetadata } from 'kadesh/components/events/events-seo';
import { fetchPublicEventBySlug } from 'kadesh/components/events/server';

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchPublicEventBySlug(slug);
  return event ? buildEventMetadata(event) : buildMissingEventMetadata();
}

/**
 * Ficha de un evento. Publicado (o cancelado después de publicarse): la pinta el servidor con su
 * JSON-LD. Si no es público, el navegador intenta con la sesión (vista previa de quien lo publicó).
 */
export default async function EventPage({ params }: { params: Params }) {
  const { slug } = await params;
  const event = await fetchPublicEventBySlug(slug);

  if (!event) return <EventPrivatePreview slug={slug} />;

  return (
    <>
      <JsonLd data={buildEventJsonLd(event)} />
      <EventDetail event={event} />
    </>
  );
}
