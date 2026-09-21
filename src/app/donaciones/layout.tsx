import type { Metadata } from 'next';
import {
  DONATIONS_CANONICAL,
  DONATIONS_META_DESCRIPTION,
  DONATIONS_OG_DESCRIPTION,
  DONATIONS_PAGE_TITLE,
  buildDonationsJsonLd,
} from 'kadesh/components/donations';

export const metadata: Metadata = {
  title: DONATIONS_PAGE_TITLE,
  description: DONATIONS_META_DESCRIPTION,
  openGraph: {
    title: `${DONATIONS_PAGE_TITLE} | KADESH`,
    description: DONATIONS_OG_DESCRIPTION,
    url: DONATIONS_CANONICAL,
    siteName: 'KADESH',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KADESH — Donaciones y transparencia: a qué se destina cada aportación',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${DONATIONS_PAGE_TITLE} | KADESH`,
    description: DONATIONS_OG_DESCRIPTION,
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: DONATIONS_CANONICAL,
  },
};

export default function DonacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildDonationsJsonLd()),
        }}
      />
      {children}
    </>
  );
}
