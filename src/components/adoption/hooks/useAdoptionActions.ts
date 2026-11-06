"use client";

import { useMutation } from '@apollo/client';
import {
  COMPLETE_ADOPTION_APPLICATION_MUTATION,
  REVIEW_ADOPTION_APPLICATION_MUTATION,
  SUBMIT_ADOPTION_APPLICATION_MUTATION,
  EDIT_ADOPTION_APPLICATION_MUTATION,
  WITHDRAW_ADOPTION_APPLICATION_MUTATION,
  type CompleteAdoptionApplicationResponse,
  type ReviewAdoptionApplicationResponse,
  type ReviewAdoptionApplicationVariables,
  type SubmitAdoptionApplicationResponse,
  type SubmitAdoptionApplicationVariables,
  type EditAdoptionApplicationResponse,
  type EditAdoptionApplicationVariables,
  type WithdrawAdoptionApplicationResponse,
} from '../queries';
import type { AdoptionApplicationInput, AdoptionReviewStatus } from '../types';

/**
 * Las mutaciones de una solicitud. Ninguna lanza error por reglas de negocio: regresan
 * `{ success, message }` (y quien llama muestra `message`). Sí pueden lanzar por red o sesión.
 * Después, quien llama vuelve a pedir su lista.
 */
export function useAdoptionActions() {
  const [submitMutation, { loading: submitting }] = useMutation<
    SubmitAdoptionApplicationResponse,
    SubmitAdoptionApplicationVariables
  >(SUBMIT_ADOPTION_APPLICATION_MUTATION);
  const [editMutation, { loading: editing }] = useMutation<
    EditAdoptionApplicationResponse,
    EditAdoptionApplicationVariables
  >(EDIT_ADOPTION_APPLICATION_MUTATION);
  const [reviewMutation, { loading: reviewing }] = useMutation<
    ReviewAdoptionApplicationResponse,
    ReviewAdoptionApplicationVariables
  >(REVIEW_ADOPTION_APPLICATION_MUTATION);
  const [withdrawMutation, { loading: withdrawing }] = useMutation<
    WithdrawAdoptionApplicationResponse,
    { applicationId: string }
  >(WITHDRAW_ADOPTION_APPLICATION_MUTATION);
  const [completeMutation, { loading: completing }] = useMutation<
    CompleteAdoptionApplicationResponse,
    { applicationId: string }
  >(COMPLETE_ADOPTION_APPLICATION_MUTATION);

  const submit = async (animalId: string, input: AdoptionApplicationInput) => {
    const { data } = await submitMutation({ variables: { animalId, input } });
    return data?.submitAdoptionApplication ?? null;
  };

  /** Quien la envió la corrige mientras siga «Enviada». */
  const edit = async (applicationId: string, input: AdoptionApplicationInput) => {
    const { data } = await editMutation({ variables: { applicationId, input } });
    return data?.editAdoptionApplication ?? null;
  };

  const review = async (applicationId: string, status: AdoptionReviewStatus, note?: string | null) => {
    const { data } = await reviewMutation({ variables: { applicationId, status, note: note?.trim() || null } });
    return data?.reviewAdoptionApplication ?? null;
  };

  const withdraw = async (applicationId: string) => {
    const { data } = await withdrawMutation({ variables: { applicationId } });
    return data?.withdrawAdoptionApplication ?? null;
  };

  const complete = async (applicationId: string) => {
    const { data } = await completeMutation({ variables: { applicationId } });
    return data?.completeAdoptionApplication ?? null;
  };

  return {
    submit,
    submitting,
    edit,
    editing,
    review,
    reviewing,
    withdraw,
    withdrawing,
    complete,
    completing,
    busy: submitting || editing || reviewing || withdrawing || completing,
  };
}
