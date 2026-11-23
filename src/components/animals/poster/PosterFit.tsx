'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { fitPoster, POSTER_FIT_ID, POSTER_FIT_INNER_ID } from 'kadesh/components/animals/poster/fit';

/**
 * Shows the poster as a scaled-down copy of the printed sheet on small screens, instead of
 * squeezing the layout (which crushed the photo and clipped the text). Scales with `transform`
 * and sets the wrapper's height from the scaled sheet (see `fitPoster`). Printing resets both.
 */
export default function PosterFit({ widthPx, children }: { widthPx: number; children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const fit = () => fitPoster(outer, inner, widthPx);
    fit();
    // Width changes (rotation, resize) and late font loads that change the sheet's height.
    const observer = new ResizeObserver(fit);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [widthPx]);

  return (
    <div
      ref={outerRef}
      id={POSTER_FIT_ID}
      suppressHydrationWarning
      className="mx-auto w-full overflow-hidden print:overflow-visible"
      style={{ maxWidth: widthPx }}
    >
      {/* The scale is set from the DOM (script + effect), not from React: no hydration mismatch. */}
      <div ref={innerRef} id={POSTER_FIT_INNER_ID} suppressHydrationWarning style={{ width: widthPx }}>
        {children}
      </div>
    </div>
  );
}
