'use client';

import type { ReactNode } from 'react';
import { DONATIONS_ENABLED, STRIPE_DONATE_URL } from './constants';
import { useDonation } from './checkout/DonationProvider';
import type { DonationSource } from './types';

/**
 * Any «Dame una patita» call to action. A button that opens the form; while donations are off
 * (`NEXT_PUBLIC_DONATIONS_ENABLED`), a link to the old payment page, so server pages can use it.
 */
export default function DonateTrigger({
  source,
  sourceRef,
  className,
  children,
  ariaLabel,
  onClick,
}: {
  source: DonationSource;
  sourceRef?: string | null;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  /** Runs first (e.g. closing the mobile menu). */
  onClick?: () => void;
}) {
  const { open } = useDonation();
  if (!DONATIONS_ENABLED) {
    return (
      <a href={STRIPE_DONATE_URL} target="_blank" rel="noopener noreferrer" className={className} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        open({ source, sourceRef });
      }}
      className={className}
      aria-label={ariaLabel}
      aria-haspopup="dialog"
    >
      {children}
    </button>
  );
}
