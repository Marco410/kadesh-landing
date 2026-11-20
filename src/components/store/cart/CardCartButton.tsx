'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { LinkSquare02Icon, ShoppingCartAdd01Icon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import { Routes } from 'kadesh/core/routes';
import { STORE_CART_MAX_QUANTITY } from '../constants';
import type { StoreItem } from '../types';
import { cart, useCart } from './cartStore';

const buttonClass =
  'relative z-20 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh';

/**
 * The cart action of a product card. Nothing to choose (one variant, in stock, sold by Kadesh):
 * adds one piece right there, with no request (the cart lives in the browser). Several options:
 * «Elegir opción» opens the product page. Mercado Libre: «Comprar en Mercado Libre», straight to the
 * affiliate link (sponsored, new tab; the card already says it is sold there). Sold out: nothing.
 */
export default function CardCartButton({ item }: { item: StoreItem }) {
  const inCart = useCart().find((line) => line.variantId === item.singleVariantId)?.quantity ?? 0;

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
        Comprar en Mercado Libre
        <HugeiconsIcon icon={LinkSquare02Icon} size={16} aria-hidden="true" />
      </a>
    );
  }

  if (!item.inStock) return null;

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
  const max = Math.min(item.singleVariantMaxQuantity ?? STORE_CART_MAX_QUANTITY, STORE_CART_MAX_QUANTITY);
  const full = inCart >= max;
  const add = () => {
    if (!item.singleVariantId || full) return;
    if (!cart.add(item.singleVariantId, 1)) {
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
      onClick={add}
      disabled={full}
      aria-label={`Agregar ${item.name} al carrito`}
      className={`${buttonClass} bg-kadesh text-white hover:bg-kadesh-600 disabled:opacity-60`}
    >
      <HugeiconsIcon icon={ShoppingCartAdd01Icon} size={18} aria-hidden="true" />
      {full ? `Ya tienes todas (${inCart}) en tu carrito` : inCart > 0 ? `Agregar otro (${inCart} en tu carrito)` : 'Agregar al carrito'}
    </button>
  );
}
