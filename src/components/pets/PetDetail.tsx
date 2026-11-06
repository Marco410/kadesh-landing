"use client";

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { sileo } from 'sileo';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert02Icon,
  ArrowDataTransferHorizontalIcon,
  ArrowLeft01Icon,
  Delete02Icon,
  Home01Icon,
  Image01Icon,
  Location01Icon,
  PencilEdit01Icon,
} from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { ConfirmModal } from 'kadesh/components/shared';
import { useProfileMotion } from 'kadesh/components/profile/motion';
import PetFormModal from './PetFormModal';
import HealthRecordFormModal from './HealthRecordFormModal';
import ReminderFormModal from './ReminderFormModal';
import MarkLostModal from './MarkLostModal';
import TransferPetModal from './TransferPetModal';
import HealthRecordList from './HealthRecordList';
import ReminderList from './ReminderList';
import FamilySection from './FamilySection';
import {
  DELETE_PET_MUTATION,
  MARK_PET_AS_FOUND_MUTATION,
  PET_DETAIL_QUERY,
  PET_REFETCH,
  type PetDetailResponse,
} from './queries';
import {
  PET_OWNER_ROLE,
  PET_STATUS,
  PET_STATUS_BADGE,
  PET_STATUS_LABELS,
  PET_STERILIZED_LABELS,
} from './constants';
import { formatDay, petErrorMessage, petAgeText, sexLabel, speciesLabel } from './utils';
import type { PetDetail as PetDetailData, PetHealthRecord, PetReminder } from './types';

/** Roles del equipo de un espacio que pueden borrar una ficha (igual que el backend). */
const RESCUE_DELETE_ROLES = ['admin', 'coordinator'];

type Editing<T> = { item: T | null } | null;

function DataItem({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  if (!value) return null;
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-xs font-semibold text-dash-muted">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line break-words text-sm text-dash-ink">{value}</dd>
    </div>
  );
}

/**
 * Cartilla de una mascota: datos, registros de salud, recordatorios y familia. También es la ficha
 * interna de un animal de un espacio de rescate (`pet.organization`): ahí no hay familia ni «Marcar
 * como perdida», y `renderRescuePanel` agrega lo del espacio (etapa, hogar temporal, publicar,
 * adopción).
 */
