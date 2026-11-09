"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Image01Icon, Notification01Icon } from '@hugeicons/core-free-icons';
import { useProfileMotion } from 'kadesh/components/profile/motion';
import PetDetail from './PetDetail';
import PetFormModal from './PetFormModal';
import ReceivePetModal from './ReceivePetModal';
import { MY_PETS_QUERY, type MyPetsResponse, type MyPetsVariables } from './queries';
import { PET_STATUS, PET_STATUS_BADGE, PET_STATUS_LABELS } from './constants';
import { DUE_TONE_CLASS, dueTone, formatDay, petSubtitle, relativeDueLabel } from './utils';
import type { PetSummary } from './types';

/** Parámetro de la URL con la mascota abierta: `/perfil?tab=pets&pet=<id>`. */
export const PET_SEARCH_PARAM = 'pet';
/** Enlace para recibir una mascota con su código: `/perfil?tab=pets&codigo=7KQ2-M9XA`. */
export const PET_TRANSFER_CODE_PARAM = 'codigo';

function ReceiveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-dash-line px-4 text-sm font-semibold text-dash-ink transition-colors hover:bg-dash-hover"
    >
      Recibir con código
    </button>
  );
}

function RegisterButton({ onClick }: { onClick: () => void }) {
  const motionPrefs = useProfileMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={motionPrefs.tap}
      className="inline-flex min-h-11 items-center gap-1.5 px-4 text-sm font-semibold text-white rounded-full dash-grad-accent shadow-dash-accent transition-[transform,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash-accent-lift"
    >
      <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} aria-hidden="true" />
      Registrar mascota
    </motion.button>
  );
}

function PetCard({ pet, onOpen }: { pet: PetSummary; onOpen: () => void }) {
  const motionPrefs = useProfileMotion();
  const cover = pet.multimedia[0]?.image?.url;
  const next = pet.reminders[0];
  const subtitle = petSubtitle(pet);
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileTap={motionPrefs.tap}
      className="flex w-full items-start gap-3 rounded-[20px] border border-dash-line bg-dash-surface p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh shadow-dash transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-0.5 hover:shadow-dash-lift"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-dash-surface-2">
        {cover ? (
          <Image src={cover} alt="" fill className="object-cover" sizes="64px" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-dash-faint">
            <HugeiconsIcon icon={Image01Icon} size={22} strokeWidth={1.5} aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="break-words font-semibold text-dash-ink">{pet.name}</p>
          {pet.status !== PET_STATUS.ACTIVE ? (
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${PET_STATUS_BADGE[pet.status] ?? ''}`}>
              {PET_STATUS_LABELS[pet.status] ?? pet.status}
            </span>
          ) : null}
        </div>
        {subtitle ? <p className="mt-0.5 text-xs text-dash-muted">{subtitle}</p> : null}
        {next ? (
          <p className={`mt-1.5 flex items-start gap-1 text-xs font-semibold ${DUE_TONE_CLASS[dueTone(next.dueDate)]}`}>
            <HugeiconsIcon icon={Notification01Icon} size={14} strokeWidth={1.8} className="mt-px shrink-0" aria-hidden="true" />
            <span className="break-words">
              {next.title} · {formatDay(next.dueDate)} ({relativeDueLabel(next.dueDate).toLowerCase()})
            </span>
          </p>
        ) : null}
      </div>
    </motion.button>
  );
}

/** Pestaña Mascotas del perfil: la lista y, con `?pet=<id>`, la cartilla de una. */
export default function MyPetsSection({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const motionPrefs = useProfileMotion();
  const [registering, setRegistering] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [receiveCode, setReceiveCode] = useState<string | null>(null);
  const openPetId = searchParams.get(PET_SEARCH_PARAM);
  const codeParam = searchParams.get(PET_TRANSFER_CODE_PARAM);

  // El enlace compartido abre «Recibir con código» con el código escrito; se quita de la URL para
  // que al recargar no se vuelva a abrir.
  useEffect(() => {
    if (!codeParam) return;
    setReceiveCode(codeParam);
    setReceiving(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete(PET_TRANSFER_CODE_PARAM);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [codeParam, pathname, router, searchParams]);

  const { data, loading, error } = useQuery<MyPetsResponse, MyPetsVariables>(MY_PETS_QUERY, {
    variables: { where: { owners: { some: { user: { id: { equals: userId } } } } } },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const openPet = (petId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (petId) params.set(PET_SEARCH_PARAM, petId);
    else params.delete(PET_SEARCH_PARAM);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (openPetId) {
    return <PetDetail petId={openPetId} userId={userId} onBack={() => openPet(null)} />;
  }

  const pets = data?.pets ?? [];
  const registerModal = (
    <>
      <PetFormModal isOpen={registering} onClose={() => setRegistering(false)} onSaved={(id) => openPet(id)} />
      <ReceivePetModal
        isOpen={receiving}
        onClose={() => {
          setReceiving(false);
          setReceiveCode(null);
        }}
        initialCode={receiveCode}
        onReceived={(id) => openPet(id)}
      />
    </>
  );
  const openReceive = () => {
    setReceiveCode(null);
    setReceiving(true);
  };

  if (loading && pets.length === 0) {
    return (
      <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
        {[1, 2].map((item) => (
          <div key={item} className="h-24 dash-shimmer rounded-3xl" />
        ))}
      </div>
    );
  }

  if (error && pets.length === 0) {
    return (
      <div className="rounded-3xl border border-dash-line bg-dash-surface p-5 shadow-dash">
        <p className="font-semibold text-dash-ink">No pudimos cargar tus mascotas</p>
        <p className="mt-1 text-sm text-dash-muted">Revisa tu conexión e intenta de nuevo.</p>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <>
        <motion.div
          variants={motionPrefs.item}
          initial={motionPrefs.reduce ? false : 'hidden'}
          animate="show"
          className="flex flex-col items-start gap-3 rounded-3xl border border-dash-line bg-dash-surface p-5 shadow-dash"
        >
          <p className="font-semibold text-dash-ink">Aún no registras a tus mascotas</p>
          <p className="text-sm text-dash-muted">
            Lleva su cartilla de vacunas y desparasitaciones, y te avisamos antes de cada fecha. Si un día se
            pierde, publicas su reporte en un paso con sus fotos y señas.
          </p>
          <div className="flex flex-wrap gap-2">
            <RegisterButton onClick={() => setRegistering(true)} />
            <ReceiveButton onClick={openReceive} />
          </div>
        </motion.div>
        {registerModal}
      </>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <ReceiveButton onClick={openReceive} />
        <RegisterButton onClick={() => setRegistering(true)} />
      </div>
      <motion.ul
        className="grid gap-3 sm:grid-cols-2"
        variants={motionPrefs.list}
        initial={motionPrefs.reduce ? false : 'hidden'}
        animate="show"
      >
        {pets.map((pet) => (
          <motion.li key={pet.id} variants={motionPrefs.item}>
            <PetCard pet={pet} onOpen={() => openPet(pet.id)} />
          </motion.li>
        ))}
      </motion.ul>
      {registerModal}
    </div>
  );
}
