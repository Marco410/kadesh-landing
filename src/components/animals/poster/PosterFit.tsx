'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { POSTER_FIT_ID, POSTER_FIT_INNER_ID } from 'kadesh/components/animals/poster/fit';

/**
 * Shows the poster as a scaled-down copy of the printed sheet on small screens, instead of
 * squeezing the layout (which crushed the photo and clipped the text). Uses `zoom` (not
 * `transform`) so the wrapper's height follows the scaled sheet. Printing resets the zoom.
 */
export default function PosterFit({ widthPx, children }: { widthPx: number; children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const fit = () => {
      inner.style.zoom = String(Math.min(1, outer.clientWidth / widthPx));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(outer);
    return () => observer.disconnect();
  }, [widthPx]);

  return (
    <div ref={outerRef} id={POSTER_FIT_ID} className="mx-auto w-full" style={{ maxWidth: widthPx }}>
      {/* The zoom is set from the DOM (script + effect), not from React: no hydration mismatch. */}
      <div ref={innerRef} id={POSTER_FIT_INNER_ID} suppressHydrationWarning style={{ width: widthPx }}>
        {children}
      </div>
    </div>
  );
}
