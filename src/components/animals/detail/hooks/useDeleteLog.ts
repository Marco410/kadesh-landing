"use client";

import { useMutation } from '@apollo/client';
import { DELETE_ANIMAL_LOG_MUTATION, DeleteAnimalLogVariables, DeleteAnimalLogResponse } from '../../queries';

interface UseDeleteLogOptions {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: Error) => void;
}

export function useDeleteLog(options?: UseDeleteLogOptions) {
  const [deleteAnimalLog, { loading: isDeleting }] = useMutation<
    DeleteAnimalLogResponse,
    DeleteAnimalLogVariables
  >(DELETE_ANIMAL_LOG_MUTATION, {
    onCompleted: () => {
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      console.error('Error al eliminar el registro:', error);
      if (options?.onError) {
        options.onError(error);
      } else {
        alert('Error al eliminar el registro. Por favor, intenta de nuevo.');
      }
    },
  });

  const deleteLog = async (logId: string) => {
    try {
      await deleteAnimalLog({
        variables: {
          where: {
            id: logId,
          },
        },
      });
    } catch (e) {
    }
  };

  return {
    deleteLog,
    isDeleting,
  };
}
