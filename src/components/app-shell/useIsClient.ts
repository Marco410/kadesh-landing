"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** `true` solo en el cliente, ya hidratado. Para lo que depende de la hora o de `window` (saludo). */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
