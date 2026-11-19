'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Delete02Icon, MinusSignIcon, ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { Footer, Navigation } from 'kadesh/components/layout';
import { Bone } from 'kadesh/components/ui/skeleton';
import { Routes } from 'kadesh/core/routes';
import { formatPrice } from '../format';
import type { CartLine } from '../types';
import { cart } from './cartStore';
import CartSummary from './CartSummary';
import CouponField from './CouponField';
import { useCartQuote } from './useCartQuote';

const stepButtonClass =
  'inline-flex size-11 items-center justify-center rounded-xl border border-[#d8dee8] text-[#121212] hover:border-kadesh disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-white/15 dark:text-white';

function CartRow({ line }: { line: CartLine }) {
  const href = line.slug ? Routes.store.product(line.slug) : null;
  return (
    <li className="flex gap-4 py-5">
      <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-[#f3f5f8] dark:bg-[#2a3548] sm:size-24">
        {line.coverUrl ? (
          // Product photos can live on any host: a plain <img>, not next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={line.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-[#121212] dark:text-white">
              {href ? (
                <Link href={href} className="hover:underline">
                  {line.name}
                </Link>
              ) : (
                line.name
              )}
            </p>
            {line.variantTitle ? <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">{line.variantTitle}</p> : null}
            <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">{formatPrice(line.unitPriceCents)} c/u</p>
          </div>
          <p className="shrink-0 font-black tabular-nums text-[#121212] dark:text-white">{formatPrice(line.lineTotalCents)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cart.setQuantity(line.variantId, line.quantity - 1)}
            aria-label={`Quitar una pieza de ${line.name}`}
            className={stepButtonClass}
          >
            <HugeiconsIcon icon={MinusSignIcon} size={18} aria-hidden="true" />
          </button>
          <span className="w-8 text-center font-semibold tabular-nums text-[#121212] dark:text-white" aria-live="polite">
            {line.quantity}
          </span>
          <button
            type="button"
            onClick={() => cart.setQuantity(line.variantId, line.quantity + 1)}
            disabled={line.quantity >= line.maxQuantity}
            aria-label={`Agregar una pieza de ${line.name}`}
            className={stepButtonClass}
          >
            <HugeiconsIcon icon={Add01Icon} size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => cart.remove(line.variantId)}
            aria-label={`Sacar ${line.name} del carrito`}
            className="ml-auto inline-flex size-11 items-center justify-center rounded-xl text-[#5a5a5a] hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh dark:text-[#b0b0b0] dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <HugeiconsIcon icon={Delete02Icon} size={20} aria-hidden="true" />
          </button>
        </div>
        {line.quantity >= line.maxQuantity ? (
          <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">Es lo más que puedes llevar por ahora.</p>
        ) : null}
      </div>
    </li>
  );
}

/**
 * `/tienda/carrito`. The lines come from the browser's cart; names, prices, stock and the total
 * come from the server's quote. One request when it opens and one per pause after a change.
 */
export default function CartPage() {
  const { items, quote, loading, error, notices, couponNotice, refresh } = useCartQuote();
  const empty = items.length === 0;

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-4xl">Tu carrito</h1>

        {notices.length > 0 ? (
          <div role="status" className="mb-6 rounded-2xl bg-amber-50 px-5 py-4 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
            <p className="mb-1 font-semibold">Ajustamos tu carrito</p>
            <ul className="list-disc pl-5 text-sm">
              {notices.map((notice) => (
                <li key={notice}>{notice}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {empty ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#d8dee8] px-6 py-16 text-center dark:border-white/15">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={48} strokeWidth={1.3} className="mb-4 text-[#9aa3b2]" aria-hidden="true" />
            <p className="mb-2 text-lg font-bold text-[#121212] dark:text-white">Tu carrito está vacío</p>
            <p className="mb-6 max-w-md text-[#5a5a5a] dark:text-[#b0b0b0]">Lo que agregues desde la tienda aparecerá aquí.</p>
            <Link
              href={Routes.store.index}
              className="inline-flex min-h-12 items-center rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
            >
              Ir a la tienda
            </Link>
          </div>
        ) : error && !quote ? (
          <div role="alert" className="rounded-2xl border border-[#ececec] p-6 text-center dark:border-[#2a2a2a]">
            <p className="mb-4 text-[#3a3a3a] dark:text-[#d0d0d0]">No pudimos calcular tu carrito. Revisa tu conexión e intenta de nuevo.</p>
            <button
              type="button"
              onClick={refresh}
              className="inline-flex min-h-12 items-center rounded-xl border border-[#d8dee8] px-6 font-semibold text-[#121212] hover:border-kadesh dark:border-white/15 dark:text-white"
            >
              Reintentar
            </button>
          </div>
        ) : !quote ? (
          <div className="flex flex-col gap-4" aria-busy="true" aria-label="Calculando tu carrito">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-4">
                <Bone kind="box" className="size-20 sm:size-24" />
                <div className="flex flex-1 flex-col gap-2">
                  <Bone kind="title" width="60%" />
                  <Bone kind="line" width="30%" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <ul className={`divide-y divide-[#ececec] dark:divide-[#2a2a2a] ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
              {quote.lines.map((line) => (
                <CartRow key={line.variantId} line={line} />
              ))}
            </ul>
            <CartSummary
              quote={quote}
              className="self-start lg:sticky lg:top-28"
              coupon={<CouponField quote={quote} notice={couponNotice} busy={loading} />}
            >
              {quote.canCheckout && !loading ? (
                <Link
                  href={Routes.store.checkout}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
                >
                  Continuar a pagar
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#e8edf3] px-6 font-semibold text-[#5a5a5a] dark:bg-white/10 dark:text-[#9aa3b2]"
                >
                  {loading ? 'Calculando…' : 'Continuar a pagar'}
                </span>
              )}
              <Link href={Routes.store.index} className="text-center text-sm font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300">
                Seguir comprando
              </Link>
            </CartSummary>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
