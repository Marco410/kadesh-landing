import StoreShowcase from 'kadesh/components/store/StoreShowcase';
import { fetchStoreShowcase } from 'kadesh/components/store/server';
import VeterinaryDetailClient from './VeterinaryDetailClient';

/**
 * The page itself is painted in the browser (`VeterinaryDetailClient`). The server only adds the
 * store box: one cached request shared by every veterinary page, none while the store is closed.
 */
export default async function VeterinaryDetailPage() {
  const products = await fetchStoreShowcase();
  return <VeterinaryDetailClient storeShowcase={<StoreShowcase items={products} />} />;
}
