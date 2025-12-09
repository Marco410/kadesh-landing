"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { 
  AUTHENTICATE_USER_MUTATION,
  AuthenticateUserVariables,
  AuthenticateUserResponse
} from 'kadesh/utils/queries';
import { useUser } from 'kadesh/utils/UserContext';
import { Routes } from 'kadesh/core/routes';

export function useLogin() {
  const router = useRouter();
  const { refreshUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [authenticateUser, { loading }] = useMutation<
    AuthenticateUserResponse,
    AuthenticateUserVariables
  >(AUTHENTICATE_USER_MUTATION, {
    onCompleted: async (data) => {
      if (!data.authenticateUserWithPassword) {
        setError('Error al iniciar sesión');
        return;
      }

      if (data.authenticateUserWithPassword.__typename === 'UserAuthenticationWithPasswordSuccess') {
        // Refresh user context to get the authenticated user
        await refreshUser();
        // Redireccionar a la página de donde viene
        if (window && window.history.length > 1) {
          router.back();
        } else {
          router.push(Routes.home);
        }
      } else if (data.authenticateUserWithPassword.__typename === 'UserAuthenticationWithPasswordFailure') {
        setError(data.authenticateUserWithPassword.message || 'Credenciales incorrectas');
      }
    },
    onError: (error) => {
      setError(error.message || 'Error al iniciar sesión');
    },
  });

  const handleSubmit = async (e: React.FormEvent, submitEmail?: string, submitPassword?: string) => {
    e.preventDefault();
    setError('');

    const emailToUse = submitEmail ?? email;
    const passwordToUse = submitPassword ?? password;

    if (!emailToUse || !passwordToUse) {
      setError('Por favor completa todos los campos');
      return;
    }

    await authenticateUser({
      variables: {
        email: emailToUse,
        password: passwordToUse,
      },
    });
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    loading,
    handleSubmit,
  };
}

