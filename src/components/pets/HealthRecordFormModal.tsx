"use client";

import { useEffect, useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { sileo } from 'sileo';
import PhotoPicker from 'kadesh/components/animals/nuevo/PhotoPicker';
import ChoiceChip from 'kadesh/components/animals/nuevo/ChoiceChip';
import { INPUT_CLASS, LABEL_CLASS } from 'kadesh/components/profile/clinics/formStyles';
import PetSheet from './PetSheet';
import ExistingPhotos from './ExistingPhotos';
import VeterinaryPicker from './VeterinaryPicker';
import { usePhotoQueue } from './hooks/usePhotoQueue';
import {
  CREATE_ATTACHMENTS_MUTATION,
  CREATE_HEALTH_RECORD_MUTATION,
  DELETE_ATTACHMENTS_MUTATION,
  PET_REFETCH,
  UPDATE_HEALTH_RECORD_MUTATION,
} from './queries';
import {
  HEALTH_RECORD_NAME_SUGGESTIONS,
  HEALTH_RECORD_TYPE_OPTIONS,
  MAX_ATTACHMENTS,
  REMINDER_DEFAULT_DAYS_BEFORE,
} from './constants';
import { petErrorMessage, todayYmd } from './utils';
import type { PetHealthRecord } from './types';

interface HealthRecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
  /** Sin registro: agregar uno nuevo. */
  record?: PetHealthRecord | null;
}

type Errors = Partial<Record<'name' | 'appliedDate' | 'nextDueDate', string>>;

