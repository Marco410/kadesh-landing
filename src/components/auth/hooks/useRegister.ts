"use client";

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  CREATE_USER_MUTATION,
  CreateUserVariables,
  CreateUserResponse
} from 'kadesh/utils/queries';

interface UseRegisterOptions {
  onSuccess?: () => void;
}

export function useRegister(options?: UseRegisterOptions) {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const [createUser, { loading }] = useMutation<
    CreateUserResponse,
    CreateUserVariables
  >(CREATE_USER_MUTATION, {
    onCompleted: () => {
      // Clear form
      setName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      
      // Call success callback if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      setError(error.message || 'Error al registrar usuario');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !lastName || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    await createUser({
      variables: {
        data: {
          name,
          lastName,
          email,
          password,
          phone: phone || undefined,
        },
      },
    });
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
    loading,
    handleSubmit,
  };
}

