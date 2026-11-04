import { redirect } from 'next/navigation';
import { Routes } from 'kadesh/core/routes';

export default function VentasRedirectLayout() {
  redirect(Routes.profile);
}
