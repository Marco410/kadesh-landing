"use client";

import { useEffect, useRef } from "react";

/** Para `skipPollAttempt` de Apollo: con la pestaña oculta no se pide nada. */
export function isTabHidden(): boolean {
  return typeof document !== "undefined" && document.visibilityState === "hidden";
}

/**
 * Pareja de un `pollInterval` con `skipPollAttempt: isTabHidden`: al volver a la pestaña vuelve a
 * pedir si pasó más de `staleMs` desde la última vez (si no, lo que hay sigue vigente). Así una
 * pestaña olvidada no le pide nada al backend y, al regresar, el dato se pone al día sin esperar
 * al siguiente ciclo.
 */
export function useRefetchOnTabReturn(
  refetch: () => Promise<unknown>,
  { skip = false, staleMs }: { skip?: boolean; staleMs: number },
) {
  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  });

  useEffect(() => {
    if (skip) return;
    let hiddenAt: number | null = null;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      const away = hiddenAt === null ? 0 : Date.now() - hiddenAt;
      hiddenAt = null;
      if (away >= staleMs && navigator.onLine !== false) {
        void refetchRef.current().catch(() => undefined);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [skip, staleMs]);
}
