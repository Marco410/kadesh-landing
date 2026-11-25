'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useTheme } from 'next-themes';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import { getStripe } from 'kadesh/utils/stripe';

const BRAND = '#216BFA';

function PayForm({
  donationId,
  amountLabel,
  onPaid,
  onBusy,
}: {
  donationId: string;
  amountLabel: string;
  onPaid: () => void;
  onBusy: (busy: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || paying) return;
    setPaying(true);
    onBusy(true);
    setError(null);
    // Stays on this page; only leaves it when the bank asks for a redirect (3-D Secure).
    const origin = typeof window !== 'undefined' ? window.location.origin : SITE_URL;
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${origin}${Routes.donations}?patita=gracias&d=${encodeURIComponent(donationId)}` },
      redirect: 'if_required',
    });
    onBusy(false);
    if (result.error) {
      // Card messages come in Spanish («Tu tarjeta fue rechazada»): shown as they are.
      setError(result.error.message ?? 'No pudimos cobrar tu tarjeta. Intenta con otra.');
      setPaying(false);
      return;
    }
    onPaid();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
        {paying ? 'Procesando…' : `Donar ${amountLabel}`}
      </button>
      <p className="text-center text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
        Pago seguro con tarjeta, en pesos mexicanos (MXN). Kadesh no guarda los datos de tu tarjeta.
      </p>
    </form>
  );
}

/**
 * Card step of a donation that already exists: the backend created the PaymentIntent and this
 * confirms it, styled with the Kadesh blue. The donation counts when the backend hears it from
 * the payment provider, not when this form says so.
 */
export default function DonationPayStep({
  donationId,
  clientSecret,
  amountLabel,
  onPaid,
  onBusy,
}: {
  donationId: string;
  clientSecret: string;
  amountLabel: string;
  onPaid: () => void;
  onBusy: (busy: boolean) => void;
}) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  const options = useMemo(
    () => ({
      clientSecret,
      locale: 'es' as const,
      appearance: {
        theme: dark ? ('night' as const) : ('stripe' as const),
        variables: {
          colorPrimary: BRAND,
          borderRadius: '12px',
          fontFamily: 'Inter, Poppins, system-ui, sans-serif',
          ...(dark ? { colorBackground: '#161b24' } : {}),
        },
      },
    }),
    [clientSecret, dark],
  );

  return (
    <Elements stripe={getStripe()} options={options}>
      <PayForm donationId={donationId} amountLabel={amountLabel} onPaid={onPaid} onBusy={onBusy} />
    </Elements>
  );
}
