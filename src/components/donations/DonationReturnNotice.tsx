'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { sileo } from 'sileo';
import { SETTLE_DONATION_MUTATION } from './queries';

/**
 * When the bank sent the person away to confirm the card (3-D Secure), the payment comes back to
 * `/donaciones?patita=gracias`: thank them once and clean the address.
 */
export default function DonationReturnNotice() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shown = useRef(false);
  const [settleDonation] = useMutation<{ settleDonation: boolean }>(SETTLE_DONATION_MUTATION);

  useEffect(() => {
    if (shown.current || params.get('patita') !== 'gracias') return;
    shown.current = true;
    const status = params.get('redirect_status');
    if (status && status !== 'succeeded') {
      sileo.error({ title: 'No se completó el pago', description: 'No se hizo ningún cobro. Puedes intentar con otra tarjeta.' });
    } else {
      // Same as after paying in the form: confirm it with the back without waiting for the webhook.
      const donationId = params.get('d');
      if (donationId) void settleDonation({ variables: { donationId } }).catch(() => undefined);
      sileo.success({ title: '¡Gracias por tu patita!', description: 'Tu mensaje aparecerá en el muro en unos minutos.' });
    }
    router.replace(pathname, { scroll: false });
  }, [params, pathname, router, settleDonation]);

  return null;
}
