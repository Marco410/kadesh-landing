"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import {
  AUTHENTICATE_USER_WITH_GOOGLE_MUTATION,
  type AuthenticateUserWithGoogleResponse,
  type AuthenticateUserWithGoogleVariables,
} from "kadesh/utils/queries";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import type { AuthenticatedItem } from "kadesh/utils/types";
import { loadGoogleGsiScript } from "kadesh/utils/load-google-gsi";
import { friendlyAuthError } from "kadesh/components/auth/authErrors";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          prompt: (
            momentListener?: (notification: {
              isDisplayed: () => boolean;
            }) => void,
          ) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

interface UseGoogleLoginOptions {
  redirectTo?: string | null;
}

/**
 * `google.accounts.id.initialize` es global: si se llama varias veces, solo vale la última. Con
 * varios botones en la misma página (un modal de cuenta por cada "Reportar" del home, cada uno con
 * su `redirectTo`) el clic podía responder con el callback de otro. Se inicializa una sola vez con
 * un despachador y cada botón, al dibujarse, se vuelve el activo.
 */
let activeCredentialHandler: ((response: { credential: string }) => void) | null = null;
let gsiInitialized = false;

export function useGoogleLogin(options?: UseGoogleLoginOptions) {
  const router = useRouter();
  const { refreshUser, setUser } = useUser();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const buttonRendered = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderedOnContainerRef = useRef<HTMLDivElement | null>(null);

  const [authenticateWithGoogle] = useMutation<
    AuthenticateUserWithGoogleResponse,
    AuthenticateUserWithGoogleVariables
  >(AUTHENTICATE_USER_WITH_GOOGLE_MUTATION, {
    onCompleted: async (data) => {
      const result = data?.authenticateUserWithGoogle;
      if (!result) {
        setError("Error al iniciar sesión con Google");
        setLoading(false);
        return;
      }

      if (result.__typename === "UserAuthenticationWithGoogleSuccess") {
        const { item, sessionToken } = result;
        // En Google login NO guardamos el `sessionToken` custom en localStorage/cookie,
        // porque Keystone autentica `authenticatedItem` con su propia sesión (cookie)
        // iniciada en el backend. Guardar un token distinto rompe la sesión.
        if (typeof window !== "undefined") {
          localStorage.removeItem("keystonejs-session-token");
        }
        console.log("result", result);

        if (sessionToken){
          localStorage.setItem("keystonejs-session-token", sessionToken);
          const expires = new Date();
          expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
          const isSecure = window.location.protocol === "https:";
          document.cookie = `keystonejs-session=${sessionToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
        }
        const u = item as AuthenticatedItem & {
          roles?: Array<{ name: string; __typename?: string }>;
          __typename?: string;
        };
        const userFromLogin: AuthenticatedItem = {
          id: u.id,
          name: u.name ?? "",
          lastName: u.lastName ?? "",
          secondLastName: u.secondLastName ?? null,
          username: u.username ?? u.email ?? "",
          email: u.email ?? "",
          verified: u.verified ?? false,
          phone: u.phone && u.phone !== "" ? u.phone : null,
          profileImage: u.profileImage ?? null,
          roles: Array.isArray(u.roles)
            ? u.roles.map((r) => ({ name: r.name }))
            : null,
          birthday: u.birthday ?? null,
          age: u.age ?? null,
          createdAt: u.createdAt ?? new Date().toISOString(),
        };
        setUser(userFromLogin);
        await refreshUser();
        setLoading(false);
        if (options?.redirectTo) {
          router.push(options.redirectTo);
        } else {
          router.push(Routes.home);
        }
      } else if (result.__typename === "UserAuthenticationWithGoogleFailure") {
        setError(
          friendlyAuthError(
            result.message,
            "No se pudo iniciar sesión con Google. Intenta de nuevo.",
          ),
        );
        setLoading(false);
      }
    },
    onError: (err) => {
      setError(
        friendlyAuthError(
          err,
          "No se pudo iniciar sesión con Google. Intenta de nuevo.",
        ),
      );
      setLoading(false);
    },
  });

  const handleCredential = useCallback(
    (response: { credential: string }) => {
      setError("");
      setLoading(true);
      authenticateWithGoogle({
        variables: { idToken: response.credential, product: "pet" },
      });
    },
    [authenticateWithGoogle],
  );

  const initAndRenderButton = useCallback(() => {
    const container = containerRef.current;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!container || !clientId) return;
    // El botón que se acaba de montar es el que la persona ve: su callback es el que responde.
    activeCredentialHandler = handleCredential;
    // Re-render if we're on a different container (e.g. switched tab)
    if (buttonRendered.current && renderedOnContainerRef.current === container)
      return;

    loadGoogleGsiScript()
      .then((google) => {
        if (!containerRef.current) return;
        const target = containerRef.current;
        if (buttonRendered.current && renderedOnContainerRef.current === target)
          return;

        if (!gsiInitialized) {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => activeCredentialHandler?.(response),
            auto_select: false,
          });
          gsiInitialized = true;
        }

        google.accounts.id.renderButton(target, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
          // Ancho del contenedor dentro del rango que acepta Google (200–400 px); con un mínimo
          // fijo de 320 se cortaba en la tarjeta del login en teléfonos.
          width: Math.min(400, Math.max(200, target.offsetWidth || 0)),
          locale: "es",
        });
        buttonRendered.current = true;
        renderedOnContainerRef.current = target;
      })
      .catch((err) => {
        setError(
          friendlyAuthError(
            err,
            "No se pudo cargar Google. Recarga la página.",
          ),
        );
      });
  }, [handleCredential]);

  /** Callback ref: pass to the div where the Google button should be rendered. Avoids FedCM. */
  const googleButtonRef = useCallback(
    (el: HTMLDivElement | null) => {
      containerRef.current = el;
      if (!el) {
        renderedOnContainerRef.current = null;
        return;
      }
      // When switching tabs we get a new container; allow re-render on it
      if (el !== renderedOnContainerRef.current) {
        buttonRendered.current = false;
      }
      initAndRenderButton();
    },
    [initAndRenderButton],
  );

  return {
    googleButtonRef,
    loading,
    error,
    setError,
  };
}
