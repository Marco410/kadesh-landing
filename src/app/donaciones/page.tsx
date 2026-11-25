import { DonationsPage, buildDonationsJsonLd } from 'kadesh/components/donations';
import { fetchDonationsHome } from 'kadesh/components/donations/server';

// Same 10-minute window as the wall and donor top (`DONATIONS_REVALIDATE_SECONDS`).
export const revalidate = 600;

export default async function Page() {
  // Only a preview (latest messages and the totals); the full wall is `/donaciones/muro`.
  const preview = await fetchDonationsHome();
  return (
    <>
      {/* Here and not in the layout, so `/donaciones/muro` does not inherit this page's JSON-LD. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildDonationsJsonLd()) }} />
      <DonationsPage preview={preview} />
    </>
  );
}
