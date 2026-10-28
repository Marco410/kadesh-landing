"use client";

import { useGoogleLogin } from "kadesh/components/auth/hooks";

interface GoogleAuthSectionProps {
  /** A dónde va después de entrar o crear la cuenta con Google. */
  redirectTo?: string | null;
  /** Texto del separador. */
  dividerLabel?: string;
  /** El separador va antes del botón (debajo de un formulario) o después (botón primero). */
  dividerPosition?: "before" | "after";
  /** Fondo del contenedor, para que la etiqueta del separador tape la línea. */
  surfaceClassName?: string;
}

/**
 * "Continuar con Google" con su separador, estado de carga y error. Sirve para entrar y para crear
 * cuenta: el backend busca por correo y, si no existe, la crea como cuenta de Pet.
 * Sin `NEXT_PUBLIC_GOOGLE_CLIENT_ID` no se muestra nada.
 */
export default function GoogleAuthSection({
  redirectTo,
  dividerLabel = "O continúa con",
  dividerPosition = "before",
  surfaceClassName = "bg-white dark:bg-[#1e1e1e]",
}: GoogleAuthSectionProps) {
  const { googleButtonRef, loading, error } = useGoogleLogin({ redirectTo });

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;

  const divider = (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-[#e0e0e0] dark:border-[#3a3a3a]" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className={`${surfaceClassName} px-3 font-medium text-[#616161] dark:text-[#b0b0b0]`}>
          {dividerLabel}
        </span>
      </div>
    </div>
  );

  return (
    <div>
      {dividerPosition === "before" ? divider : null}
      <div
        ref={googleButtonRef}
        className="flex min-h-[48px] w-full items-center justify-center overflow-hidden rounded-xl [&>div]:!min-h-[48px] [&>div]:!w-full [&>div]:!justify-center"
        aria-label="Continuar con Google"
      />
      {loading ? (
        <p className="mt-2 text-center text-sm text-[#616161] dark:text-[#b0b0b0]">Conectando con Google…</p>
      ) : null}
      {error ? (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
        >
          {error}
        </div>
      ) : null}
      {dividerPosition === "after" ? divider : null}
    </div>
  );
}
