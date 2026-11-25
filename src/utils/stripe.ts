import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Stripe.js, loaded the first time a payment form needs it (never on page load). Shared by the
 * store checkout and «Dame una patita».
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');
  return stripePromise;
}
