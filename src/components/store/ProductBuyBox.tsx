'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, LinkSquare02Icon, MinusSignIcon, ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { cart, useCart } from './cart/cartStore';
import { STORE_CART_MAX_QUANTITY } from './constants';
import { discountPercent, formatPrice, formatStoreDate } from './format';
import { StoreWishlistButton } from './StoreWishlist';
import type { StoreItem, StoreVariant } from './types';

/**
 * Price, options and the action of a product.
 *
 * - Sold by Kadesh: price and stock of the chosen variant, how many, and «Agregar al carrito». The
 *   cart only keeps the variant and the quantity; the server prices it again at the cart.
 * - Mercado Libre: the price is approximate (with the date it was checked) and the button leaves
 *   to Mercado Libre through the affiliate link, with its disclosure.
 */
export default function ProductBuyBox({ item, variants }: { item: StoreItem; variants: StoreVariant[] }) {
  const affiliate = item.seller === 'mercado_libre';
  const firstAvailable = variants.find((variant) => variant.inStock) ?? variants[0] ?? null;
  const [variantId, setVariantId] = useState<string | null>(firstAvailable?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const variant = variants.find((entry) => entry.id === variantId) ?? firstAvailable;
  const inCart = useCart().find((item) => item.variantId === variant?.id)?.quantity ?? 0;

  const priceCents = variant?.priceCents ?? item.priceCents;
  const compareAt = variant ? variant.compareAtPriceCents : item.compareAtPriceCents;
  const discount = discountPercent(priceCents, compareAt);
  const inStock = variant ? variant.inStock : item.inStock;
  const checkedOn = formatStoreDate(item.priceCheckedAt);
  // With stock running low the server says how many are left: do not offer more than that.
  const maxQuantity = Math.max(1, Math.min(variant?.stockLeft ?? STORE_CART_MAX_QUANTITY, STORE_CART_MAX_QUANTITY) - inCart);
  const canAdd = !affiliate && Boolean(variant) && inStock && inCart < (variant?.stockLeft ?? STORE_CART_MAX_QUANTITY);

  const addToCart = () => {
    if (!variant || !canAdd) return;
    const added = cart.add(variant.id, Math.min(quantity, maxQuantity));
    if (!added) {
      sileo.warning({ title: 'Tu carrito está lleno.' });
      return;
    }
    setQuantity(1);
    sileo.success({ title: 'Agregado a tu carrito' });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-black tracking-[-0.02em] text-[#121212] dark:text-white">
            {formatPrice(priceCents)}
          </span>
          {discount ? (
            <>
              <span className="text-lg text-[#5a5a5a] line-through dark:text-[#9aa3b2]">
                <span className="sr-only">Antes </span>
                {formatPrice(compareAt)}
              </span>
              <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">-{discount} %</span>
            </>
          ) : null}
        </p>
        {affiliate ? (
          <p className="mt-1 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            Precio aproximado{checkedOn ? `, revisado el ${checkedOn}` : ''}. El precio final lo ves en Mercado Libre.
          </p>
        ) : null}
      </div>

      {!affiliate && variants.length > 1 ? (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-[#121212] dark:text-white">Elige una opción</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((entry) => {
              const selected = entry.id === variant?.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setVariantId(entry.id)}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-xl border-2 px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh',
                    selected
                      ? 'border-kadesh bg-kadesh-50 text-kadesh-700 dark:bg-kadesh/15 dark:text-kadesh-300'
                      : 'border-[#d8dee8] text-[#121212] hover:border-kadesh dark:border-white/15 dark:text-white',
                    !entry.inStock && 'opacity-60',
                  )}
                >
                  {entry.title || 'Única'}
                  {!entry.inStock ? <span className="ml-1.5 font-normal">(agotada)</span> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {!affiliate ? (
        <p
          className={cn(
            'text-sm font-semibold',
            inStock ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400',
          )}
        >
          {!inStock
            ? 'Agotado por ahora'
            : variant?.stockLeft
              ? `Disponible · ${variant.stockLeft === 1 ? 'queda 1' : `quedan ${variant.stockLeft}`}`
              : 'Disponible'}
        </p>
      ) : null}

      {!affiliate && inStock ? (
        <div className="flex items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-[#121212] dark:text-white">Cantidad</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            aria-label="Una pieza menos"
            className="inline-flex size-11 items-center justify-center rounded-xl border border-[#d8dee8] text-[#121212] hover:border-kadesh disabled:opacity-40 dark:border-white/15 dark:text-white"
          >
            <HugeiconsIcon icon={MinusSignIcon} size={18} aria-hidden="true" />
          </button>
          <span className="w-8 text-center font-semibold tabular-nums text-[#121212] dark:text-white" aria-live="polite">
            {Math.min(quantity, maxQuantity)}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
            disabled={quantity >= maxQuantity}
            aria-label="Una pieza más"
            className="inline-flex size-11 items-center justify-center rounded-xl border border-[#d8dee8] text-[#121212] hover:border-kadesh disabled:opacity-40 dark:border-white/15 dark:text-white"
          >
            <HugeiconsIcon icon={Add01Icon} size={18} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {!affiliate ? (
          <button
            type="button"
            onClick={addToCart}
            disabled={!canAdd}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
          >
            <HugeiconsIcon icon={ShoppingBag01Icon} size={18} aria-hidden="true" />
            {!inStock ? 'Agotado' : canAdd ? 'Agregar al carrito' : 'Ya llevas lo más que hay'}
          </button>
        ) : null}
        {affiliate && item.affiliateUrl ? (
          <a
            href={item.affiliateUrl}
            target="_blank"
            rel="sponsored nofollow noopener"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
          >
            Ver en Mercado Libre
            <HugeiconsIcon icon={LinkSquare02Icon} size={18} aria-hidden="true" />
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
        ) : null}
        <StoreWishlistButton productId={item.id} productName={item.name} variant="button" />
      </div>

      {affiliate ? null : (
        <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
          Lo vende y lo envía Kadesh.
          {inCart > 0 ? (
            <>
              {' '}
              Llevas {inCart} en tu carrito.{' '}
              <Link href={Routes.store.cart} className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300">
                Ver carrito
              </Link>
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}
