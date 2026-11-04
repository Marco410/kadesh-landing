"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const SUN =
  "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z";
const MOON = "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z";

/**
 * Botón de tema (claro/oscuro) de la barra del sitio y del panel. Las clases del botón y del
 * ícono las pone quien lo usa (`cn` no mezcla clases: no se sobrescriben, se pasan completas).
 * No se pinta hasta montar: el tema guardado solo se conoce en el cliente.
 */
export default function ThemeToggle({
  className,
  iconClassName = "w-5 h-5",
}: {
  className: string;
  iconClassName?: string;
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={className}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isDark ? SUN : MOON} />
      </svg>
    </button>
  );
}
