"use client";

import { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import {
  CREATE_ANIMAL_VIEW_MUTATION,
  CreateAnimalViewVariables,
  CreateAnimalViewResponse,
} from '../../queries';
import { useUser } from 'kadesh/utils/UserContext';

export function useAnimalView(animalId: string) {
  const { user, loading: userLoading } = useUser();
  const hasViewed = useRef<string | null>(null);

  const [createAnimalView, { loading: isCreatingView }] = useMutation<
    CreateAnimalViewResponse,
    CreateAnimalViewVariables
  >(CREATE_ANIMAL_VIEW_MUTATION, {
    onError: (error) => {
      console.error('Error al registrar vista:', error);
    },
  });

  useEffect(() => {
    // Espera a saber si hay sesión para ligar la vista al usuario y registrarla una sola vez.
    if (!animalId || userLoading || hasViewed.current === animalId) return;
    hasViewed.current = animalId;

    createAnimalView({
      variables: {
        data: {
          animal: {
            connect: {
              id: animalId,
            },
          },
          user: user?.id
            ? {
                connect: {
                  id: user.id,
                },
              }
            : null,
        },
      },
    }).catch((error) => {
      hasViewed.current = null;
      console.error('Error al crear vista:', error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animalId, userLoading, user?.id]);

  return {
    isCreatingView,
  };
}
