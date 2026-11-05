/** Clases del formulario de eventos (mismo estilo que el de reportes). */
/**
 * `cn` solo concatena (no resuelve conflictos de Tailwind): los campos de una línea y los de
 * varias comparten los colores, pero cada uno trae su propio alto y relleno.
 */
const fieldSkin =
  'mt-1 w-full rounded-xl border border-[#d8dee8] bg-white px-4 text-sm font-normal text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2]';

export const fieldClass = `${fieldSkin} min-h-11 py-2.5`;

/** Cuadro de texto: alto mínimo con `textareaClass(…)`. */
export function textareaClass(minHeight: 'min-h-24' | 'min-h-36'): string {
  return `${fieldSkin} ${minHeight} py-3 leading-relaxed`;
}

export const labelClass = 'block text-sm font-semibold text-[#3a3a3a] dark:text-[#d0d0d0]';

export const errorClass = 'mt-1.5 text-sm font-medium text-red-600 dark:text-red-400';

export const sectionClass =
  'rounded-3xl border border-[#ececec] bg-white p-5 shadow-[0_10px_30px_rgba(15,35,80,0.05)] dark:border-[#2a2a2a] dark:bg-[#1e1e1e] sm:p-6';
