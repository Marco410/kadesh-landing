'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * The report's name as the server read it (`animales/[slug]/layout.tsx`). The record itself loads in
 * the browser, so without this the HTML had no `<h1>`: the loading state shows this name as the
 * heading, and search engines and AI that do not run JavaScript read it.
 */
const ServerTitleContext = createContext<string | null>(null);

export function AnimalServerTitle({ title, children }: { title: string; children: ReactNode }) {
  return <ServerTitleContext.Provider value={title}>{children}</ServerTitleContext.Provider>;
}

export function useAnimalServerTitle(): string | null {
  return useContext(ServerTitleContext);
}
