import { Metadata } from 'next';
import {
  BLOG_INDEX_DESCRIPTION,
  BLOG_INDEX_OG_DESCRIPTION,
  BLOG_INDEX_TITLE,
  BLOG_OG_IMAGE,
} from 'kadesh/components/blog/blog-seo';

export const metadata: Metadata = {
  title: BLOG_INDEX_TITLE,
  description: BLOG_INDEX_DESCRIPTION,
  keywords: [
    'blog bienestar animal',
    'consejos mascotas',
    'adopción de animales',
    'rescate de mascotas',
    'cuidado de animales',
    'veterinarias',
    'salud animal',
    'historias de rescate',
    'bienestar animal México',
  ],
  openGraph: {
    title: `${BLOG_INDEX_TITLE} | KADESH`,
    description: BLOG_INDEX_OG_DESCRIPTION,
    siteName: 'KADESH',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: BLOG_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Blog KADESH — historias y consejos de bienestar animal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BLOG_INDEX_TITLE} | KADESH`,
    description: BLOG_INDEX_OG_DESCRIPTION,
    images: [BLOG_OG_IMAGE],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
