import type { ReactNode } from 'react';
import { AdsProvider } from './AdsProvider';
import { fetchActiveAds } from './server';

/**
 * Gives the ad slots below it the live ads, read on the server from Next's data cache (5 min).
 * Only the sections that show ads use it (animal and clinic detail, blog, store), so the rest of
 * the site is not regenerated every 5 minutes.
 */
export default async function WithAds({ children }: { children: ReactNode }) {
  const ads = await fetchActiveAds();
  return <AdsProvider ads={ads}>{children}</AdsProvider>;
}
