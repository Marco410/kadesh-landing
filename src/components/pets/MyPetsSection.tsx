"use client";

import { useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Image01Icon, Notification01Icon } from '@hugeicons/core-free-icons';
import { useUiMotion } from 'kadesh/components/shared/motion';
import PetDetail from './PetDetail';
import PetFormModal from './PetFormModal';
import { MY_PETS_QUERY, type MyPetsResponse, type MyPetsVariables } from './queries';
import { PET_STATUS, PET_STATUS_BADGE, PET_STATUS_LABELS } from './constants';
import { DUE_TONE_CLASS, dueTone, formatDay, petSubtitle, relativeDueLabel } from './utils';
import type { PetSummary } from './types';

/** Parámetro de la URL con la mascota abierta: `/perfil?tab=pets&pet=<id>`. */
export const PET_SEARCH_PARAM = 'pet';

function RegisterButton({ onClick }: { onClick: () => void }) {
  const motionPrefs = useUiMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={motionPrefs.tap}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
    >
      <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} aria-hidden="true" />
      Registrar mascota
    </motion.button>
  );
}

function PetCard({ pet, onOpen }: { pet: PetSummary; onOpen: () => void }) {
  const motionPrefs = useUiMotion();
  const cover = pet.multimedia[0]?.image?.url;
  const next = pet.reminders[0];
  const subtitle = petSubtitle(pet);
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileTap={motionPrefs.tap}
      className="flex w-full items-start gap-3 rounded-2xl border border-[#ececec] bg-white p-3 text-left transition-colors hover:border-kadesh-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-white/10 dark:bg-night-raised dark:hover:border-kadesh/40"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#e8edf3] dark:bg-[#2a3548]">
        {cover ? (
          <Image src={cover} alt="" fill className="object-cover" sizes="64px" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[#9aa3b2]">
            <HugeiconsIcon icon={Image01Icon} size={22} strokeWidth={1.5} aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="break-words font-semibold text-[#121212] dark:text-[#eef1f6]">{pet.name}</p>
          {pet.status !== PET_STATUS.ACTIVE ? (
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${PET_STATUS_BADGE[pet.status] ?? ''}`}>
              {PET_STATUS_LABELS[pet.status] ?? pet.status}
            </span>
          ) : null}
        </div>
        {subtitle ? <p className="mt-0.5 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">{subtitle}</p> : null}
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
  const motionPrefs = useUiMotion();
  const [registering, setRegistering] = useState(false);
  const openPetId = searchParams.get(PET_SEARCH_PARAM);

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
    <PetFormModal isOpen={registering} onClose={() => setRegistering(false)} onSaved={(id) => openPet(id)} />
  );

  if (loading && pets.length === 0) {
    return (
      <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
        {[1, 2].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-2xl bg-[#e6e9ef] dark:bg-white/10" />
        ))}
      </div>
    );
  }

  if (error && pets.length === 0) {
    return (
      <div className="rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised">
        <p className="font-semibold text-[#121212] dark:text-[#eef1f6]">No pudimos cargar tus mascotas</p>
        <p className="mt-1 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">Revisa tu conexión e intenta de nuevo.</p>
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
          className="flex flex-col items-start gap-3 rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised"
        >
          <p className="font-semibold text-[#121212] dark:text-[#eef1f6]">Aún no registras a tus mascotas</p>
          <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            Lleva su cartilla de vacunas y desparasitaciones, y te avisamos antes de cada fecha. Si un día se
            pierde, publicas su reporte en un paso con sus fotos y señas.
          </p>
          <RegisterButton onClick={() => setRegistering(true)} />
        </motion.div>
        {registerModal}
      </>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
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
