'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { RECORD_EVENT_VIEW_MUTATION, type RecordEventViewResponse } from '../queries';

/**
 * Registra la vista de la ficha (una vez por evento montado) y devuelve el total de vistas.
 * `null` mientras no responde o si falla: la ficha no muestra el número. El total no viene en la
 * consulta del servidor para que las fichas no dependan de este campo.
 */
export function useEventViews(eventId: string): number | null {
  const [viewsCount, setViewsCount] = useState<number | null>(null);
  const sentFor = useRef<string | null>(null);
  const [recordView] = useMutation<RecordEventViewResponse>(RECORD_EVENT_VIEW_MUTATION);

  useEffect(() => {
    if (!eventId || sentFor.current === eventId) return;
    sentFor.current = eventId;
    recordView({ variables: { eventId } })
      .then(({ data }) => {
        const total = data?.recordPetEventView?.viewsCount;
        if (typeof total === 'number') setViewsCount(total);
      })
      .catch(() => {
        // Sin número: la ficha funciona igual.
      });
  }, [eventId, recordView]);

  return viewsCount;
}
