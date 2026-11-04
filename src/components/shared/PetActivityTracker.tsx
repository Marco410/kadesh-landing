"use client";

import { Suspense } from "react";
import { usePetActivity } from "kadesh/utils/activity";
import { useUser } from "kadesh/utils/UserContext";

function Tracker() {
  const { user } = useUser();
  usePetActivity(Boolean(user?.id));
  return null;
}

/**
 * Registra qué pantallas abre una persona con sesión y su tiempo activo (Operaciones →
 * Actividad → Navegación). `useSearchParams` necesita su propio Suspense.
 */
export default function PetActivityTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
