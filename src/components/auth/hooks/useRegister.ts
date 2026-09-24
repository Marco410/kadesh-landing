"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import {
  CREATE_USER_MUTATION,
  AUTHENTICATE_USER_MUTATION,
  CreateUserVariables,
  CreateUserResponse,
  AuthenticateUserVariables,
  AuthenticateUserResponse,
} from "kadesh/utils/queries";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import type { AuthenticatedItem } from "kadesh/utils/types";
import { friendlyAuthError } from "kadesh/components/auth/authErrors";

interface UseRegisterOptions {
  onSuccess?: () => void;
  /** Called when the account was created but auto-login failed. */
  onAutoLoginFailed?: () => void;
  redirectTo?: string | null;
}

export function useRegister(options?: UseRegisterOptions) {
  const router = useRouter();
  const { refreshUser, setUser } = useUser();
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [authenticateUser] = useMutation<
    AuthenticateUserResponse,
    AuthenticateUserVariables
  >(AUTHENTICATE_USER_MUTATION);

  const [createUser] = useMutation<CreateUserResponse, CreateUserVariables>(
    CREATE_USER_MUTATION,
    {
      onError: (error) => {
        setError(
          friendlyAuthError(
            error,
            "No se pudo crear la cuenta. Intenta de nuevo.",
          ),
        );
      },
    },
  );

  const clearForm = () => {
    setName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const redirectAfterAuth = () => {
    if (options?.redirectTo) {
      router.push(options.redirectTo);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(Routes.home);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !lastName || !email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    // Capture before any async work clears or races with state.
    const savedEmail = email;
    const savedPassword = password;

    setIsSubmitting(true);
    try {
      try {
        await createUser({
          variables: {
            data: {
              name,
              lastName,
              email: savedEmail,
              password: savedPassword,
              phone: phone || undefined,
              product: "pet",
            },
          },
        });
      } catch {
        // onError already set a friendly message
        return;
      }

      try {
        const { data } = await authenticateUser({
          variables: {
            email: savedEmail,
            password: savedPassword,
          },
        });

        if (
          data?.authenticateUserWithPassword?.__typename ===
          "UserAuthenticationWithPasswordSuccess"
        ) {
          const { sessionToken, item } = data.authenticateUserWithPassword;
          if (sessionToken && typeof window !== "undefined") {
            localStorage.setItem("keystonejs-session-token", sessionToken);
            const expires = new Date();
            expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
            const isSecure = window.location.protocol === "https:";
            document.cookie = `keystonejs-session=${sessionToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
          }

          const userFromLogin: AuthenticatedItem = {
            ...item,
            roles: item.roles ?? null,
            birthday: (item as { birthday?: string | null }).birthday ?? null,
            age: (item as { age?: string | null }).age ?? null,
            createdAt:
              (item as { createdAt?: string }).createdAt ??
              new Date().toISOString(),
          };
          setUser(userFromLogin);
          await refreshUser();
          clearForm();
          options?.onSuccess?.();
          redirectAfterAuth();
          return;
        }
      } catch (authError) {
        console.error("Error auto-logging in after register:", authError);
      }

      // Account exists but session failed — send them to login.
      clearForm();
      options?.onAutoLoginFailed?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    loading: isSubmitting,
    handleSubmit,
  };
}
