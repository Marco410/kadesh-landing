'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApolloClient } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { LinkSquare02Icon, ShoppingCartAdd01Icon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import { Routes } from 'kadesh/core/routes';
import { STORE_CART_MAX_QUANTITY } from '../constants';
import { STORE_CART_QUOTE_QUERY, type StoreCartQuoteResponse } from '../queries';
import type { StoreItem } from '../types';
import { cart, useCart } from './cartStore';

const buttonClass =
  'relative z-20 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh';

/**
 * The cart action of a product card. Nothing to choose (one variant, in stock, sold by Kadesh):
 * adds one piece right there, with no request (the cart lives in the browser). Several options:
 * «Elegir opción» opens the product page. Mercado Libre: «Comprar en Mercado Libre», straight to the
 * affiliate link (sponsored, new tab; the card already says it is sold there). Sold out: a disabled «Agotado».
 *
 * The card comes from a cached page (up to a minute old), so before adding it asks the server for
 * this one line (`storeCartQuote`, one request per click). If it sold out meanwhile the card says so
 * instead of saying «Agregado» and letting the cart drop it later. If that request fails, it adds
 * anyway: the cart page checks again.
 */
export default function CardCartButton({ item }: { item: StoreItem }) {
  const client = useApolloClient();
  const inCart = useCart().find((line) => line.variantId === item.singleVariantId)?.quantity ?? 0;
  const [checking, setChecking] = useState(false);
  // What the server said on the last click, newer than the cached card.
  const [liveMax, setLiveMax] = useState<number | null>(null);

  if (item.seller === 'mercado_libre') {
    if (!item.affiliateUrl) return null;
    return (
      <a
        href={item.affiliateUrl}
        target="_blank"
        rel="sponsored nofollow noopener"
        aria-label={`Comprar ${item.name} en Mercado Libre (se abre en otra pestaña)`}
        className={`${buttonClass} bg-[#ffe600] text-[#2d3277] hover:bg-[#f5dc00]`}
      >
        {/* A narrow card fits the short label on one line. */}
        <span className="lg:hidden">Mercado Libre</span>
        <span className="hidden lg:inline">Comprar en Mercado Libre</span>
        <HugeiconsIcon icon={LinkSquare02Icon} size={16} aria-hidden="true" />
      </a>
    );
  }

  // Sold out: a disabled button keeps the card the same height as its neighbours.
  if (!item.inStock) {
    return (
      <button type="button" disabled className={`${buttonClass} border border-[#d8dee8] text-[#5a5a5a] dark:border-white/15 dark:text-[#9aa3b2]`}>
        Agotado
      </button>
    );
  }

  if (!item.singleVariantId) {
    if (item.variantsCount < 2) return null;
    return (
      <Link
        href={Routes.store.product(item.slug)}
        className={`${buttonClass} border border-[#d8dee8] text-[#121212] hover:border-kadesh dark:border-white/15 dark:text-white`}
      >
        Elegir opción
      </Link>
    );
  }

  // Never more than its stock: the button stops where the cart page would cut it back.
  const max = Math.min(liveMax ?? item.singleVariantMaxQuantity ?? STORE_CART_MAX_QUANTITY, STORE_CART_MAX_QUANTITY);
  const soldOut = liveMax === 0;
  const full = !soldOut && inCart >= max;

  const add = async () => {
    const variantId = item.singleVariantId;
    if (!variantId || full || soldOut || checking) return;
    setChecking(true);
    let available = inCart + 1;
    try {
      const { data } = await client.query<StoreCartQuoteResponse>({
        query: STORE_CART_QUOTE_QUERY,
        variables: { items: [{ variantId, quantity: inCart + 1 }], couponCode: null },
        fetchPolicy: 'network-only',
      });
      const line = data.storeCartQuote.lines.find((entry) => entry.variantId === variantId);
      available = line && !(line.issue === 'unavailable' || line.issue === 'out_of_stock') ? line.quantity : 0;
      setLiveMax(line ? line.maxQuantity : 0);
    } catch (error) {
      console.error('Card stock check failed:', error);
    } finally {
      setChecking(false);
    }
    if (available <= inCart) {
      sileo.warning(
        available === 0
          ? { title: 'Se acaba de agotar', description: item.name }
          : { title: `Ya tienes todas las que quedan (${inCart})`, description: item.name },
      );
      return;
    }
    if (!cart.add(variantId, 1)) {
      sileo.warning({ title: 'Tu carrito está lleno.' });
      return;
    }
    sileo.success({
      title: 'Agregado a tu carrito',
      description: item.name,
    });
  };

  return (
    <button
      type="button"
      onClick={() => void add()}
      disabled={full || soldOut || checking}
      aria-busy={checking}
      aria-label={`Agregar ${item.name} al carrito`}
      className={`${buttonClass} bg-kadesh text-white hover:bg-kadesh-600 disabled:opacity-60`}
    >
      <HugeiconsIcon icon={ShoppingCartAdd01Icon} size={18} aria-hidden="true" />
      {soldOut ? 'Agotado' : full ? `Ya tienes todas (${inCart}) en tu carrito` : inCart > 0 ? `Agregar otro (${inCart} en tu carrito)` : 'Agregar al carrito'}
    </button>
  );
}
