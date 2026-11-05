import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import EventsListingPage, { loadEventsListing } from 'kadesh/components/events/EventsListingPage';
import { buildEventsListingMetadata, type EventsPlace } from 'kadesh/components/events/events-seo';
import { eventsListingHref, parseEventsSearchParams } from 'kadesh/components/events/searchParams';

export const revalidate = 60;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const ALL_MEXICO: EventsPlace = { state: null, city: null };

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const filters = parseEventsSearchParams(await searchParams);
  const { feed } = await loadEventsListing({ ...filters, state: null, city: null });
  return buildEventsListingMetadata(ALL_MEXICO, feed.total);
}

/** `/eventos`: todo México. Las URLs viejas con `?estado=` van (308) a su página `/eventos/en/<estado>`. */
export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseEventsSearchParams(await searchParams);
  if (filters.state) permanentRedirect(eventsListingHref(filters));

  const { feed, facets } = await loadEventsListing(filters);
  return <EventsListingPage filters={filters} place={ALL_MEXICO} feed={feed} facets={facets} />;
}
