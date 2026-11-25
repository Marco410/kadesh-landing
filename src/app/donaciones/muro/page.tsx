import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { DONATIONS_ENABLED } from 'kadesh/components/donations';
import { isWallReady } from 'kadesh/components/donations/constants';
import { fetchDonationsBoard } from 'kadesh/components/donations/server';
import DonationsWallPage from 'kadesh/components/donations/wall/DonationsWallPage';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';

// Same 10-minute window as the wall and donor top (`DONATIONS_REVALIDATE_SECONDS`).
export const revalidate = 600;

const TITLE = 'Muro de patitas';
const DESCRIPTION =
  'Quienes le dieron una patita a Kadesh Pet, sus mensajes y en qué se usan las donaciones: servidores, difusión y casos urgentes.';
const URL = `${SITE_URL}${Routes.donationsWall}`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: `${TITLE} | KADESH`, description: DESCRIPTION, url: URL, siteName: 'KADESH', locale: 'es_MX', type: 'website' },
  twitter: { card: 'summary_large_image', title: `${TITLE} | KADESH`, description: DESCRIPTION },
};

/** `/donaciones/muro`: podium, top and messages of «Dame una patita», in one server request. */
export default async function Page() {
  // Without the own form there is no wall (the buttons open the old payment link).
  if (!DONATIONS_ENABLED) notFound();
  const board = await fetchDonationsBoard();
  // Until there are a few messages, an empty wall would say «nobody donates»: send to the donations page.
  if (!isWallReady(board.summary)) redirect(Routes.donations);
  return <DonationsWallPage board={board} />;
}
