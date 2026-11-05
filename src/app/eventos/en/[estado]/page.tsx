import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventsListingPage, { loadEventsListing } from 'kadesh/components/events/EventsListingPage';
import { buildEventsListingMetadata } from 'kadesh/components/events/events-seo';
import { fetchEventFacets } from 'kadesh/components/events/server';
import { parseEventsSearchParams, resolveEventsPlace } from 'kadesh/components/events/searchParams';

export const revalidate = 60;

type Params = Promise<{ estado: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function load(params: Params, searchParams: SearchParams) {
  const { estado } = await params;
  const place = resolveEventsPlace(estado, null, await fetchEventFacets());
  if (!place?.state) return null;
  const filters = { ...parseEventsSearchParams(await searchParams), state: place.state.slug, city: null };
  const { feed, facets } = await loadEventsListing(filters);
  return { place, filters, feed, facets };
}

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const data = await load(params, searchParams);
  return data ? buildEventsListingMetadata(data.place, data.feed.total) : {};
}

/** `/eventos/en/<estado>`: eventos de un estado («Eventos para mascotas en Michoacán»). */
export default async function EventsStatePage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const data = await load(params, searchParams);
  if (!data) notFound();
  return <EventsListingPage filters={data.filters} place={data.place} feed={data.feed} facets={data.facets} />;
}
