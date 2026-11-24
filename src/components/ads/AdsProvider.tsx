'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { PublicAd } from './types';

const AdsContext = createContext<PublicAd[]>([]);

/** The live ads, fetched once on the server (`fetchActiveAds`) and shared by every slot. */
export function AdsProvider({ ads, children }: { ads: PublicAd[]; children: ReactNode }) {
  return <AdsContext.Provider value={ads}>{children}</AdsContext.Provider>;
}

export function useActiveAds(): PublicAd[] {
  return useContext(AdsContext);
}
