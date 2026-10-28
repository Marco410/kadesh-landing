"use client";

import { useEffect, useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { sileo } from 'sileo';
import ChoiceChip from 'kadesh/components/animals/nuevo/ChoiceChip';
import { INPUT_CLASS, LABEL_CLASS } from 'kadesh/components/profile/clinics/formStyles';
import PetSheet from './PetSheet';
import { CREATE_REMINDER_MUTATION, PET_REFETCH, UPDATE_REMINDER_MUTATION } from './queries';
import {
  REMINDER_CHANNEL_OPTIONS,
  REMINDER_DAYS_BEFORE_OPTIONS,
  REMINDER_DEFAULT_CHANNELS,
  REMINDER_DEFAULT_DAYS_BEFORE,
  healthRecordTypeLabel,
} from './constants';
import { petErrorMessage, todayYmd } from './utils';
import type { PetReminder } from './types';

interface ReminderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  /** Sin recordatorio: crear uno a mano. */
  reminder?: PetReminder | null;
}

type Errors = Partial<Record<'title' | 'dueDate' | 'channels', string>>;

const OFFERED_CHANNELS: string[] = REMINDER_CHANNEL_OPTIONS.map((option) => option.value);

export default function ReminderFormModal({ isOpen, onClose, petId, reminder }: ReminderFormModalProps) {
  const client = useApolloClient();
  const fromRecord = Boolean(reminder?.healthRecord);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [daysBefore, setDaysBefore] = useState<number>(REMINDER_DEFAULT_DAYS_BEFORE);
  const [channels, setChannels] = useState<string[]>(REMINDER_DEFAULT_CHANNELS);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createReminder] = useMutation(CREATE_REMINDER_MUTATION);
  const [updateReminder] = useMutation(UPDATE_REMINDER_MUTATION);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(reminder?.title ?? '');
    setDueDate(reminder?.dueDate ?? '');
    setDaysBefore(reminder?.notifyDaysBefore ?? REMINDER_DEFAULT_DAYS_BEFORE);
    setChannels(reminder?.channels?.length ? reminder.channels : REMINDER_DEFAULT_CHANNELS);
    setErrors({});
    setSubmitError('');
  }, [isOpen, reminder]);

  const offeredSelected = channels.filter((channel) => OFFERED_CHANNELS.includes(channel));

  const validate = (): boolean => {
    const next: Errors = {};
    if (!fromRecord) {
      if (!title.trim()) next.title = 'Escribe de qué es el recordatorio.';
      if (!dueDate) next.dueDate = 'Elige la fecha.';
    }
    if (offeredSelected.length === 0) next.channels = 'Elige al menos un aviso.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const toggleChannel = (value: string) => {
    setChannels((current) =>
      current.includes(value) ? current.filter((channel) => channel !== value) : [...current, value],
    );
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError('');
    const data: Record<string, unknown> = { notifyDaysBefore: daysBefore, channels };
    if (!fromRecord) {
      data.title = title.trim();
      data.dueDate = dueDate;
    }
    try {
      if (reminder) {
        await updateReminder({ variables: { id: reminder.id, data } });
      } else {
        await createReminder({ variables: { data: { ...data, pet: { connect: { id: petId } } } } });
      }
    } catch (error) {
      setSubmitError(petErrorMessage(error));
      setIsSubmitting(false);
      return;
    }
    await client.refetchQueries({ include: PET_REFETCH });
    setIsSubmitting(false);
    sileo.success({ title: reminder ? 'Recordatorio actualizado' : 'Recordatorio creado' });
    onClose();
  };

  return (
    <PetSheet
      isOpen={isOpen}
      title={reminder ? 'Editar recordatorio' : 'Nuevo recordatorio'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={reminder ? 'Guardar' : 'Crear'}
      isSubmitting={isSubmitting}
      error={submitError}
    >
      {fromRecord && reminder?.healthRecord ? (
        <p className="rounded-xl bg-kadesh-50 p-3 text-sm text-[#121212] dark:bg-kadesh/15 dark:text-[#eef1f6]">
          Sale del registro «{healthRecordTypeLabel(reminder.healthRecord.type)}: {reminder.healthRecord.name}».
          Para cambiar la fecha, edita la próxima fecha de ese registro en la cartilla.
        </p>
      ) : (
        <>
          <div>
            <label htmlFor="reminder-title" className={LABEL_CLASS}>
              Qué hay que hacer <span className="text-red-600">*</span>
            </label>
            <input
              id="reminder-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={INPUT_CLASS}
              placeholder="Ej. Baño, cambio de pipeta, revisión"
              autoComplete="off"
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title ? <p className="mt-1 text-xs text-red-600">{errors.title}</p> : null}
          </div>
          <div>
            <label htmlFor="reminder-date" className={LABEL_CLASS}>
              Fecha <span className="text-red-600">*</span>
            </label>
            <input
              id="reminder-date"
              type="date"
              value={dueDate}
              min={reminder ? undefined : todayYmd()}
              onChange={(event) => setDueDate(event.target.value)}
              className={INPUT_CLASS}
              aria-invalid={Boolean(errors.dueDate)}
            />
            {errors.dueDate ? <p className="mt-1 text-xs text-red-600">{errors.dueDate}</p> : null}
          </div>
        </>
      )}

      <div>
        <p className={LABEL_CLASS}>Cuándo avisar</p>
        <div className="flex flex-wrap gap-1.5">
          {REMINDER_DAYS_BEFORE_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={daysBefore === option.value}
              onSelect={() => setDaysBefore(option.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className={LABEL_CLASS}>Cómo avisar</p>
        <div className="flex flex-wrap gap-1.5">
          {REMINDER_CHANNEL_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={channels.includes(option.value)}
              onSelect={() => toggleChannel(option.value)}
            />
          ))}
        </div>
        {errors.channels ? (
          <p className="mt-1 text-xs text-red-600">{errors.channels}</p>
        ) : (
          <p className="mt-1 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            Les llega a todos los dueños de la mascota. La notificación sale en la campana y en la app.
          </p>
        )}
      </div>
    </PetSheet>
  );
}
