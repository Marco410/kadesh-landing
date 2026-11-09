"use client";

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { sileo } from 'sileo';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, WhatsappIcon } from '@hugeicons/core-free-icons';
import { DashButton, DashModal } from 'kadesh/components/app-shell';
import { INPUT_CLASS, LABEL_CLASS } from 'kadesh/components/profile/clinics/formStyles';
import {
  CANCEL_PET_TRANSFER_CODE_MUTATION,
  CREATE_PET_TRANSFER_CODE_MUTATION,
  PET_TRANSFER_CODES_QUERY,
  type CancelPetTransferCodeResponse,
  type CreatePetTransferCodeResponse,
  type PetTransferCodesResponse,
} from './queries';
import { formatTransferCode, transferShareUrl, transferWhatsAppUrl } from './transferCode';
import { petErrorMessage } from './utils';

const MESSAGE_MAX = 300;

const EXPIRES_LABEL = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/Mexico_City',
});

async function copy(text: string, done: string) {
  try {
    await navigator.clipboard.writeText(text);
    sileo.success({ title: done });
  } catch {
    sileo.error({ title: 'No se pudo copiar', description: text });
  }
}

/**
 * Traspasar la mascota a otra cuenta con un código (`createPetTransferCode`). Lo abre el dueño
 * principal o, si es ficha de un espacio de rescate, admin y coordinación (`organizationName`).
 * Muestra el código vigente para copiarlo o mandarlo por WhatsApp, o deja generar uno. Quien lo
 * recibe lo escribe en «Mis mascotas → Recibir con código».
 */
export default function TransferPetModal({
  isOpen,
  onClose,
  pet,
  organizationName,
}: {
  isOpen: boolean;
  onClose: () => void;
  pet: { id: string; name: string };
  /** Ficha de un espacio: el texto explica que sale del espacio y su publicación queda «Adoptado». */
  organizationName?: string | null;
}) {
  const [message, setMessage] = useState('');
  const { data, loading, refetch } = useQuery<PetTransferCodesResponse>(PET_TRANSFER_CODES_QUERY, {
    variables: { petId: pet.id },
    skip: !isOpen,
    fetchPolicy: 'network-only',
  });
  const [createCode, { loading: creating }] = useMutation<CreatePetTransferCodeResponse>(CREATE_PET_TRANSFER_CODE_MUTATION);
  const [cancelCode, { loading: cancelling }] = useMutation<CancelPetTransferCodeResponse>(CANCEL_PET_TRANSFER_CODE_MUTATION);

  useEffect(() => {
    if (isOpen) setMessage('');
  }, [isOpen]);

  const current = data?.petTransfers.find((transfer) => !transfer.isExpired) ?? null;
  const busy = creating || cancelling;

  const handleCreate = async () => {
    try {
      const result = await createCode({ variables: { petId: pet.id, message: message.trim() || null } });
      const payload = result.data?.createPetTransferCode;
      if (!payload?.success) {
        sileo.error({ title: 'No se pudo generar el código', description: payload?.message });
        return;
      }
      await refetch();
      sileo.success({ title: payload.message });
    } catch (error) {
      sileo.error({ title: 'No se pudo generar el código', description: petErrorMessage(error) });
    }
  };

  const handleCancel = async () => {
    if (!current) return;
    try {
      const result = await cancelCode({ variables: { transferId: current.id } });
      const payload = result.data?.cancelPetTransferCode;
      if (!payload?.success) {
        sileo.error({ title: 'No se pudo cancelar', description: payload?.message });
        return;
      }
      await refetch();
      sileo.success({ title: payload.message });
    } catch (error) {
      sileo.error({ title: 'No se pudo cancelar', description: petErrorMessage(error) });
    }
  };

  const effect = organizationName
    ? `${pet.name} pasará a su cuenta con su cartilla completa (fotos, vacunas y recordatorios), saldrá de las fichas de ${organizationName} y su publicación quedará como «Adoptado».`
    : `${pet.name} pasará a su cuenta con su cartilla completa (fotos, vacunas y recordatorios) y dejará de estar en la tuya y en la de tu familia.`;

  return (
    <DashModal
      open={isOpen}
      onClose={onClose}
      title={`Traspasar a ${pet.name}`}
      subtitle="Con un código, la cartilla pasa a la cuenta de su nueva familia."
      busy={busy}
      footer={
        <DashButton variant="ghost" onClick={onClose} disabled={busy}>
          Cerrar
        </DashButton>
      }
    >
      <div className="space-y-5">
        <p className="text-sm text-dash-muted">
          Quien lo reciba escribe el código en «Mis mascotas → Recibir con código» (o abre el enlace). {effect}
        </p>

        {loading && !data ? (
          <div className="h-32 dash-shimmer rounded-2xl" aria-busy="true" />
        ) : current ? (
          <div className="rounded-2xl border border-dash-line bg-dash-surface-2 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-dash-muted">Código de traspaso</p>
            <p
              className="mt-1 font-mono text-3xl font-bold tracking-[0.18em] text-dash-ink"
              aria-label={`Código ${formatTransferCode(current.code).split('').join(' ')}`}
            >
              {formatTransferCode(current.code)}
            </p>
            <p className="mt-1 text-xs text-dash-muted">
              Vence el {EXPIRES_LABEL.format(new Date(current.expiresAt))}. Solo sirve una vez.
            </p>
            {current.message ? (
              <p className="mt-2 text-sm italic text-dash-soft">«{current.message}»</p>
            ) : null}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <DashButton size="sm" onClick={() => copy(formatTransferCode(current.code), 'Código copiado')}>
                <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={1.8} aria-hidden />
                Copiar código
              </DashButton>
              <a
                href={transferWhatsAppUrl(current.code, pet.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#25d366] px-4 text-sm font-semibold text-white hover:opacity-90"
              >
                <HugeiconsIcon icon={WhatsappIcon} size={16} strokeWidth={1.6} aria-hidden />
                Mandar por WhatsApp
              </a>
              <DashButton
                size="sm"
                variant="outline"
                onClick={() => copy(transferShareUrl(current.code), 'Enlace copiado')}
              >
                Copiar enlace
              </DashButton>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 border-t border-dash-line pt-3">
              <DashButton size="sm" variant="ghost" onClick={handleCreate} disabled={busy}>
                Generar otro
              </DashButton>
              <DashButton size="sm" variant="danger-ghost" onClick={handleCancel} disabled={busy}>
                {cancelling ? 'Cancelando…' : 'Cancelar código'}
              </DashButton>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label htmlFor={`transfer-message-${pet.id}`} className={LABEL_CLASS}>
                Mensaje para su nueva familia (opcional)
              </label>
              <textarea
                id={`transfer-message-${pet.id}`}
                value={message}
                maxLength={MESSAGE_MAX}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                className={`${INPUT_CLASS} resize-none`}
                placeholder="Le encanta el parque, come croquetas de cachorro…"
              />
            </div>
            <p className="text-xs text-dash-muted">El código vale 7 días y solo sirve una vez. Puedes cancelarlo antes.</p>
            <DashButton onClick={handleCreate} disabled={busy}>
              {creating ? 'Generando…' : 'Generar código'}
            </DashButton>
          </div>
        )}
      </div>
    </DashModal>
  );
}
