"use client";

import { useRef } from "react";

/**
 * El último valor no nulo. Para un modal que se abre con un objeto (`target`) y se cierra
 * poniéndolo en `null`: mientras anima su salida sigue mostrando el contenido que tenía.
 */
export function useLatched<T>(value: T | null | undefined): T | null {
  const last = useRef<T | null>(value ?? null);
  if (value != null) last.current = value;
  return value ?? last.current;
}
