import type { MetadataRoute } from 'next';
import { SITE_URL } from 'kadesh/core/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '/',
    '/blog',
    '/animales',
    '/veterinarias',
    '/conocenos',
    '/contacto',
    '/novedades',
    '/donaciones',
    '/terminos',
    '/privacidad',
    '/auth/login',
  ];

  return paths.map((path) => ({
    url: `${SITE_URL}${path === '/' ? '/' : path}`,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
