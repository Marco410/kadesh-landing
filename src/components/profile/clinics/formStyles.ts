/*
 * Campos y chips de los formularios del panel (clínicas y cartilla). Mismo lenguaje que el kit del
 * shell (`dashInputClass`, `DashFilterChips`): campos de 14 px con anillo azul suave al enfocar y
 * chips en píldora con la opción elegida en tinta. `cn` no mezcla clases: no se "sobrescriben" con
 * `className`; si hace falta otra variante, se agrega aquí.
 */

const FIELD_FOCUS =
  "transition-[border-color,box-shadow] focus:border-kadesh-400 focus:outline-none focus:ring-[3px] focus:ring-kadesh-500/15";

export const INPUT_CLASS =
  `w-full min-h-11 rounded-[14px] border border-dash-line-strong bg-dash-surface px-3.5 py-2.5 text-[15px] text-dash-ink placeholder:text-dash-muted ${FIELD_FOCUS}`;

export const COMPACT_SELECT_CLASS =
  `min-h-11 min-w-0 flex-1 rounded-[12px] border border-dash-line-strong bg-dash-surface px-2 text-sm text-dash-ink disabled:opacity-50 ${FIELD_FOCUS}`;

export const LABEL_CLASS = "mb-1.5 block text-[13px] font-semibold text-dash-soft";

export const SECTION_TITLE_CLASS = "text-[15px] font-semibold tracking-[-0.01em] text-dash-ink";

export const CHIP_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400";

/** La opción elegida va en tinta (negro en claro, blanco en oscuro), como los filtros del panel. */
export function chipTone(selected: boolean): string {
  return selected
    ? "border-dash-ink bg-dash-ink text-dash-on-ink"
    : "border-dash-line bg-dash-surface text-dash-soft hover:border-dash-line-strong hover:text-dash-ink";
}
