import type { MetadataRoute } from 'next';
import { fetchPublishedPostsForSitemap } from 'kadesh/components/blog/server';
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
    Routes.veterinaries.index,
    Routes.conocenos,
    Routes.contact,
    Routes.novedades,
    Routes.donations,
    Routes.terms,
    Routes.privacy,
    Routes.auth.login,
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path === '/' ? '/' : path}`,
    changeFrequency: path === '/' || path === Routes.blog.index ? 'daily' : 'weekly',
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

  return [...staticEntries, ...postEntries];
}
