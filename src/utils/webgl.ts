/**
 * WebGL en el navegador. Lo necesita el mapa (MapLibre); sin él, MapLibre lanza al crear el mapa
 * `Failed to initialize WebGL` (o un JSON con `requestedAttributes`, si el navegador dio detalle).
 *
 * Pasa en navegadores sin GPU: crawlers de vista previa de enlaces (Meta usa un Chrome headless
 * con user agent normal), equipos con WebGL desactivado o drivers en lista negra.
 */

/** Los mismos atributos que exige MapLibre (`_setupPainter`), para que la prueba no diga "sí" de más. */
const MAPLIBRE_CONTEXT: WebGLContextAttributes = {
  alpha: true,
  depth: true,
  stencil: true,
  premultipliedAlpha: true,
  antialias: false,
  preserveDrawingBuffer: false,
  failIfMajorPerformanceCaveat: false,
};

let supported: boolean | null = null;

/**
 * ¿Se puede crear un contexto WebGL como el que pide el mapa? Prueba `webgl2` y luego `webgl`
 * en un canvas suelto, libera el contexto (el navegador limita cuántos hay abiertos) y guarda el
 * resultado para no repetir la prueba en cada mapa. Fuera del navegador responde `false` sin guardar.
 */
export function hasWebGLSupport(): boolean {
  if (supported !== null) return supported;
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", MAPLIBRE_CONTEXT) ?? canvas.getContext("webgl", MAPLIBRE_CONTEXT);
    supported = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    supported = false;
  }
  return supported;
}

const WEBGL_ERROR = /WebGL|"requestedAttributes"/i;

/** El error viene de que no hubo WebGL (no es un error de código de Kadesh). */
export function isWebGLError(error: unknown): boolean {
  const message =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error
        ? (error as { message?: unknown }).message
        : null;
  return typeof message === "string" && WEBGL_ERROR.test(message);
}
