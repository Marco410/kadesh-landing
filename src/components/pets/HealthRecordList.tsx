"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useApolloClient, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { sileo } from 'sileo';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Delete02Icon,
  InjectionIcon,
  Medicine02Icon,
  PencilEdit01Icon,
  Stethoscope02Icon,
} from '@hugeicons/core-free-icons';
import { ConfirmModal } from 'kadesh/components/shared';
import { useUiMotion } from 'kadesh/components/shared/motion';
import SectionCard, { IconAction } from './SectionCard';
import { DELETE_HEALTH_RECORD_MUTATION, PET_REFETCH } from './queries';
import { healthRecordTypeLabel } from './constants';
import { DUE_TONE_CLASS, dueTone, formatDay, petErrorMessage, relativeDueLabel } from './utils';
import type { PetHealthRecord } from './types';

function recordIcon(type: string) {
  if (type === 'vaccine') return InjectionIcon;
  if (type === 'consultation' || type === 'surgery') return Stethoscope02Icon;
  return Medicine02Icon;
}

export default function HealthRecordList({
  records,
  onAdd,
  onEdit,
}: {
  records: PetHealthRecord[];
  onAdd: () => void;
  onEdit: (record: PetHealthRecord) => void;
}) {
  const client = useApolloClient();
  const motionPrefs = useUiMotion();
  const [toDelete, setToDelete] = useState<PetHealthRecord | null>(null);
  const [deleteRecord, { loading: deleting }] = useMutation(DELETE_HEALTH_RECORD_MUTATION);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteRecord({ variables: { id: toDelete.id } });
      await client.refetchQueries({ include: PET_REFETCH });
      sileo.success({ title: 'Registro borrado' });
      setToDelete(null);
    } catch (error) {
      sileo.error({ title: 'No se pudo borrar', description: petErrorMessage(error) });
    }
  };

  return (
    <SectionCard
      title="Cartilla"
      description="Vacunas, desparasitaciones, consultas y medicamentos."
      actionLabel="Agregar registro"
      onAction={onAdd}
    >
      {records.length === 0 ? (
        <p className="rounded-xl bg-[#f7f8fa] p-4 text-sm text-[#5a5a5a] dark:bg-night dark:text-[#9aa3b2]">
          Aún no hay registros. Agrega su última vacuna; si pones la próxima fecha, te avisamos antes.
        </p>
      ) : (
        <motion.ul
          className="divide-y divide-[#ececec] dark:divide-white/10"
          variants={motionPrefs.list}
          initial={motionPrefs.reduce ? false : 'hidden'}
          animate="show"
        >
          {records.map((record) => (
            <motion.li key={record.id} variants={motionPrefs.item} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kadesh-50 text-kadesh dark:bg-kadesh/15 dark:text-kadesh-300">
                <HugeiconsIcon icon={recordIcon(record.type)} size={20} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="break-words font-semibold text-[#121212] dark:text-[#eef1f6]">{record.name}</p>
                <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
                  {healthRecordTypeLabel(record.type)} · {formatDay(record.appliedDate)}
                  {record.veterinary ? ` · ${record.veterinary.name}` : ''}
                </p>
                {record.nextDueDate ? (
                  <p className={`mt-1 text-xs font-semibold ${DUE_TONE_CLASS[dueTone(record.nextDueDate)]}`}>
                    Próxima: {formatDay(record.nextDueDate)} ({relativeDueLabel(record.nextDueDate).toLowerCase()})
                  </p>
                ) : null}
                {record.notes ? (
                  <p className="mt-1 whitespace-pre-line break-words text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
                    {record.notes}
                  </p>
                ) : null}
                {record.attachments.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {record.attachments.map((attachment) =>
                      attachment.image?.url ? (
                        <a
                          key={attachment.id}
                          href={attachment.image.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative block h-14 w-14 overflow-hidden rounded-lg bg-[#e8edf3] dark:bg-[#2a3548]"
                          aria-label="Ver foto adjunta"
                        >
                          <Image src={attachment.image.url} alt="" fill className="object-cover" sizes="56px" />
                        </a>
                      ) : null,
                    )}
                  </div>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col sm:flex-row">
                <IconAction label={`Editar ${record.name}`} onClick={() => onEdit(record)}>
                  <HugeiconsIcon icon={PencilEdit01Icon} size={18} strokeWidth={1.6} />
                </IconAction>
                <IconAction label={`Borrar ${record.name}`} tone="danger" onClick={() => setToDelete(record)}>
                  <HugeiconsIcon icon={Delete02Icon} size={18} strokeWidth={1.6} />
                </IconAction>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}

      <ConfirmModal
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="¿Borrar este registro?"
        message={`Se borrará «${toDelete?.name ?? ''}» de la cartilla, con sus fotos y su recordatorio.`}
        confirmText="Borrar"
        isLoading={deleting}
      />
    </SectionCard>
  );
}
