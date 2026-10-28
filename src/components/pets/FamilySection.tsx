"use client";

import { useState, type FormEvent } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { sileo } from 'sileo';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Logout01Icon } from '@hugeicons/core-free-icons';
import { ConfirmModal } from 'kadesh/components/shared';
import { INPUT_CLASS } from 'kadesh/components/profile/clinics/formStyles';
import SectionCard, { IconAction } from './SectionCard';
import RegisterFamilyMemberModal from './RegisterFamilyMemberModal';
import {
  ADD_PET_FAMILY_MEMBER_MUTATION,
  DELETE_PET_OWNER_MUTATION,
  PET_FAMILY_USER_NOT_FOUND,
  PET_REFETCH,
} from './queries';
import { PET_OWNER_ROLE, PET_OWNER_ROLE_LABELS } from './constants';
import { graphqlErrorCode, petErrorMessage } from './utils';
import type { PetOwner } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Dueños de la mascota. El principal agrega familiares por correo y los quita; un familiar puede
 * salirse. La fila del principal nunca se quita (el backend tampoco lo permite).
 */
export default function FamilySection({
  petId,
  petName,
  owners,
  userId,
  onLeft,
}: {
  petId: string;
  petName: string;
  owners: PetOwner[];
  userId: string;
  /** La persona se salió: ya no puede ver esta mascota. */
  onLeft: () => void;
}) {
  const client = useApolloClient();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  /** Correo sin cuenta: se ofrece registrar a la persona. */
  const [notFoundEmail, setNotFoundEmail] = useState('');
  const [registering, setRegistering] = useState(false);
  const [toRemove, setToRemove] = useState<PetOwner | null>(null);
  const [addMember, { loading: adding }] = useMutation(ADD_PET_FAMILY_MEMBER_MUTATION);
  const [deleteOwner, { loading: removing }] = useMutation(DELETE_PET_OWNER_MUTATION);

  const myRow = owners.find((owner) => owner.user?.id === userId);
  const isPrincipal = myRow?.role === PET_OWNER_ROLE.PRINCIPAL;
  const leaving = Boolean(toRemove && toRemove.id === myRow?.id);

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(value)) {
      setEmailError('Escribe un correo válido.');
      return;
    }
    setEmailError('');
    setNotFoundEmail('');
    try {
      const result = await addMember({ variables: { petId, email: value } });
      await client.refetchQueries({ include: PET_REFETCH });
      const added = result.data?.addPetFamilyMember?.userName;
      sileo.success({ title: added ? `${added} ya ve la cartilla de ${petName}` : 'Familiar agregado' });
      setEmail('');
    } catch (error) {
      if (graphqlErrorCode(error) === PET_FAMILY_USER_NOT_FOUND) {
        setNotFoundEmail(value);
        return;
      }
      setEmailError(petErrorMessage(error, 'No se pudo agregar. Intenta de nuevo.'));
    }
  };

  const confirmRemove = async () => {
    if (!toRemove) return;
    try {
      await deleteOwner({ variables: { id: toRemove.id } });
      setToRemove(null);
      if (leaving) {
        sileo.success({ title: `Saliste de la cartilla de ${petName}` });
        onLeft();
        await client.refetchQueries({ include: ['MyPets'] });
        return;
      }
      await client.refetchQueries({ include: PET_REFETCH });
      sileo.success({ title: 'Familiar quitado' });
    } catch (error) {
      sileo.error({ title: 'No se pudo quitar', description: petErrorMessage(error) });
    }
  };

  return (
    <SectionCard
      title="Familia"
      description={
        isPrincipal
          ? 'Comparte la cartilla con quien también la cuida. Podrán verla, editarla y recibir los recordatorios.'
          : 'Quienes comparten esta cartilla.'
      }
    >
      <ul className="divide-y divide-[#ececec] dark:divide-white/10">
        {owners.map((owner) => {
          const isMe = owner.id === myRow?.id;
          const canRemove =
            owner.role === PET_OWNER_ROLE.FAMILY && (isPrincipal || isMe);
          return (
            <li key={owner.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="break-words font-semibold text-[#121212] dark:text-[#eef1f6]">
                  {owner.userName || 'Sin nombre'}
                  {isMe ? <span className="font-normal text-[#5a5a5a] dark:text-[#9aa3b2]"> (tú)</span> : null}
                </p>
                <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
                  {PET_OWNER_ROLE_LABELS[owner.role] ?? owner.role}
                </p>
              </div>
              {canRemove ? (
                <IconAction
                  label={isMe ? 'Salir de esta cartilla' : `Quitar a ${owner.userName || 'este familiar'}`}
                  tone="danger"
                  onClick={() => setToRemove(owner)}
                >
                  <HugeiconsIcon icon={isMe ? Logout01Icon : Cancel01Icon} size={18} strokeWidth={1.6} />
                </IconAction>
              ) : null}
            </li>
          );
        })}
      </ul>

      {isPrincipal ? (
        <form onSubmit={handleAdd} noValidate className="mt-4 border-t border-[#ececec] pt-4 dark:border-white/10">
          <label htmlFor="pet-family-email" className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Agregar por correo
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="pet-family-email"
              type="email"
              inputMode="email"
              autoComplete="off"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setNotFoundEmail('');
              }}
              className={INPUT_CLASS}
              placeholder="correo@ejemplo.com"
              aria-invalid={Boolean(emailError)}
            />
            <button
              type="submit"
              disabled={adding}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:opacity-50"
            >
              {adding ? 'Agregando…' : 'Agregar'}
            </button>
          </div>
          {notFoundEmail ? (
            <div className="mt-3 flex flex-col gap-3 rounded-xl border border-[#ececec] bg-[#f7f8fa] p-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-night">
              <p className="text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
                <span className="break-all font-semibold">{notFoundEmail}</span> no tiene cuenta en Kadesh. Puedes
                registrarla tú y quedará en la familia.
              </p>
              <button
                type="button"
                onClick={() => setRegistering(true)}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
              >
                Registrar a esta persona
              </button>
            </div>
          ) : emailError ? (
            <p className="mt-1 text-xs text-red-600">{emailError}</p>
          ) : (
            <p className="mt-1 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
              Si aún no tiene cuenta, podrás registrarla aquí mismo.
            </p>
          )}
        </form>
      ) : null}

      <RegisterFamilyMemberModal
        isOpen={registering}
        onClose={() => setRegistering(false)}
        petId={petId}
        petName={petName}
        initialEmail={notFoundEmail}
        onRegistered={() => {
          setEmail('');
          setNotFoundEmail('');
        }}
      />

      <ConfirmModal
        isOpen={Boolean(toRemove)}
        onClose={() => setToRemove(null)}
        onConfirm={confirmRemove}
        title={leaving ? '¿Salir de esta cartilla?' : '¿Quitar a este familiar?'}
        message={
          leaving
            ? `Dejarás de ver la cartilla de ${petName} y de recibir sus recordatorios.`
            : `${toRemove?.userName || 'Esta persona'} dejará de ver la cartilla de ${petName}.`
        }
        confirmText={leaving ? 'Salir' : 'Quitar'}
        isLoading={removing}
      />
    </SectionCard>
  );
}
