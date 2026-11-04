import { Suspense, type ReactNode } from "react";
import ProfileShell from "kadesh/components/profile/shell/ProfileShell";

/**
 * Panel con sesión (Mi cuenta): `/perfil` y `/notificaciones` comparten este shell, que se monta
 * una vez y no se remonta al navegar entre ellas. Cada ruta conserva su `layout.tsx` con su
 * metadata (`noindex`). El `Suspense` es por `useSearchParams` del shell.
 */
export default function CuentaLayout({ children }: { children: ReactNode }) {
  return (
    // El fallback es el lienzo del panel (sin destello blanco mientras hidrata).
    <Suspense fallback={<div className="kd-dash font-dash min-h-dvh" aria-busy="true" />}>
      <ProfileShell>{children}</ProfileShell>
    </Suspense>
  );
}
