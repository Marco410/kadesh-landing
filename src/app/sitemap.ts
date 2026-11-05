import type { MetadataRoute } from 'next';
import { fetchPublishedPostsForSitemap } from 'kadesh/components/blog/server';
import { fetchEventFacets, fetchEventsForSitemap } from 'kadesh/components/events/server';
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
  const staticPaths = [
    '/',
    Routes.blog.index,
    Routes.animals.index,
    Routes.events.index,
    Routes.veterinaries.index,
    Routes.conocenos,
    Routes.contact,
    Routes.novedades,
    Routes.donations,
    Routes.advertise,
    Routes.terms,
    Routes.privacy,
    Routes.auth.login,
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

  return [...staticEntries, ...postEntries, ...eventEntries, ...placeEntries];
}
