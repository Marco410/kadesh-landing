import type { Metadata } from 'next';
import CheckoutPage from 'kadesh/components/store/checkout/CheckoutPage';

export const metadata: Metadata = {
  title: 'Finalizar compra | Tienda Kadesh Pet',
  robots: { index: false, follow: false },
};

/** `/tienda/pagar`: checkout. Works with or without a session (it creates the account). */
export default function StoreCheckoutPage() {
  return <CheckoutPage />;
}
