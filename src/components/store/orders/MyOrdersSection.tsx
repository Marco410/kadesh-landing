'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { Routes } from 'kadesh/core/routes';
import { STORE_ORDERS_PAGE_SIZE } from '../constants';
import { formatPrice, formatStoreDate } from '../format';
import {
  MY_STORE_ORDERS_QUERY,
  MY_STORE_ORDER_QUERY,
  type MyStoreOrderResponse,
  type MyStoreOrdersResponse,
} from '../queries';
import OrderDetail, { OrderStatusPill } from './OrderDetail';

const cardClass = 'rounded-3xl border border-dash-line bg-dash-surface';

function OrderView({ number }: { number: string }) {
  const searchParams = useSearchParams();
  const { data, loading, error, refetch } = useQuery<MyStoreOrderResponse>(MY_STORE_ORDER_QUERY, {
    variables: { number },
    // Status, tracking and signed photo URLs must be fresh each time the order opens.
    fetchPolicy: 'network-only',
  });

  if (loading && !data) {
    return <p className={`${cardClass} p-6 text-dash-muted`} role="status">Cargando tu pedido…</p>;
  }
  if (error && !data) {
    return (
      <p className={`${cardClass} p-6 text-dash-soft`} role="alert">
        No pudimos cargar tu pedido. Recarga la página para intentar de nuevo.
      </p>
    );
  }
  if (!data?.myStoreOrder) {
    return (
      <div className={`${cardClass} p-8 text-center`}>
        <p className="mb-4 text-dash-soft">No encontramos ese pedido en tu cuenta.</p>
        <Link href={Routes.store.orders} className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300">
          Ver todos mis pedidos
        </Link>
      </div>
    );
  }
  return (
    <OrderDetail
      order={data.myStoreOrder}
      justPaid={searchParams.get('pagado') === '1'}
      justPlaced={searchParams.get('nuevo') === '1'}
      onChanged={() => void refetch()}
    />
  );
}

/**
 * Mi cuenta → Pedidos: the orders of the store, newest first, and one of them when `?pedido=` is
 * set. Asked when the view opens; the status is not polled.
 */
export default function MyOrdersSection() {
  const searchParams = useSearchParams();
  const number = searchParams.get('pedido');
  const [loadingMore, setLoadingMore] = useState(false);
  const { data, loading, error, fetchMore } = useQuery<MyStoreOrdersResponse>(MY_STORE_ORDERS_QUERY, {
    variables: { take: STORE_ORDERS_PAGE_SIZE, skip: 0 },
    fetchPolicy: 'cache-and-network',
    skip: Boolean(number),
  });

  if (number) return <OrderView key={number} number={number} />;

  const items = data?.myStoreOrders.items ?? [];
  const total = data?.myStoreOrders.total ?? 0;

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { take: STORE_ORDERS_PAGE_SIZE, skip: items.length },
        updateQuery: (previous, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previous;
          const seen = new Set(previous.myStoreOrders.items.map((order) => order.number));
          return {
            myStoreOrders: {
              ...fetchMoreResult.myStoreOrders,
              items: [
                ...previous.myStoreOrders.items,
                ...fetchMoreResult.myStoreOrders.items.filter((order) => !seen.has(order.number)),
              ],
            },
          };
        },
      });
    } finally {
      setLoadingMore(false);
    }
  };

  if (error && items.length === 0) {
    return (
      <p className={`${cardClass} p-6 text-dash-soft`} role="alert">
        No pudimos cargar tus pedidos. Recarga la página para intentar de nuevo.
      </p>
    );
  }
  if (loading && items.length === 0) {
    return <p className={`${cardClass} p-6 text-dash-muted`} role="status">Cargando tus pedidos…</p>;
  }
  if (items.length === 0) {
    return (
      <div className={`${cardClass} p-8 text-center`}>
        <p className="mb-2 text-lg font-semibold text-dash-ink">Todavía no tienes pedidos</p>
        <p className="mx-auto mb-6 max-w-md text-dash-muted">Lo que compres en la tienda aparecerá aquí, con su envío y su guía.</p>
        <Link
          href={Routes.store.index}
          className="inline-flex min-h-12 items-center rounded-full bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className={`${cardClass} divide-y divide-dash-line`}>
        {items.map((order) => (
          <li key={order.number}>
            <Link
              href={Routes.store.order(order.number)}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-dash-surface-2 sm:p-5"
            >
              <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-dash-surface-2">
                {order.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={order.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold tabular-nums text-dash-ink">{order.number}</span>
                  <OrderStatusPill order={order} />
                </p>
                <p className="mt-0.5 truncate text-sm text-dash-soft">
                  {order.firstItemName ?? 'Pedido'}
                  {order.itemsCount > 1 ? ` y ${order.itemsCount - 1} más` : ''}
                </p>
                <p className="text-xs text-dash-muted">{formatStoreDate(order.createdAt)}</p>
              </div>
              <p className="shrink-0 font-semibold tabular-nums text-dash-ink">{formatPrice(order.totalCents)}</p>
            </Link>
          </li>
        ))}
      </ul>
      {items.length < total ? (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="inline-flex min-h-12 items-center rounded-full border border-dash-line-strong px-6 font-semibold text-dash-ink hover:border-kadesh disabled:opacity-50"
          >
            {loadingMore ? 'Cargando…' : 'Ver más pedidos'}
          </button>
        </div>
      ) : null}
    </>
  );
}
