import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kadesh.com.mx';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '/',
    '/blog',
    '/animales',
    '/veterinarias',
    '/conocenos',
    '/contacto',
    '/novedades',
    '/terminos',
    '/privacidad',
    '/auth/login',
  ];

  return paths.map((path) => ({
    url: `${SITE}${path === '/' ? '/' : path}`,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
