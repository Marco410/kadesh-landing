import type { MetadataRoute } from 'next';
import { fetchPublishedPostsForSitemap } from 'kadesh/components/blog/server';
import { fetchEventFacets, fetchEventsForSitemap } from 'kadesh/components/events/server';
import { fetchAnimalsForSitemap } from 'kadesh/components/animals/server';
import { fetchPetPlacesForSitemap } from 'kadesh/components/veterinaries/server';
import { fetchRescueOrgsForSitemap } from 'kadesh/components/rescue/server';
import { fetchStoreProductsForSitemap } from 'kadesh/components/store/server';
import { fetchDonationsHome } from 'kadesh/components/donations/server';
import { isWallReady } from 'kadesh/components/donations/constants';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';

function toLastModified(value?: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Same request (and fetch cache) as the home page: the wall is listed only once it shows.
  const donations = await fetchDonationsHome();
  const staticPaths = [
    '/',
    Routes.blog.index,
    Routes.animals.index,
    Routes.animals.new,
    Routes.events.index,
    Routes.veterinaries.index,
    Routes.veterinaries.register,
    Routes.organizations.index,
    Routes.allies,
    Routes.ranking,
    Routes.conocenos,
    Routes.contact,
    Routes.novedades,
    Routes.donations,
    ...(isWallReady(donations.summary) ? [Routes.donationsWall] : []),
    Routes.advertise,
    Routes.terms,
    Routes.privacy,
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path === '/' ? '/' : path}`,
    changeFrequency: path === '/' || path === Routes.blog.index || path === Routes.events.index ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path === Routes.blog.index ? 0.8 : 0.7,
  }));

  const posts = await fetchPublishedPostsForSitemap();
  const latestPostDate = posts
    .map((post) => toLastModified(post.updatedAt || post.publishedAt))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  if (latestPostDate) {
    const blogIndex = staticEntries.find((entry) => entry.url === `${SITE_URL}${Routes.blog.index}`);
    if (blogIndex) {
      blogIndex.lastModified = latestPostDate;
    }
  }

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}${Routes.blog.post(post.url)}`,
    lastModified: toLastModified(post.updatedAt || post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const events = await fetchEventsForSitemap();
  const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${SITE_URL}${Routes.events.detail(event.slug)}`,
    lastModified: toLastModified(event.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Páginas por estado y municipio con eventos próximos (las vacías no se indexan).
  const facets = await fetchEventFacets();
  const placeEntries: MetadataRoute.Sitemap = facets.flatMap((state) => [
    { url: `${SITE_URL}${Routes.events.place(state.slug)}`, changeFrequency: 'daily' as const, priority: 0.6 },
    ...state.cities.map((city) => ({
      url: `${SITE_URL}${Routes.events.place(state.slug, city.key)}`,
      changeFrequency: 'daily' as const,
      priority: 0.5,
    })),
  ]);

  // Fichas de animales (sin los unidos a otro reporte), de veterinarias y de espacios de rescate verificados.
  const [animals, petPlaces, rescueOrgs, storeSlugs] = await Promise.all([
    fetchAnimalsForSitemap(),
    fetchPetPlacesForSitemap(),
    fetchRescueOrgsForSitemap(),
    fetchStoreProductsForSitemap(),
  ]);
  const animalEntries: MetadataRoute.Sitemap = animals.map((animal) => ({
    url: `${SITE_URL}${animal.path}`,
    lastModified: toLastModified(animal.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));
  const petPlaceEntries: MetadataRoute.Sitemap = petPlaces.map((place) => ({
    url: `${SITE_URL}${Routes.veterinaries.detail(place.slug)}`,
    changeFrequency: 'monthly',
    priority: place.verified ? 0.6 : 0.5,
  }));

  const rescueOrgEntries: MetadataRoute.Sitemap = rescueOrgs.map((org) => ({
    url: `${SITE_URL}${Routes.organizations.detail(org.slug)}`,
    lastModified: toLastModified(org.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // The store only goes in when it is open and has products (closed, `/tienda` answers 404).
  const storeEntries: MetadataRoute.Sitemap =
    storeSlugs.length > 0
      ? [
          { url: `${SITE_URL}${Routes.store.index}`, changeFrequency: 'daily', priority: 0.7 },
          ...storeSlugs.map((slug) => ({
            url: `${SITE_URL}${Routes.store.product(slug)}`,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          })),
        ]
      : [];

  return [
    ...staticEntries,
    ...postEntries,
    ...eventEntries,
    ...placeEntries,
    ...animalEntries,
    ...petPlaceEntries,
    ...rescueOrgEntries,
    ...storeEntries,
  ];
}
