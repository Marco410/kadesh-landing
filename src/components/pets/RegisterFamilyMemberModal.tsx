"use client";

import { useEffect, useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { sileo } from 'sileo';
import { HugeiconsIcon } from '@hugeicons/react';
import { EyeIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import { INPUT_CLASS, LABEL_CLASS } from 'kadesh/components/profile/clinics/formStyles';
import { normalizeMxPhone } from 'kadesh/utils/phone';
import PetSheet from './PetSheet';
import {
  PET_REFETCH,
  REGISTER_PET_FAMILY_MEMBER_MUTATION,
  type RegisterPetFamilyMemberResponse,
} from './queries';
import { petErrorMessage } from './utils';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Igual que el registro de la web. */
const MIN_PASSWORD_LENGTH = 8;

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'password', string>>;

interface RegisterFamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
  /** El correo que no encontró `addPetFamilyMember`. */
  initialEmail: string;
  onRegistered: () => void;
}

/**
 * El principal registra a un familiar que no tiene cuenta: elige su contraseña y a la persona le
 * llega un correo avisándole que quien la registró la tiene (el correo no la lleva).
 */
export default function RegisterFamilyMemberModal({
  isOpen,
  onClose,
  petId,
  petName,
  initialEmail,
  onRegistered,
}: RegisterFamilyMemberModalProps) {
  const client = useApolloClient();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState('');
  const [register, { loading }] = useMutation<RegisterPetFamilyMemberResponse>(
    REGISTER_PET_FAMILY_MEMBER_MUTATION,
  );

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setLastName('');
    setEmail(initialEmail);
    setPhone('');
    setPassword('');
    setShowPassword(false);
    setErrors({});
    setSubmitError('');
    // Solo al abrir (ver PetFormModal).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async () => {
    const next: Errors = {};
    if (!name.trim()) next.name = 'Escribe su nombre.';
    if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Escribe un correo válido.';
    let phoneDigits: string | null = null;
    if (phone.trim()) {
      const normalized = normalizeMxPhone(phone);
      if (normalized.ok) phoneDigits = normalized.digits;
      else next.phone = normalized.reason;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitError('');
    try {
      const result = await register({
        variables: {
          petId,
          input: {
            name: name.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            phone: phoneDigits,
            password,
          },
        },
      });
      await client.refetchQueries({ include: PET_REFETCH });
      const member = result.data?.registerPetFamilyMember;
      const memberName = member?.userName || name.trim();
      if (member && !member.createdAccount) {
        sileo.success({
          title: `${memberName} ya tenía cuenta`,
          description: `La agregamos a la cartilla de ${petName}. Su contraseña no cambió.`,
        });
      } else {
        sileo.success({
          title: `Registramos a ${memberName}`,
          description: `Ya ve la cartilla de ${petName}. Compártele su contraseña.`,
        });
      }
      onRegistered();
      onClose();
    } catch (error) {
      setSubmitError(petErrorMessage(error, 'No se pudo registrar a esta persona. Intenta de nuevo.'));
    }
  };

  return (
    <PetSheet
      isOpen={isOpen}
      title="Registrar familiar"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Registrar y agregar"
      isSubmitting={loading}
      error={submitError}
    >
      <p className="rounded-xl bg-kadesh-50 p-3 text-sm text-[#121212] dark:bg-kadesh/15 dark:text-[#eef1f6]">
        Crearemos su cuenta de Kadesh Pet con la contraseña que elijas y la agregaremos a la cartilla de{' '}
        {petName}. Le llegará un correo avisándole que tú tienes su contraseña.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="family-name" className={LABEL_CLASS}>
            Nombre <span className="text-red-600">*</span>
          </label>
          <input
            id="family-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={INPUT_CLASS}
            autoComplete="off"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
        </div>
        <div>
          <label htmlFor="family-last-name" className={LABEL_CLASS}>
            Apellido
          </label>
          <input
            id="family-last-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className={INPUT_CLASS}
            autoComplete="off"
          />
        </div>
      </div>

      <div>
        <label htmlFor="family-email" className={LABEL_CLASS}>
          Correo <span className="text-red-600">*</span>
        </label>
        <input
          id="family-email"
          type="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={INPUT_CLASS}
          autoComplete="off"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? (
          <p className="mt-1 text-xs text-red-600">{errors.email}</p>
        ) : (
          <p className="mt-1 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">Con este correo entrará a Kadesh Pet.</p>
        )}
      </div>

      <div>
        <label htmlFor="family-phone" className={LABEL_CLASS}>
          Teléfono
        </label>
        <input
          id="family-phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className={INPUT_CLASS}
          placeholder="Opcional, 10 dígitos"
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone}</p> : null}
      </div>

      <div>
        <label htmlFor="family-password" className={LABEL_CLASS}>
          Contraseña <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <input
            id="family-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`${INPUT_CLASS} pr-12`}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#5a5a5a] hover:bg-[#f3f5f8] dark:text-[#9aa3b2] dark:hover:bg-white/10"
          >
            <HugeiconsIcon icon={showPassword ? ViewOffIcon : EyeIcon} size={18} strokeWidth={1.6} />
          </button>
        </div>
        {errors.password ? (
          <p className="mt-1 text-xs text-red-600">{errors.password}</p>
        ) : (
          <p className="mt-1 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            Mínimo {MIN_PASSWORD_LENGTH} caracteres. Compártesela tú; el correo no la incluye.
          </p>
        )}
      </div>
    </PetSheet>
  );
}
