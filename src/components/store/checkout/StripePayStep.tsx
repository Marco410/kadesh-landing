'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useTheme } from 'next-themes';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import { formatPrice } from '../format';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

function PayForm({ orderNumber, totalCents, onPaid }: { orderNumber: string; totalCents: number; onPaid: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || paying) return;
    setPaying(true);
    setError(null);
    // The card form stays on this page; Stripe only leaves it when the bank asks for a redirect.
    const origin = typeof window !== 'undefined' ? window.location.origin : SITE_URL;
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${origin}${Routes.store.order(orderNumber)}&pagado=1` },
      redirect: 'if_required',
    });
    if (result.error) {
      // Stripe's card messages come in Spanish («Tu tarjeta fue rechazada»): shown as they are.
      setError(result.error.message ?? 'No pudimos cobrar tu tarjeta. Intenta con otra.');
      setPaying(false);
      return;
    }
    onPaid();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Changing the card clears the last refusal: it was about the card that is no longer there. */}
      <PaymentElement onChange={() => setError((current) => (current ? null : current))} />
      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={!stripe || paying}
        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
      >
        {paying ? 'Procesando…' : `Pagar ${formatPrice(totalCents)}`}
      </button>
      <p className="text-center text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
        El pago lo procesa Stripe. Kadesh no guarda los datos de tu tarjeta.
      </p>
    </form>
  );
}

/**
 * Card payment of an order that already exists: the backend created the Stripe PaymentIntent and
 * this confirms it. The order becomes paid when Stripe tells the backend, not when this form says
 * so.
 */
export default function StripePayStep({
  clientSecret,
  orderNumber,
  totalCents,
  onPaid,
}: {
  clientSecret: string;
  orderNumber: string;
  totalCents: number;
  onPaid: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const options = useMemo(
    () => ({
      clientSecret,
      locale: 'es' as const,
      appearance: { theme: resolvedTheme === 'dark' ? ('night' as const) : ('stripe' as const) },
    }),
    [clientSecret, resolvedTheme],
  );

  return (
    <Elements stripe={stripePromise} options={options}>
      <PayForm orderNumber={orderNumber} totalCents={totalCents} onPaid={onPaid} />
    </Elements>
  );
}
