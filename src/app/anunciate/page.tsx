import type { Metadata } from 'next';
import {
  ADVERTISE_META_DESCRIPTION,
  ADVERTISE_PAGE_TITLE,
  AdvertisePage,
} from 'kadesh/components/advertise';
import { Routes } from 'kadesh/core/routes';

export const metadata: Metadata = {
  title: ADVERTISE_PAGE_TITLE,
  description: ADVERTISE_META_DESCRIPTION,
  alternates: { canonical: Routes.advertise },
  openGraph: {
    title: `${ADVERTISE_PAGE_TITLE} | KADESH`,
    description: ADVERTISE_META_DESCRIPTION,
    url: Routes.advertise,
  },
};

export default function Page() {
  return <AdvertisePage />;
}
