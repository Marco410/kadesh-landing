"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ANIMAL_DETAIL_ACTION_PARAM,
  parseAnimalDetailAction,
  type AnimalDetailAction,
} from 'kadesh/components/animals/constants';

/**
 * `?accion=` de la ficha (enlaces del correo «Tu reporte ya está publicado»). Se lee una vez al
 * entrar y se guarda aquí, así sobrevive al `replace` que corrige el slug. `clear` quita el
 * parámetro de la URL para que al recargar no se vuelva a abrir nada.
 *
 * Se lee de `window.location` y no con `useSearchParams`, que obligaría a envolver la ficha en
 * `Suspense`.
 */
export function useDetailAction(): {
  action: AnimalDetailAction | null;
  clear: () => void;
} {
  const router = useRouter();
  const [action, setAction] = useState<AnimalDetailAction | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAction(parseAnimalDetailAction(params.get(ANIMAL_DETAIL_ACTION_PARAM)));
  }, []);

  const clear = useCallback(() => {
    setAction(null);
    const params = new URLSearchParams(window.location.search);
    if (!params.has(ANIMAL_DETAIL_ACTION_PARAM)) return;
    params.delete(ANIMAL_DETAIL_ACTION_PARAM);
    const search = params.toString();
    router.replace(`${window.location.pathname}${search ? `?${search}` : ''}`, { scroll: false });
  }, [router]);

  return { action, clear };
}