export default function PetDetail({
  petId,
  userId,
  onBack,
  backLabel = 'Mis mascotas',
  renderRescuePanel,
}: {
  petId: string;
  userId: string;
  onBack: () => void;
  backLabel?: string;
  renderRescuePanel?: (pet: PetDetailData) => ReactNode;
}) {
  const client = useApolloClient();
  const motionPrefs = useProfileMotion();
  const { data, loading, error } = useQuery<PetDetailResponse>(PET_DETAIL_QUERY, {
    variables: { id: petId },
    fetchPolicy: 'cache-and-network',
  });
  const [editingPet, setEditingPet] = useState(false);
  const [record, setRecord] = useState<Editing<PetHealthRecord>>(null);
  const [reminder, setReminder] = useState<Editing<PetReminder>>(null);
  const [markingLost, setMarkingLost] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [confirmFound, setConfirmFound] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [markFound, { loading: markingFound }] = useMutation(MARK_PET_AS_FOUND_MUTATION);
  const [deletePet, { loading: deleting }] = useMutation(DELETE_PET_MUTATION);

  const pet = data?.pet;

  if (loading && !pet) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="h-11 w-36 animate-pulse rounded-xl bg-dash-surface-3" />
        <div className="h-40 dash-shimmer rounded-3xl" />
        <div className="h-32 dash-shimmer rounded-3xl" />
      </div>
    );
  }

  const backButton = (
    <button
      type="button"
      onClick={onBack}
      className="mb-3 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-dash-soft hover:bg-dash-hover"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={1.6} aria-hidden="true" />
      {backLabel}
    </button>
  );

  if (!pet) {
    return (
      <div>
        {backButton}
        <div className="rounded-3xl border border-dash-line bg-dash-surface p-5 shadow-dash">
          <p className="font-semibold text-dash-ink">
            {error ? 'No pudimos cargar esta mascota' : 'No encontramos esta mascota'}
          </p>
          <p className="mt-1 text-sm text-dash-muted">
            {error
              ? 'Revisa tu conexión e intenta de nuevo.'
              : 'Puede que la hayan borrado, que ya la hayan adoptado o que ya no estés en su cartilla.'}
          </p>
        </div>
      </div>
    );
  }

  const isRescue = Boolean(pet.organization);
  const myRole = pet.owners.find((owner) => owner.user?.id === userId)?.role ?? pet.viewerRole;
  const isPrincipal = myRole === PET_OWNER_ROLE.PRINCIPAL;
  const canDelete = isPrincipal || (isRescue && RESCUE_DELETE_ROLES.includes(pet.viewerRole ?? ''));
  const adoptedFrom = pet.adoptedFromOrganization;
  const isLost = pet.status === PET_STATUS.LOST;
  const cover = pet.multimedia[0]?.image?.url;
  const subtitle = [speciesLabel(pet.animal_type?.name), pet.animal_breed?.breed].filter(Boolean).join(' · ');
  const reportHref = pet.lostReport ? Routes.animals.detail(pet.lostReport.slug || pet.lostReport.id) : null;

  const handleFound = async () => {
    try {
      await markFound({ variables: { petId: pet.id } });
      await client.refetchQueries({ include: PET_REFETCH });
      setConfirmFound(false);
      sileo.success({ title: `¡Qué bueno que ${pet.name} volvió!`, description: 'Cerramos su reporte como «En familia».' });
    } catch (err) {
      sileo.error({ title: 'No se pudo cerrar el reporte', description: petErrorMessage(err) });
    }
  };

  const handleDelete = async () => {
    try {
      await deletePet({ variables: { id: pet.id } });
      setConfirmDelete(false);
      sileo.success({ title: isRescue ? `Borramos la ficha de ${pet.name}` : `Borramos a ${pet.name} de tu cartilla` });
      onBack();
      await client.refetchQueries({ include: isRescue ? ['RescuePets'] : ['MyPets'] });
    } catch (err) {
      sileo.error({ title: 'No se pudo borrar', description: petErrorMessage(err) });
    }
  };

  return (
    <div>
      {backButton}

      <motion.div
        className="space-y-4"
        variants={motionPrefs.list}
        initial={motionPrefs.reduce ? false : 'hidden'}
        animate="show"
      >
        <motion.section
          variants={motionPrefs.item}
          className="rounded-3xl border border-dash-line bg-dash-surface p-4 shadow-dash"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-dash-surface-2">
              {cover ? (
                <Image src={cover} alt={`Foto de ${pet.name}`} fill className="object-cover" sizes="112px" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-dash-faint">
                  <HugeiconsIcon icon={Image01Icon} size={28} strokeWidth={1.5} aria-hidden="true" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="break-words text-2xl font-bold tracking-[-0.03em] text-dash-ink">
                  {pet.name}
                </h2>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${PET_STATUS_BADGE[pet.status] ?? PET_STATUS_BADGE.active}`}>
                  {PET_STATUS_LABELS[pet.status] ?? pet.status}
                </span>
              </div>
              {subtitle ? <p className="mt-0.5 text-sm text-dash-muted">{subtitle}</p> : null}
              {adoptedFrom ? (
                <p className="mt-0.5 text-sm text-dash-muted">
                  Adoptado con{' '}
                  {adoptedFrom.slug ? (
                    <Link href={Routes.organizations.detail(adoptedFrom.slug)} className="font-semibold text-dash-ink hover:underline">
                      {adoptedFrom.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-dash-ink">{adoptedFrom.name}</span>
                  )}
                </p>
              ) : null}
              {pet.multimedia.length > 1 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {pet.multimedia.slice(1).map((photo) =>
                    photo.image?.url ? (
                      <div key={photo.id} className="relative h-14 w-14 overflow-hidden rounded-lg bg-dash-surface-2">
                        <Image src={photo.image.url} alt="" fill className="object-cover" sizes="56px" />
                      </div>
                    ) : null,
                  )}
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPet(true)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-dash-surface-2 px-4 text-sm font-semibold text-dash-ink hover:bg-dash-hover"
                >
                  <HugeiconsIcon icon={PencilEdit01Icon} size={16} strokeWidth={1.6} aria-hidden="true" />
                  Editar
                </button>
                {pet.status === PET_STATUS.ACTIVE && !isRescue ? (
                  <button
                    type="button"
                    onClick={() => setMarkingLost(true)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                  >
                    <HugeiconsIcon icon={Alert02Icon} size={16} strokeWidth={1.6} aria-hidden="true" />
                    Marcar como perdida
                  </button>
                ) : null}
                {isPrincipal && !isRescue && pet.status === PET_STATUS.ACTIVE ? (
                  <button
                    type="button"
                    onClick={() => setTransferring(true)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-dash-surface-2 px-4 text-sm font-semibold text-dash-ink hover:bg-dash-hover"
                  >
                    <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} size={16} strokeWidth={1.6} aria-hidden="true" />
                    Traspasar
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.6} aria-hidden="true" />
                    Borrar
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {isLost ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10">
              <p className="font-semibold text-red-800 dark:text-red-200">{pet.name} está reportada como perdida</p>
              <p className="mt-0.5 text-sm text-red-700 dark:text-red-300">
                Cuando regrese, avísanos para cerrar el reporte.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmFound(true)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <HugeiconsIcon icon={Home01Icon} size={16} strokeWidth={1.6} aria-hidden="true" />
                  Ya regresó a casa
                </button>
                {reportHref ? (
                  <Link
                    href={reportHref}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-red-200 bg-dash-surface px-4 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                  >
                    <HugeiconsIcon icon={Location01Icon} size={16} strokeWidth={1.6} aria-hidden="true" />
                    Ver reporte
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          <dl className="mt-4 grid gap-3 border-t border-dash-line pt-4 sm:grid-cols-2">
            <DataItem label="Sexo" value={sexLabel(pet.sex)} />
            <DataItem
              label={pet.birthday ? 'Nacimiento' : 'Edad'}
              value={
                pet.birthday
                  ? `${formatDay(pet.birthday)}${petAgeText(pet) ? ` (${petAgeText(pet)})` : ''}`
                  : petAgeText(pet)
              }
            />
            <DataItem label="Color" value={pet.color ?? ''} />
            <DataItem label="Peso" value={pet.weightKg ? `${Number(pet.weightKg)} kg` : ''} />
            <DataItem label="Esterilizada" value={PET_STERILIZED_LABELS[pet.sterilized ?? ''] ?? ''} />
            <DataItem label="Microchip" value={pet.microchipNumber ?? ''} />
            <DataItem label="Señas particulares" value={pet.distinctiveMarks ?? ''} wide />
          </dl>
        </motion.section>

        {isRescue && renderRescuePanel ? (
          <motion.div variants={motionPrefs.item}>{renderRescuePanel(pet)}</motion.div>
        ) : null}

        <motion.div variants={motionPrefs.item}>
          <HealthRecordList
            records={pet.healthRecords}
            onAdd={() => setRecord({ item: null })}
            onEdit={(item) => setRecord({ item })}
          />
        </motion.div>

        <motion.div variants={motionPrefs.item}>
          <ReminderList
            reminders={pet.reminders}
            onAdd={() => setReminder({ item: null })}
            onEdit={(item) => setReminder({ item })}
          />
        </motion.div>

        {isRescue ? null : (
          <motion.div variants={motionPrefs.item}>
            <FamilySection petId={pet.id} petName={pet.name} owners={pet.owners} userId={userId} onLeft={onBack} />
          </motion.div>
        )}
      </motion.div>

      <PetFormModal isOpen={editingPet} onClose={() => setEditingPet(false)} pet={pet} />
      <HealthRecordFormModal
        isOpen={Boolean(record)}
        onClose={() => setRecord(null)}
        petId={pet.id}
        petName={pet.name}
        record={record?.item}
      />
      <ReminderFormModal
        isOpen={Boolean(reminder)}
        onClose={() => setReminder(null)}
        petId={pet.id}
        reminder={reminder?.item}
      />
      <MarkLostModal isOpen={markingLost} onClose={() => setMarkingLost(false)} petId={pet.id} petName={pet.name} />
      {isPrincipal && !isRescue ? (
        <TransferPetModal isOpen={transferring} onClose={() => setTransferring(false)} pet={{ id: pet.id, name: pet.name }} />
      ) : null}

      <ConfirmModal
        isOpen={confirmFound}
        onClose={() => setConfirmFound(false)}
        onConfirm={handleFound}
        title={`¿${pet.name} ya regresó a casa?`}
        message="Cerraremos su reporte como «En familia» y su cartilla volverá a estar activa."
        confirmText="Sí, ya regresó"
        confirmButtonColor="blue"
        isLoading={markingFound}
      />
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title={`¿Borrar a ${pet.name}?`}
        message={
          isRescue
            ? 'Se borrarán su ficha, cartilla, recordatorios y fotos. Sus reportes públicos se conservan.'
            : 'Se borrarán su cartilla, recordatorios, fotos y familia. Sus reportes y citas se conservan.'
        }
        confirmText="Borrar"
        isLoading={deleting}
      />
    </div>
  );
}
