"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApolloClient } from "@apollo/client";
import { END_SESSION_MUTATION, EndSessionResponse } from "kadesh/utils/queries";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";

/**
 * Cierra la sesión en Keystone (`endSession`) y luego en el navegador.
 * `endSession` va primero para que el authLink aún mande el Bearer; si falla
 * (sin red, sesión vencida) el cierre local sigue igual y no se avisa al usuario.
 */
export function useLogout() {
  const router = useRouter();
  const client = useApolloClient();
  const { setUser } = useUser();

  return useCallback(async () => {
    try {
      await client.mutate<EndSessionResponse>({ mutation: END_SESSION_MUTATION });
    } catch (error) {
      console.error("Error al cerrar la sesión en el servidor:", error);
    }

    localStorage.removeItem("keystonejs-session-token");
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    try {
      await client.clearStore();
    } catch (error) {
      console.error("Error al limpiar la caché de Apollo:", error);
    }

    setUser(undefined);
    router.push(Routes.home);
  }, [client, router, setUser]);
}
