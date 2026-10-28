"use client";

import { useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { AnimatePresence, motion } from 'framer-motion';
import { sileo } from 'sileo';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Delete02Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';
import { ConfirmModal } from 'kadesh/components/shared';
import { useUiMotion } from 'kadesh/components/shared/motion';
import SectionCard, { IconAction } from './SectionCard';
import { DELETE_REMINDER_MUTATION, PET_REFETCH, UPDATE_REMINDER_MUTATION } from './queries';
import { REMINDER_CHANNEL_LABELS, REMINDER_STATUS, REMINDER_STATUS_LABELS } from './constants';
import { DUE_TONE_CLASS, dueTone, formatDay, petErrorMessage, relativeDueLabel } from './utils';
import type { PetReminder } from './types';

function noticeText(reminder: PetReminder): string {
  const when =
    reminder.notifyDaysBefore === 0
      ? 'el mismo día'
      : reminder.notifyDaysBefore === 1
        ? '1 día antes'
        : `${reminder.notifyDaysBefore} días antes`;
  const channels = (reminder.channels ?? [])
    .map((channel) => REMINDER_CHANNEL_LABELS[channel])
    .filter(Boolean);
  const how = channels.length ? ` por ${channels.join(' y ')}` : '';
  return `Aviso ${when}${how}`;
}

export default function ReminderList({
  reminders,
  onAdd,
  onEdit,
}: {
  reminders: PetReminder[];
  onAdd: () => void;
  onEdit: (reminder: PetReminder) => void;
}) {
  const client = useApolloClient();
  const motionPrefs = useUiMotion();
  const [showPast, setShowPast] = useState(false);
  const [toDelete, setToDelete] = useState<PetReminder | null>(null);
  const [updateReminder, { loading: updating }] = useMutation(UPDATE_REMINDER_MUTATION);
  const [deleteReminder, { loading: deleting }] = useMutation(DELETE_REMINDER_MUTATION);

  const active = reminders.filter(
    (reminder) => reminder.status === REMINDER_STATUS.PENDING || reminder.status === REMINDER_STATUS.SENT,
  );
  const past = reminders
    .filter((reminder) => !active.includes(reminder))
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

  const markDone = async (reminder: PetReminder) => {
    try {
      await updateReminder({ variables: { id: reminder.id, data: { status: REMINDER_STATUS.COMPLETED } } });
      await client.refetchQueries({ include: PET_REFETCH });
      sileo.success({ title: 'Marcado como hecho' });
    } catch (error) {
      sileo.error({ title: 'No se pudo actualizar', description: petErrorMessage(error) });
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteReminder({ variables: { id: toDelete.id } });
      await client.refetchQueries({ include: PET_REFETCH });
      sileo.success({ title: 'Recordatorio borrado' });
      setToDelete(null);
    } catch (error) {
      sileo.error({ title: 'No se pudo borrar', description: petErrorMessage(error) });
    }
  };

  const renderItem = (reminder: PetReminder, isPast: boolean) => (
    <motion.li key={reminder.id} variants={motionPrefs.item} className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="break-words font-semibold text-[#121212] dark:text-[#eef1f6]">{reminder.title}</p>
          {reminder.status !== REMINDER_STATUS.PENDING ? (
            <span className="rounded-full bg-[#eceff3] px-2 py-0.5 text-xs font-bold text-[#3a3a3a] dark:bg-white/10 dark:text-[#d0d0d0]">
              {REMINDER_STATUS_LABELS[reminder.status] ?? reminder.status}
            </span>
          ) : null}
        </div>
        <p
          className={`text-sm font-semibold ${
            isPast ? 'text-[#5a5a5a] dark:text-[#9aa3b2]' : DUE_TONE_CLASS[dueTone(reminder.dueDate)]
          }`}
        >
          {formatDay(reminder.dueDate)}
          {isPast ? '' : ` · ${relativeDueLabel(reminder.dueDate)}`}
        </p>
        {!isPast ? <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">{noticeText(reminder)}</p> : null}
      </div>
      {!isPast ? (
        <div className="flex shrink-0 flex-col sm:flex-row">
          <IconAction label={`Marcar «${reminder.title}» como hecho`} onClick={() => markDone(reminder)} disabled={updating}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} strokeWidth={1.6} />
          </IconAction>
          <IconAction label={`Editar «${reminder.title}»`} onClick={() => onEdit(reminder)}>
            <HugeiconsIcon icon={PencilEdit01Icon} size={18} strokeWidth={1.6} />
          </IconAction>
          {!reminder.healthRecord ? (
            <IconAction label={`Borrar «${reminder.title}»`} tone="danger" onClick={() => setToDelete(reminder)}>
              <HugeiconsIcon icon={Delete02Icon} size={18} strokeWidth={1.6} />
            </IconAction>
          ) : null}
        </div>
      ) : null}
    </motion.li>
  );

  return (
    <SectionCard
      title="Recordatorios"
      description="Te avisamos antes de cada fecha. Los de la cartilla se crean solos."
      actionLabel="Nuevo recordatorio"
      onAction={onAdd}
    >
      {active.length === 0 ? (
        <p className="rounded-xl bg-[#f7f8fa] p-4 text-sm text-[#5a5a5a] dark:bg-night dark:text-[#9aa3b2]">
          No hay recordatorios pendientes.
        </p>
      ) : (
        <motion.ul
          className="divide-y divide-[#ececec] dark:divide-white/10"
          variants={motionPrefs.list}
          initial={motionPrefs.reduce ? false : 'hidden'}
          animate="show"
        >
          {active.map((reminder) => renderItem(reminder, false))}
        </motion.ul>
      )}

      {past.length ? (
        <div className="mt-3 border-t border-[#ececec] pt-3 dark:border-white/10">
          <button
            type="button"
            onClick={() => setShowPast((value) => !value)}
            aria-expanded={showPast}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-kadesh hover:underline dark:text-kadesh-300"
          >
            {showPast ? 'Ocultar anteriores' : `Ver anteriores (${past.length})`}
          </button>
          <AnimatePresence initial={false}>
            {showPast ? (
              <motion.ul
                key="past"
                className="divide-y divide-[#ececec] overflow-hidden dark:divide-white/10"
                variants={motionPrefs.expand}
                initial={motionPrefs.reduce ? false : 'hidden'}
                animate="show"
                exit="exit"
              >
                {past.map((reminder) => renderItem(reminder, true))}
              </motion.ul>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="¿Borrar este recordatorio?"
        message={`Ya no te avisaremos de «${toDelete?.title ?? ''}».`}
        confirmText="Borrar"
        isLoading={deleting}
      />
    </SectionCard>
  );
}
