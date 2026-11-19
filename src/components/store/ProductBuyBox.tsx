'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { LinkSquare02Icon } from '@hugeicons/core-free-icons';
import { cn } from 'kadesh/utils/cn';
import { AFFILIATE_DISCLOSURE } from './constants';
import { discountPercent, formatPrice, formatStoreDate } from './format';
import { StoreWishlistButton } from './StoreWishlist';
import type { StoreItem, StoreVariant } from './types';

/**
 * Price, options and the action of a product.
 *
 * - Sold by Kadesh: price and stock of the chosen variant. Buying online arrives with the cart;
 *   until then the box says so instead of showing a button that does nothing.
 * - Mercado Libre: the price is approximate (with the date it was checked) and the button leaves
 *   to Mercado Libre through the affiliate link, with its disclosure.
 */
export default function ProductBuyBox({ item, variants }: { item: StoreItem; variants: StoreVariant[] }) {
  const affiliate = item.seller === 'mercado_libre';
  const firstAvailable = variants.find((variant) => variant.inStock) ?? variants[0] ?? null;
  const [variantId, setVariantId] = useState<string | null>(firstAvailable?.id ?? null);
  const variant = variants.find((entry) => entry.id === variantId) ?? firstAvailable;

  const priceCents = variant?.priceCents ?? item.priceCents;
  const compareAt = variant ? variant.compareAtPriceCents : item.compareAtPriceCents;
  const discount = discountPercent(priceCents, compareAt);
  const inStock = variant ? variant.inStock : item.inStock;
  const checkedOn = formatStoreDate(item.priceCheckedAt);

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

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

      {affiliate ? (
        <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">{AFFILIATE_DISCLOSURE}</p>
      ) : (
        <p className="rounded-xl bg-[#f7f8fa] px-4 py-3 text-sm text-[#3a3a3a] dark:bg-white/5 dark:text-[#d0d0d0]">
          Lo vende Kadesh. La compra en línea llega muy pronto: guárdalo en tu lista de deseos para tenerlo a la mano.
        </p>
      )}
    </div>
  );
}
