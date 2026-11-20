import type { Metadata } from 'next';
import CartPage from 'kadesh/components/store/cart/CartPage';

export const metadata: Metadata = {
  title: 'Tu carrito | Tienda Kadesh Pet',
  robots: { index: false, follow: false },
};

/** `/tienda/carrito`: the cart lives in the browser, so the page is all client. */
export default function StoreCartPage() {
  return <CartPage />;
}
