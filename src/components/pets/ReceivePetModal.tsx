"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useApolloClient, useMutation } from '@apollo/client';
import { sileo } from 'sileo';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon } from '@hugeicons/core-free-icons';
import { DashButton, DashModal } from 'kadesh/components/app-shell';
import { INPUT_CLASS, LABEL_CLASS } from 'kadesh/components/profile/clinics/formStyles';
import {
  PET_REFETCH,
  PREVIEW_PET_TRANSFER_CODE_MUTATION,
  REDEEM_PET_TRANSFER_CODE_MUTATION,
  type PreviewPetTransferCodeResponse,
  type RedeemPetTransferCodeResponse,
} from './queries';
import { TRANSFER_CODE_LENGTH, formatTransferCode, normalizeTransferCode } from './transferCode';
import type { PetTransferPreview } from './types';
import { petErrorMessage, speciesLabel } from './utils';

/**
 * «Recibir con código»: quien recibe una mascota escribe el código que le dieron, ve qué mascota
 * es y quién se la da (`previewPetTransferCode`) y la acepta (`redeemPetTransferCode`). La mascota
 * llega a su cuenta como dueño principal, con su cartilla completa. Se abre también con
 * `/perfil?tab=pets&codigo=…` (el enlace que se comparte).
 */
export default function ReceivePetModal({
  isOpen,
  onClose,
  initialCode,
  onReceived,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string | null;
  onReceived: (petId: string) => void;
}) {
  const client = useApolloClient();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<PetTransferPreview | null>(null);
  const [check, { loading: checking }] = useMutation<PreviewPetTransferCodeResponse>(PREVIEW_PET_TRANSFER_CODE_MUTATION);
  const [redeem, { loading: redeeming }] = useMutation<RedeemPetTransferCodeResponse>(REDEEM_PET_TRANSFER_CODE_MUTATION);
  const busy = checking || redeeming;

  const runCheck = async (raw: string) => {
    const clean = normalizeTransferCode(raw);
    if (clean.length !== TRANSFER_CODE_LENGTH) {
      setError(`El código tiene ${TRANSFER_CODE_LENGTH} letras y números, como 7KQ2-M9XA.`);
      return;
    }
    setError('');
    try {
      const result = await check({ variables: { code: clean } });
      const payload = result.data?.previewPetTransferCode;
      if (!payload?.success) {
        setPreview(null);
        setError(payload?.message || 'No pudimos revisar el código.');
        return;
      }
      setPreview(payload);
    } catch (err) {
      setError(petErrorMessage(err, 'No pudimos revisar el código. Intenta de nuevo.'));
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const start = initialCode ? formatTransferCode(initialCode) : '';
    setCode(start);
    setPreview(null);
    setError('');
    if (start && normalizeTransferCode(start).length === TRANSFER_CODE_LENGTH) void runCheck(start);
    // Solo al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleRedeem = async () => {
    try {
      const result = await redeem({ variables: { code: normalizeTransferCode(code) } });
      const payload = result.data?.redeemPetTransferCode;
      if (!payload?.success || !payload.petId) {
        setError(payload?.message || 'No pudimos recibir a la mascota.');
        return;
      }
      await client.refetchQueries({ include: PET_REFETCH });
      sileo.success({ title: payload.message, description: 'Ya puedes ver su cartilla, vacunas y recordatorios.' });
      onClose();
      onReceived(payload.petId);
    } catch (err) {
      setError(petErrorMessage(err, 'No pudimos recibir a la mascota. Intenta de nuevo.'));
    }
  };

  const facts = preview
    ? [speciesLabel(preview.species), preview.breed].filter(Boolean).join(' · ')
    : '';

  return (
    <DashModal
      open={isOpen}
      onClose={onClose}
      title="Recibir una mascota"
      subtitle="Escribe el código que te dieron. Antes de aceptar verás qué mascota es."
      busy={busy}
      footer={
        <>
          <DashButton variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </DashButton>
          {preview ? (
            <DashButton onClick={handleRedeem} disabled={busy}>
              {redeeming ? 'Recibiendo…' : `Recibir a ${preview.petName ?? 'la mascota'}`}
            </DashButton>
          ) : (
            <DashButton type="submit" form="receive-pet-form" disabled={busy}>
              {checking ? 'Revisando…' : 'Revisar código'}
            </DashButton>
          )}
        </>
      }
    >
      <form
        id="receive-pet-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!busy) void runCheck(code);
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="receive-pet-code" className={LABEL_CLASS}>
            Código
          </label>
          <input
            id="receive-pet-code"
            value={code}
            onChange={(event) => {
              setCode(formatTransferCode(event.target.value));
              setPreview(null);
              setError('');
            }}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            inputMode="text"
            placeholder="7KQ2-M9XA"
            className={`${INPUT_CLASS} font-mono text-lg tracking-[0.18em]`}
            aria-invalid={Boolean(error)}
            aria-describedby="receive-pet-code-help"
          />
          <p id="receive-pet-code-help" className={error ? 'mt-1 text-xs text-red-600' : 'mt-1 text-xs text-dash-muted'}>
            {error || 'Te lo da quien te entrega a la mascota: su familia o el espacio de rescate.'}
          </p>
        </div>

        {preview ? (
          <div className="flex gap-3 rounded-2xl border border-dash-line bg-dash-surface-2 p-3">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-dash-surface">
              {preview.photoUrl ? (
                <Image src={preview.photoUrl} alt={`Foto de ${preview.petName ?? 'la mascota'}`} fill sizes="80px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-dash-faint">
                  <HugeiconsIcon icon={Image01Icon} size={24} strokeWidth={1.5} aria-hidden />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-dash-ink">{preview.petName}</p>
              {facts ? <p className="text-sm text-dash-muted">{facts}</p> : null}
              <p className="mt-1 text-sm text-dash-soft">
                Te {preview.fromOrganization ? 'lo entrega' : 'la pasa'} <strong>{preview.fromName}</strong>.
              </p>
              {preview.transferMessage ? (
                <p className="mt-1 text-sm italic text-dash-soft">«{preview.transferMessage}»</p>
              ) : null}
              <p className="mt-2 text-xs text-dash-muted">
                Llegará a tu cuenta con su cartilla completa: fotos, vacunas, registros y recordatorios.
              </p>
            </div>
          </div>
        ) : null}
      </form>
    </DashModal>
  );
}
