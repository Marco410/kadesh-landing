'use client';

import { useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from 'react';
import { cn } from 'kadesh/utils/cn';

const ITEM_SELECTOR = '[data-ally-avatar]';

/**
 * Lo único de cliente del muro de aliados: Esc esconde la etiqueta que está a la vista (WCAG
 * 1.4.13) hasta que el puntero o el foco pasan a otro aliado. Las etiquetas son CSS puro
 * (`group-hover` / `group-focus-visible`) y se apagan con `data-dismissed` en este contenedor.
 */
export default function AlliesWallFrame({ children, className }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dismissedItems = useRef<Element[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const root = rootRef.current;
      if (event.key !== 'Escape' || !root) return;
      const hovered = root.querySelector(`${ITEM_SELECTOR}:hover`);
      const focused = document.activeElement?.closest(ITEM_SELECTOR) ?? null;
      const items = [hovered, focused].filter((item): item is Element => Boolean(item && root.contains(item)));
      if (items.length === 0) return;
      dismissedItems.current = items;
      setDismissed(true);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const onEnter = (event: SyntheticEvent) => {
    if (!dismissed) return;
    const item = (event.target as Element).closest?.(ITEM_SELECTOR);
    if (item && !dismissedItems.current.includes(item)) {
      dismissedItems.current = [];
      setDismissed(false);
    }
  };

  const onLeave = () => {
    // Si el foco sigue en el aliado descartado, su etiqueta se queda escondida.
    if (!dismissed || rootRef.current?.contains(document.activeElement)) return;
    dismissedItems.current = [];
    setDismissed(false);
  };

  return (
    <div
      ref={rootRef}
      className={cn('group/wall', className)}
      data-dismissed={dismissed ? 'true' : undefined}
      onPointerOver={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
    >
      {children}
    </div>
  );
}
