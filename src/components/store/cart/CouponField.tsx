'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { STORE_COUPON_CODE_MAX } from '../constants';
import type { CartQuote } from '../types';
import { cart, normalizeCouponCode } from './cartStore';

/**
 * The coupon of the cart: type a code and apply it, or take off the one in use. The code goes into
 * the cart store; the server's quote says if it applies and how much it takes off.
 *
 * Lives inside the checkout's `<form>` too, so it is not a form of its own: Enter in the field
 * applies the code instead of placing the order.
 */
export default function CouponField({
  quote,
  notice,
  busy,
}: {
  quote: CartQuote;
  /** Why the last code was not applied. */
  notice: string | null;
  /** A quote or the order is on its way. */
  busy: boolean;
}) {
  const inputId = useId();
  const noticeId = useId();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');

  if (quote.couponApplied && quote.couponCode) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
        <p className="min-w-0 [overflow-wrap:anywhere]" role="status">
          {quote.couponMessage ?? `Cupón ${quote.couponCode} aplicado.`}
        </p>
        <button
          type="button"
          onClick={() => {
            setCode('');
            setOpen(false);
            cart.setCoupon('');
          }}
          disabled={busy}
          className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 font-semibold underline disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh"
        >
          Quitar
        </button>
      </div>
    );
  }

  if (!open && !notice) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center text-sm font-semibold text-kadesh-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh dark:text-kadesh-300"
      >
        ¿Tienes un cupón?
      </button>
    );
  }

  const ready = code.length >= 3 && !busy;
  const apply = () => {
    if (ready) cart.setCoupon(code);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    // Never submit the form around it (the checkout).
    event.preventDefault();
    apply();
  };

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-[#121212] dark:text-white">
        Cupón de descuento
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          value={code}
          onChange={(event) => setCode(normalizeCouponCode(event.target.value))}
          onKeyDown={onKeyDown}
          maxLength={STORE_COUPON_CODE_MAX}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          aria-describedby={notice ? noticeId : undefined}
          aria-invalid={notice ? true : undefined}
          className="h-12 min-w-0 flex-1 rounded-xl border border-[#d8dee8] bg-white px-3 font-mono text-base uppercase tracking-wide text-[#121212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh dark:border-white/15 dark:bg-[#121212] dark:text-white"
        />
        <button
          type="button"
          onClick={apply}
          disabled={!ready}
          className="inline-flex h-12 shrink-0 items-center rounded-xl border border-[#d8dee8] px-4 font-semibold text-[#121212] hover:border-kadesh disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-white/15 dark:text-white"
        >
          {busy ? 'Revisando…' : 'Aplicar'}
        </button>
      </div>
      {notice ? (
        <p id={noticeId} role="alert" className="mt-2 text-sm font-medium text-red-700 dark:text-red-400">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