export default function HealthRecordFormModal({
  isOpen,
  onClose,
  petId,
  petName,
  record,
}: HealthRecordFormModalProps) {
  const client = useApolloClient();
  const [type, setType] = useState('vaccine');
  const [name, setName] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [veterinary, setVeterinary] = useState<{ id: string; name: string } | null>(null);
  const [notes, setNotes] = useState('');
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existing = record?.attachments ?? [];
  const kept = existing.filter((attachment) => !removedIds.includes(attachment.id));
  const queue = usePhotoQueue(Math.max(0, MAX_ATTACHMENTS - kept.length));

  const [createRecord] = useMutation(CREATE_HEALTH_RECORD_MUTATION);
  const [updateRecord] = useMutation(UPDATE_HEALTH_RECORD_MUTATION);
  const [createAttachments] = useMutation(CREATE_ATTACHMENTS_MUTATION);
  const [deleteAttachments] = useMutation(DELETE_ATTACHMENTS_MUTATION);

  useEffect(() => {
    if (!isOpen) return;
    setType(record?.type ?? 'vaccine');
    setName(record?.name ?? '');
    setAppliedDate(record?.appliedDate ?? todayYmd());
    setNextDueDate(record?.nextDueDate ?? '');
    setVeterinary(record?.veterinary ?? null);
    setNotes(record?.notes ?? '');
    setRemovedIds([]);
    setErrors({});
    setSubmitError('');
    queue.reset();
    // Solo al abrir (ver PetFormModal).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const validate = (): boolean => {
    const next: Errors = {};
    if (!name.trim()) next.name = 'Escribe qué se aplicó o qué se hizo.';
    if (!appliedDate) next.appliedDate = 'Elige la fecha.';
    else if (appliedDate > todayYmd()) next.appliedDate = 'La fecha no puede ser posterior a hoy.';
    if (nextDueDate && appliedDate && nextDueDate < appliedDate) {
      next.nextDueDate = 'La próxima fecha va después de la de aplicación.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError('');

    const data: Record<string, unknown> = {
      type,
      name: name.trim(),
      appliedDate,
      nextDueDate: nextDueDate || null,
      notes: notes.trim(),
    };
    if (veterinary) data.veterinary = { connect: { id: veterinary.id } };
    else if (record?.veterinary) data.veterinary = { disconnect: true };

    let recordId = record?.id ?? '';
    try {
      if (record) {
        await updateRecord({ variables: { id: record.id, data } });
      } else {
        const result = await createRecord({
          variables: { data: { ...data, pet: { connect: { id: petId } } } },
        });
        recordId = result.data?.createPetHealthRecord?.id ?? '';
      }
    } catch (error) {
      setSubmitError(petErrorMessage(error));
      setIsSubmitting(false);
      return;
    }

    try {
      if (removedIds.length) {
        await deleteAttachments({ variables: { where: removedIds.map((id) => ({ id })) } });
      }
      if (recordId && queue.photos.length) {
        await createAttachments({
          variables: {
            data: queue.photos.map((photo) => ({
              healthRecord: { connect: { id: recordId } },
              image: { upload: photo.file },
            })),
          },
        });
      }
    } catch (error) {
      console.error('[pets] adjuntos', error);
      sileo.error({
        title: 'No se guardaron las fotos',
        description: 'El registro sí quedó. Intenta adjuntarlas otra vez.',
      });
    }

    await client.refetchQueries({ include: PET_REFETCH });
    setIsSubmitting(false);
    sileo.success({
      title: record ? 'Registro actualizado' : 'Registro agregado',
      description: nextDueDate ? 'Te avisaremos antes de la próxima fecha.' : undefined,
    });
    onClose();
  };

  const suggestions = HEALTH_RECORD_NAME_SUGGESTIONS[type] ?? [];

  return (
    <PetSheet
      isOpen={isOpen}
      title={record ? 'Editar registro' : `Cartilla de ${petName}`}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={record ? 'Guardar' : 'Agregar'}
      isSubmitting={isSubmitting}
      error={submitError}
    >
      <div>
        <p className={LABEL_CLASS}>Tipo</p>
        <div className="flex flex-wrap gap-1.5">
          {HEALTH_RECORD_TYPE_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={type === option.value}
              onSelect={() => setType(option.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="health-record-name" className={LABEL_CLASS}>
          Nombre <span className="text-red-600">*</span>
        </label>
        <input
          id="health-record-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={INPUT_CLASS}
          list={suggestions.length ? 'health-record-name-suggestions' : undefined}
          placeholder={type === 'vaccine' ? 'Ej. Rabia, Séxtuple' : 'Ej. Revisión general'}
          autoComplete="off"
          aria-invalid={Boolean(errors.name)}
        />
        {suggestions.length ? (
          <datalist id="health-record-name-suggestions">
            {suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        ) : null}
        {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="health-record-applied" className={LABEL_CLASS}>
            Fecha de aplicación <span className="text-red-600">*</span>
          </label>
          <input
            id="health-record-applied"
            type="date"
            value={appliedDate}
            max={todayYmd()}
            onChange={(event) => setAppliedDate(event.target.value)}
            className={INPUT_CLASS}
            aria-invalid={Boolean(errors.appliedDate)}
          />
          {errors.appliedDate ? <p className="mt-1 text-xs text-red-600">{errors.appliedDate}</p> : null}
        </div>
        <div>
          <label htmlFor="health-record-next" className={LABEL_CLASS}>
            Próxima fecha
          </label>
          <input
            id="health-record-next"
            type="date"
            value={nextDueDate}
            min={appliedDate || undefined}
            onChange={(event) => setNextDueDate(event.target.value)}
            className={INPUT_CLASS}
            aria-invalid={Boolean(errors.nextDueDate)}
          />
          {errors.nextDueDate ? (
            <p className="mt-1 text-xs text-red-600">{errors.nextDueDate}</p>
          ) : (
            <p className="mt-1 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
              {nextDueDate
                ? `Te avisaremos ${REMINDER_DEFAULT_DAYS_BEFORE} días antes. Lo cambias en Recordatorios.`
                : 'Opcional. Si la pones, te avisamos antes.'}
            </p>
          )}
        </div>
      </div>

      <VeterinaryPicker value={veterinary?.id ?? ''} initial={record?.veterinary} onChange={setVeterinary} />

      <div>
        <label htmlFor="health-record-notes" className={LABEL_CLASS}>
          Notas
        </label>
        <textarea
          id="health-record-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className={`${INPUT_CLASS} resize-none`}
          placeholder="Lote, dosis, indicaciones del veterinario…"
        />
      </div>

      <div>
        <p className={LABEL_CLASS}>Fotos de la cartilla o la receta</p>
        <ExistingPhotos
          photos={existing}
          removedIds={removedIds}
          onToggle={(id) =>
            setRemovedIds((current) =>
              current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
            )
          }
        />
        <PhotoPicker
          images={queue.photos}
          max={Math.max(0, MAX_ATTACHMENTS - kept.length)}
          onAdd={queue.add}
          onRemove={queue.remove}
          onReorder={queue.reorder}
        />
      </div>
    </PetSheet>
  );
}
