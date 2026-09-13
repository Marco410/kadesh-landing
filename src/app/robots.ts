import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kadesh.com.mx';

const AI_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Google-Extended',
  'Google-CloudVertexBot',
  'Applebot',
  'Applebot-Extended',
  'Amazonbot',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/perfil', '/perfil/'],
      },
      ...AI_AGENTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: ['/perfil', '/perfil/'],
      })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
