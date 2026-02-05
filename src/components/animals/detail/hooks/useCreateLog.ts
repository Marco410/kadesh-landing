"use client";

import { useMutation } from '@apollo/client';
import { CREATE_ANIMAL_LOG_MUTATION, CreateAnimalLogVariables, CreateAnimalLogResponse } from '../../queries';

interface CreateLogData {
  animalId: string;
  status: string;
  notes: string;
  lat: string;
  lng: string;
  address: string;
  city: string;
  state: string;
  country: string;
  lastSeen: boolean;
  dateStatus: string;
}

interface UseCreateLogOptions {
  onSuccess?: (logId: string) => void | Promise<void>;
  onError?: (error: Error) => void;
}

export function useCreateLog(options?: UseCreateLogOptions) {
  const [createAnimalLog, { loading: isCreating }] = useMutation<
    CreateAnimalLogResponse,
    CreateAnimalLogVariables
  >(CREATE_ANIMAL_LOG_MUTATION, {
    onError: (error) => {
      console.error('Error al crear el registro:', error);
      if (options?.onError) {
        options.onError(error);
      } else {
        alert('Error al crear el registro. Por favor, intenta de nuevo.');
      }
    },
  });

  const createLog = async (data: CreateLogData): Promise<string | null> => {
    try {
      const result = await createAnimalLog({
        variables: {
          data: {
            animal: { connect: { id: data.animalId } },
            status: data.status,
            notes: data.notes.trim(),
            lat: data.lat.trim(),
            lng: data.lng.trim(),
            address: data.address.trim(),
            city: data.city.trim(),
            state: data.state.trim(),
            country: data.country.trim(),
            last_seen: data.lastSeen,
            date_status: new Date(data.dateStatus).toISOString(),
          },
        },
      });
      
      // Call onSuccess after successful creation with the log ID
      if (result.data?.createAnimalLog?.id && options?.onSuccess) {
        await options.onSuccess(result.data.createAnimalLog.id);
        return result.data.createAnimalLog.id;
      }
      return result.data?.createAnimalLog?.id || null;
    } catch (error) {
      // Error is handled by onError callback
      throw error;
    }
  };

  return {
    createLog,
    isCreating,
  };
}
