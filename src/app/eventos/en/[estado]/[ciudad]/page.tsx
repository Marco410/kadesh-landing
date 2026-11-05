import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventsListingPage, { loadEventsListing } from 'kadesh/components/events/EventsListingPage';
import { buildEventsListingMetadata } from 'kadesh/components/events/events-seo';
import { fetchEventFacets } from 'kadesh/components/events/server';
import { parseEventsSearchParams, resolveEventsPlace } from 'kadesh/components/events/searchParams';

export const revalidate = 60;

type Params = Promise<{ estado: string; ciudad: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function load(params: Params, searchParams: SearchParams) {
  const { estado, ciudad } = await params;
  const place = resolveEventsPlace(estado, ciudad, await fetchEventFacets());
  if (!place?.state || !place.city) return null;
  const filters = { ...parseEventsSearchParams(await searchParams), state: place.state.slug, city: place.city.key };
  const { feed, facets } = await loadEventsListing(filters);
  return { place, filters, feed, facets };
}

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const data = await load(params, searchParams);
  return data ? buildEventsListingMetadata(data.place, data.feed.total) : {};
}

/** `/eventos/en/<estado>/<municipio>`: eventos de un municipio («Eventos para mascotas en Morelia, Michoacán»). */
export default async function EventsCityPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const data = await load(params, searchParams);
  if (!data) notFound();
  return <EventsListingPage filters={data.filters} place={data.place} feed={data.feed} facets={data.facets} />;
}
