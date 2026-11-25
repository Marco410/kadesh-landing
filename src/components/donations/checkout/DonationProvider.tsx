'use client';

import dynamic from 'next/dynamic';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { DONATIONS_ENABLED, STRIPE_DONATE_URL } from '../constants';
import type { DonationOpenOptions } from '../types';

// The form (and Stripe.js with it) is downloaded the first time someone opens it, never on load.
const DonationSheet = dynamic(() => import('./DonationSheet'), { ssr: false });

type DonationContextValue = {
  /** Opens «Dame una patita». With donations off it opens the old payment link in a new tab. */
  open: (options: DonationOpenOptions) => void;
};

const DonationContext = createContext<DonationContextValue>({
  open: () => {
    if (typeof window !== 'undefined') window.open(STRIPE_DONATE_URL, '_blank', 'noopener,noreferrer');
  },
});

/** Mounted once in `ClientProviders`; any page opens the form with `useDonation().open(...)`. */
export function DonationProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DonationOpenOptions>({ source: 'header' });
  // Each opening is a new form (new checkout key, empty fields).
  const [session, setSession] = useState(0);

  const open = useCallback((next: DonationOpenOptions) => {
    if (!DONATIONS_ENABLED) {
      window.open(STRIPE_DONATE_URL, '_blank', 'noopener,noreferrer');
      return;
    }
    setOptions(next);
    setSession((value) => value + 1);
    setLoaded(true);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <DonationContext.Provider value={value}>
      {children}
      {loaded ? <DonationSheet key={session} isOpen={isOpen} options={options} onClose={close} /> : null}
    </DonationContext.Provider>
  );
}

export function useDonation(): DonationContextValue {
  return useContext(DonationContext);
}
