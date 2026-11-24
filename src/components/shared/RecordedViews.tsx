'use client';

import { useEffect, useRef, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon } from '@hugeicons/core-free-icons';
import { cn } from 'kadesh/utils/cn';

const RECORD_STORE_PRODUCT_VIEW = gql`
  mutation RecordStoreProductView($id: ID!) {
    result: recordStoreProductView(productId: $id) {
      counted
      viewsCount
    }
  }
`;

const RECORD_PET_PLACE_VIEW = gql`
  mutation RecordPetPlaceView($id: ID!) {
    result: recordPetPlaceView(placeId: $id) {
      counted
      viewsCount
    }
  }
`;

const MUTATIONS = { product: RECORD_STORE_PRODUCT_VIEW, petPlace: RECORD_PET_PLACE_VIEW } as const;

type RecordViewResponse = { result: { counted: boolean; viewsCount: number | null } | null };

const COUNT_FORMAT = new Intl.NumberFormat('es-MX');

/**
 * Counts the visit to a store product or a clinic page (one request when the page opens) and
 * shows the total the back returns. The back hides the number from the public while it is small
 * (the owner and admins always get it), and nothing shows while it answers or if it fails. The
 * total is not in the server query, so the cached page never depends on it.
 */
export default function RecordedViews({
  kind,
  id,
  className,
}: {
  kind: keyof typeof MUTATIONS;
  id: string;
  className?: string;
}) {
  const [viewsCount, setViewsCount] = useState<number | null>(null);
  const sentFor = useRef<string | null>(null);
  const [recordView] = useMutation<RecordViewResponse>(MUTATIONS[kind]);

  useEffect(() => {
    if (!id || sentFor.current === id) return;
    sentFor.current = id;
    recordView({ variables: { id } })
      .then(({ data }) => {
        const total = data?.result?.viewsCount;
        if (typeof total === 'number' && total > 0) setViewsCount(total);
      })
      .catch(() => {
        // No number: the page works the same.
      });
  }, [id, recordView]);

  if (viewsCount == null) return null;
  return (
    <span
      className={cn('inline-flex items-center gap-1 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]', className)}
      title="Personas que han visto esta página"
    >
      <HugeiconsIcon icon={ViewIcon} size={15} strokeWidth={2} aria-hidden />
      {COUNT_FORMAT.format(viewsCount)} {viewsCount === 1 ? 'vista' : 'vistas'}
    </span>
  );
}
