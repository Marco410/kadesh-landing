'use client';

import { useEffect, useRef, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { STORE_QUOTE_DEBOUNCE_MS } from '../constants';
import { STORE_CART_QUOTE_QUERY, type StoreCartQuoteResponse } from '../queries';
import type { CartItem, CartQuote } from '../types';
import { cart, useCart, useCartCoupon } from './cartStore';

/**
 * The server's quote of the cart: prices, stock, shipping and total. Asked once when it mounts and
 * again one pause after the cart changes; never on a timer.
 *
 * When the server lowers a quantity or drops a line (sold out, no longer for sale) the stored cart
 * is corrected to match, and `messages` says why. The same with the coupon: a code that does not
 * apply is dropped from the cart (so it is not sent again) and `couponNotice` says why.
 */
export function useCartQuote(): {
  items: CartItem[];
  quote: CartQuote | null;
  loading: boolean;
  error: boolean;
  /** Why the server changed the cart, until the next change. */
  notices: string[];
  /** Why the coupon the person typed was not applied, until the next change. */
  couponNotice: string | null;
  refresh: () => void;
} {
  const client = useApolloClient();
  const items = useCart();
  const couponCode = useCartCoupon();
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notices, setNotices] = useState<string[]>([]);
  const [couponNotice, setCouponNotice] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const requestId = useRef(0);
  // The cart as the server last corrected it: that write must not trigger another quote.
  const corrected = useRef<string | null>(null);

  const keyOf = (lines: CartItem[], code: string) => JSON.stringify([lines, code]);
  const key = keyOf(items, couponCode);

  useEffect(() => {
    if (corrected.current === key) {
      corrected.current = null;
      return;
    }
    if (items.length === 0) {
      requestId.current += 1;
      setQuote(null);
      setLoading(false);
      setError(false);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    // The person changed the cart: what the server said about the previous one no longer applies.
    setNotices([]);
    setCouponNotice(null);
    const timer = setTimeout(() => {
      client
        .query<StoreCartQuoteResponse>({
          query: STORE_CART_QUOTE_QUERY,
          variables: { items, couponCode: couponCode || null },
          fetchPolicy: 'network-only',
        })
        .then(({ data }) => {
          if (id !== requestId.current) return;
          const next = data.storeCartQuote;
          setError(false);
          // A code that did not apply is not kept: the next quote goes without it.
          const dropCoupon = Boolean(couponCode) && !next.couponApplied;
          if (dropCoupon) setCouponNotice(next.couponMessage ?? 'Ese cupón no aplica.');
          if (next.messages.length > 0) {
            // Keep what can be bought; say why the rest changed.
            const fixed = next.lines.filter((line) => line.quantity > 0).map((line) => ({ variantId: line.variantId, quantity: line.quantity }));
            setNotices(next.messages);
            corrected.current = keyOf(fixed, dropCoupon ? '' : couponCode);
            cart.replace(fixed, dropCoupon ? '' : couponCode);
            setQuote({
              ...next,
              lines: next.lines.filter((line) => line.quantity > 0).map((line) => ({ ...line, issue: null, requestedQuantity: line.quantity })),
              canCheckout: fixed.length > 0 && next.subtotalCents > 0,
              messages: [],
            });
          } else {
            if (dropCoupon) {
              corrected.current = keyOf(items, '');
              cart.setCoupon('');
            }
            setQuote(next);
          }
        })
        .catch(() => {
          if (id === requestId.current) setError(true);
        })
        .finally(() => {
          if (id === requestId.current) setLoading(false);
        });
    }, STORE_QUOTE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // `key` stands for `items`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce, client]);

  return {
    items,
    quote,
    loading,
    error,
    notices,
    couponNotice,
    refresh: () => {
      setNotices([]);
      setCouponNotice(null);
      setNonce((value) => value + 1);
    },
  };
}
