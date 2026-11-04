"use client";

import { createContext, useContext } from "react";

/**
 * `true` dentro de `AppShell`. Lo que se monta en un portal (`document.body`) queda fuera de
 * `.kd-dash` y no hereda su fuente: con esto un modal o menú compartido con el sitio público
 * sabe que debe ponerse `font-dash`. En el sitio vale `false` y se ve igual que antes.
 */
export const DashPortalContext = createContext(false);

export function useInDash(): boolean {
  return useContext(DashPortalContext);
}
