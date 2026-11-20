/** Real size of a letter sheet in CSS px (96 px per inch). */
export const POSTER_WIDTH_PX = { portrait: 816, landscape: 1056 } as const;

export const POSTER_FIT_ID = 'poster-fit';
export const POSTER_FIT_INNER_ID = 'poster-fit-inner';

/**
 * Sets the zoom so the sheet (laid out at its real size) fits the available width. Runs as an
 * inline script right after the server HTML, so the first paint is already scaled; `PosterFit`
 * repeats it on every resize. Never zooms in: on a wide screen the sheet stays at 100 %.
 */
export function posterFitScript(widthPx: number): string {
  return `(function(){var o=document.getElementById('${POSTER_FIT_ID}'),i=document.getElementById('${POSTER_FIT_INNER_ID}');if(o&&i)i.style.zoom=String(Math.min(1,o.clientWidth/${widthPx}));})();`;
}
