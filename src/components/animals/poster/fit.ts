/** Real size of a letter sheet in CSS px (96 px per inch). */
export const POSTER_WIDTH_PX = { portrait: 816, landscape: 1056 } as const;

export const POSTER_FIT_ID = 'poster-fit';
export const POSTER_FIT_INNER_ID = 'poster-fit-inner';

/**
 * Scales the sheet (laid out at its real size) with `transform` so it fits the available width,
 * and sets the wrapper's height to the scaled sheet's height (a transform does not change layout).
 * Never zooms in: on a wide screen the sheet stays at 100 %.
 *
 * Not CSS `zoom`: Safari on iOS does not apply `zoom` to `rem` lengths, so Tailwind's font sizes
 * and paddings stayed full size inside a shrunken box (overflowing title, photo with no height).
 *
 * Self-contained on purpose: `posterFitScript` inlines its source as the pre-paint script.
 */
export function fitPoster(outer: HTMLElement, inner: HTMLElement, widthPx: number): void {
  const scale = Math.min(1, outer.clientWidth / widthPx);
  inner.style.transformOrigin = 'top left';
  inner.style.transform = scale < 1 ? `scale(${scale})` : '';
  outer.style.height = scale < 1 ? `${Math.ceil(inner.offsetHeight * scale)}px` : '';
}

/**
 * Inline script right after the server HTML, so the first paint is already scaled; `PosterFit`
 * repeats it on every resize.
 */
export function posterFitScript(widthPx: number): string {
  return `(function(){var o=document.getElementById('${POSTER_FIT_ID}'),i=document.getElementById('${POSTER_FIT_INNER_ID}');if(!o||!i)return;var s=Math.min(1,o.clientWidth/${widthPx});i.style.transformOrigin='top left';i.style.transform=s<1?'scale('+s+')':'';o.style.height=s<1?Math.ceil(i.offsetHeight*s)+'px':'';})();`;
}
